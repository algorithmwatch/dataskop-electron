/**
 * Manage different waiting situations
 *
 * FIXME: The survey should get encapsulated into an component.
 *
 * @module
 */

import { Transition } from "@headlessui/react";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import AdvancedMenu from "renderer/components/admin/AdvancedMenu";
import { Button } from "renderer/components/Button";
import Modal from "renderer/components/Modal";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useConfig, useScraping } from "renderer/contexts";
import dayjs from "renderer/lib/dayjs";
import { addScrapingResult, getScrapingResults } from "renderer/lib/db";
import { currentDelay } from "renderer/lib/delay";
import {
  SurveyProvider,
  useSurvey,
} from "renderer/providers/tiktok/components/survey/context";
import { Survey } from "renderer/providers/tiktok/components/survey/Survey";
import StatusContent from "../components/StatusContent";
import { questions } from "../components/survey/questions";
import { getStatus, isStatusPending, STATUS } from "../lib/status";

const SurveyModal = ({
  isOpen,
  toggle,
  onChange,
  isComplete,
  setIsComplete,
}: {
  isOpen: boolean;
  toggle: () => void;
  onChange: (isComplete: boolean, value: any) => void;
  isComplete: boolean;
  setIsComplete: (val: boolean) => void;
}) => {
  const { answers, compileResult } = useSurvey();

  useEffect(() => {
    const result = compileResult();
    onChange(isComplete, result);
  }, [answers]);

  return (
    <Modal
      theme="tiktokSurvey"
      isOpen={isOpen}
      closeModal={toggle}
      buttons={[]}
    >
      <Survey
        isComplete={isComplete}
        setIsComplete={setIsComplete}
        close={toggle}
      />
    </Modal>
  );
};

export default function WaitingPage(): JSX.Element {
  const history = useHistory();
  const {
    state: { isScrapingFinished, isScrapingStarted },
    dispatch,
  } = useScraping();
  const {
    state: { isDebug, userConfig },
    dispatch: configDispatch,
  } = useConfig();

  const [footerButtonsAreVisible, setFooterButtonsAreVisible] = useState(true);
  const [status, setStatus] = useState({
    status: "loading...",
    updatedAt: dayjs(),
  });

  const [surveyModalIsOpen, setSurveyModalIsOpen] = useState(false);
  const [surveyValues, setSurveyValues] = useState();
  const [surveyIsComplete, setSurveyIsComplete] = useState(false);

  useEffect(() => {
    // Save survey values to disk when the survey modal has closed
    if (!surveyModalIsOpen && surveyValues != null) {
      addScrapingResult(
        "no-session",
        0,
        {
          success: true,
          slug: "survey",
          fields: {
            values: surveyValues,
            complete: surveyIsComplete,
          },
        },
        true,
      );
    }
  }, [surveyModalIsOpen]);

  useEffect(() => {
    (async () => {
      const res = await getScrapingResults();
      const isDone = res.filter(
        (x) => x.slug && x.slug === "survey" && x.fields.complete,
      );
      if (isDone.length) {
        window.electron.log.info(
          "Not showing survey since it was already completed",
        );
        setSurveyIsComplete(true);
      }
    })();
  }, []);

  const handleDownloadActionRequired = async () => {
    dispatch({
      type: "set-attached",
      attached: true,
      visible: true,
    });

    await currentDelay("longer");

    dispatch({
      type: "start-scraping",
      filterSteps: (x) => x.slug === "tt-data-export",
    });
  };

  const handleDownloadSuccess = async () => {
    dispatch({
      type: "set-attached",
      attached: true,
      visible: false,
    });

    await currentDelay("longer");

    dispatch({
      type: "start-scraping",
      filterSteps: (x) => x.type === "scraping",
    });
  };

  const handleFileImported = async () => {
    dispatch({ type: "set-attached", attached: true, visible: false });
    await currentDelay("longer");
    dispatch({
      type: "start-scraping",
      filterSteps: (x) => x.type === "scraping",
    });
  };

  const handlePending = async () => {
    // Don't process if scraping is already started
    if (isScrapingStarted) {
      window.electron.log.info(
        "Not checking for GDPR status because scraping has already started.",
      );
      return;
    }

    window.electron.log.info("Check for GDPR status.");

    dispatch({ type: "set-attached", attached: true, visible: false });
    await currentDelay();
    dispatch({
      type: "start-scraping",
      filterSteps: (x) => x.slug === "tt-data-export",
    });
  };

  useEffect(() => {
    (async () => {
      // Wait until new status is persisted to the db
      await currentDelay();
      const newStatus = await getStatus();

      // Abort when there is no status update
      if (_.isEqual(status, newStatus)) return;

      window.electron.log.info(
        `Setting new status in waiting page: ${newStatus.status}`,
      );

      setStatus(newStatus);

      // On status changes, do some logic

      if (
        isScrapingFinished &&
        newStatus.status !== "monitoring-download-action-required" &&
        newStatus.status !== "download-success" &&
        newStatus.status !== "monitoring-download-success"
      ) {
        window.electron.log.info(`Data gathering is finished. Cleaning up.`);
        dispatch({ type: "reset-scraping" });
        dispatch({ type: "set-attached", attached: false, visible: false });

        if (userConfig && userConfig.monitoring) {
          window.electron.log.info(`Monitoring step from tray is done`);
          configDispatch({
            type: "set-user-config",
            newValues: { monitoring: false },
          });
          await window.electron.ipc.invoke("monitoring-done");
        }
        await currentDelay();
      }

      if (newStatus.status === "scraping-done") {
        history.push("/tiktok/waiting_done");
        return;
      }

      if (newStatus.status === "monitoring-download-action-required") {
        handleDownloadActionRequired();
      }

      if (
        newStatus.status === "download-success" ||
        newStatus.status === "monitoring-download-success"
      ) {
        handleDownloadSuccess();
      }

      if (newStatus.status === "files-imported") {
        handleFileImported();
      }

      if (isStatusPending(newStatus.status)) {
        if (dayjs().diff(newStatus.updatedAt, "minute") > 1) {
          handlePending();
        } else {
          window.electron.log.info(
            "Not checking for status because the last status was set recently.",
          );
        }
      }
    })();
  }, [isScrapingFinished]);

  const footerSlots: FooterSlots = useMemo(
    () => ({
      center: [
        <Transition
          key="1"
          show={footerButtonsAreVisible && !surveyIsComplete}
          appear
          enter="transition-opacity duration-1000"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="font-bold mb-4 text-xl -mt-8 text-center">
            Dürfen wir dir ein paar Fragen stellen?
          </div>
          <div className="flex items-center justify-center space-x-4">
            <Button
              className="min-w-[6rem]"
              onClick={() => setSurveyModalIsOpen(true)}
            >
              Ja
            </Button>
            <Button
              className="min-w-[6rem]"
              theme="outline"
              onClick={() => setFooterButtonsAreVisible(false)}
            >
              Nein
            </Button>
          </div>
        </Transition>,
      ],
      end: [
        isDebug && (
          <AdvancedMenu
            key="2"
            menuLabel="DEBUG only: Set Status"
            menuItems={Object.keys(STATUS).map((x) => ({
              key: x,
              label: x,
              click: () => setStatus({ status: x, updatedAt: dayjs() }),
            }))}
            onItemClicked={undefined}
          />
        ),
      ],
    }),
    [footerButtonsAreVisible, surveyIsComplete],
  );

  const statusMemo = useMemo(
    () => (
      <WizardLayout className="text-center" footerSlots={footerSlots}>
        {/* scraping-done: Keine Anzeige notwendig */}
        {isStatusPending(status.status) && (
          <StatusContent
            title="DSGVO-Daten angefordert"
            body="Bitte habe noch etwas Geduld. Deine DSGVO-Daten wurden angefordert, aber TikTok bietet sie noch nicht zum Download an."
            helpButtons
            fancyNotificationText
          />
        )}
        {[
          "monitoring-download-action-required",
          "download-action-required",
        ].includes(status.status) && (
          <StatusContent
            title="Aktion erforderlich"
            body="Deine Hilfe ist erforderlich, um die Daten herunterzuladen."
          />
        )}
        {[
          "monitoring-download-success",
          "download-success",
          "files-imported",
        ].includes(status.status) && (
          <StatusContent
            title="Daten werden verarbeitet"
            body="Es dauert nicht mehr lange! Deine TikTok-Daten wurden heruntergeladen und werden nun verarbeitet."
            helpButtons
            fancyNotificationText
          />
        )}
        {[
          "monitoring-download-error",
          "monitoring-download-error-timeout",
          "download-error",
          "download-error-timeout",
        ].includes(status.status) && (
          <StatusContent
            title="Fehler beim Download"
            body="Wir konnten deine TikTok-Daten nicht herunterladen. Besuche Tiktok.com im Browser und lade dir die DSGVO-Daten in deinem Benutzerkonto herunter. Anschließend kannst du sie in der DataSkop-App importieren."
          />
        )}
        {["monitoring-download-expired"].includes(status.status) && (
          <StatusContent
            title="Download abgelaufen"
            body="Der Download für deine DSGVO-Daten ist abgelaufen. Bitte starte die App erneut und beantrage ihn noch einmal."
          />
        )}
        {[
          "error-captcha-required",
          "data-pending-error-unable-to-check",
        ].includes(status.status) && (
          // duplicate default messsage
          <StatusContent
            title="DSGVO-Daten angefordert"
            body="Bitte habe noch etwas Geduld. Deine DSGVO-Daten wurden angefordert, aber TikTok bietet sie noch nicht zum Download an."
            helpButtons
            fancyNotificationText
          />
        )}
        {["data-error-request"].includes(status.status) && (
          <StatusContent
            title="DSGVO-Anfrage fehlgeschlagen"
            body="Wir konnten deine DSGVO-Daten nicht beantragen. Besuche Tiktok.com im Browser und lade dir die DSGVO-Daten in deinem Benutzerkonto herunter. Anschließend kannst du sie in der DataSkop-App importieren."
          />
        )}
        {[
          "monitoring-error-nothing-found",
          "monitoring-error-tab-not-found",
          "data-error-tab-not-found",
          "status-not-available",
        ].includes(status.status) && (
          <StatusContent
            title="Fehler beim Download"
            body="Wir konnten den Status deines DSGVO-Downloads nicht überprüfen. Besuche Tiktok.com im Browser und lade dir die DSGVO-Daten in deinem Benutzerkonto herunter. Anschließend kannst du sie in der DataSkop-App importieren."
          />
        )}
      </WizardLayout>
    ),
    [status, footerButtonsAreVisible, surveyIsComplete],
  );

  return (
    <>
      <SurveyProvider questions={questions}>
        <SurveyModal
          isOpen={surveyModalIsOpen}
          toggle={() => {
            setSurveyModalIsOpen((oldState) => {
              return !oldState;
            });
          }}
          onChange={(isComplete: boolean, value: any) => {
            setSurveyValues(value);
            setSurveyIsComplete(isComplete);
          }}
          isComplete={surveyIsComplete}
          setIsComplete={setSurveyIsComplete}
        />
      </SurveyProvider>

      {statusMemo}
    </>
  );
}
