/**
 * Manage different waiting situations
 *
 * @module
 */

import { faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { Transition } from "@headlessui/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import AdvancedMenu from "renderer/components/admin/AdvancedMenu";
import { Button } from "renderer/components/Button";
import Modal from "renderer/components/Modal";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useConfig, useScraping } from "renderer/contexts";
import { currentDelay } from "renderer/lib/delay";
import { Survey } from "renderer/providers/tiktok/components/survey/Survey";
import { SurveyProvider, useSurvey } from "renderer/providers/tiktok/contexts";
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
    state: { isScrapingFinished },
    dispatch,
  } = useScraping();
  const {
    state: { isDebug },
  } = useConfig();

  const [footerButtonsAreVisible, setFooterButtonsAreVisible] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [surveyModalIsOpen, setSurveyModalIsOpen] = useState(false);
  const [surveyValues, setSurveyValues] = useState();
  const [surveyIsComplete, setSurveyIsComplete] = useState(false);

  const openSurvey = () => {
    setSurveyModalIsOpen(true);
  };

  const updateSurveyValues = (isComplete: boolean, value: any) => {
    setSurveyValues(value);
    setSurveyIsComplete(isComplete);
    console.warn("values updated", value);
  };

  const handleDownloadActionRequired = async () => {
    dispatch({
      type: "set-attached",
      attached: true,
      visible: true,
    });

    await currentDelay("longer");

    dispatch({
      type: "start-scraping",
      filterSteps: (x) => x.slug === "tt-data-export-monitoring",
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

  useEffect(() => {
    (async () => {
      // Wait until new status is persisted to the db
      await currentDelay();
      const newStatus = await getStatus();
      window.electron.log.info(
        `Setting new status in waiting page ${newStatus}`,
      );

      if (newStatus === status) return;

      if (newStatus === "scraping-done") {
        history.push("/tiktok/waiting_done");
        return;
      }

      if (newStatus === "monitoring-download-action-required") {
        handleDownloadActionRequired();
      }

      if (newStatus === "download-success") {
        handleDownloadSuccess();
      }

      setStatus(newStatus);
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
            <Button className="min-w-[6rem]" onClick={openSurvey}>
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
          <Button
            key="1"
            theme="text"
            endIcon={faAngleRight}
            onClick={() => {
              history.push("/tiktok/waiting_done");
            }}
          >
            DEBUG ONLY: Weiter
          </Button>
        ),
        isDebug && (
          <AdvancedMenu
            key="2"
            menuLabel="DEBUG only: Set Status"
            menuItems={Object.keys(STATUS).map((x) => ({
              key: x,
              label: x,
              click: () => setStatus(x),
            }))}
            onItemClicked={undefined}
          />
        ),
      ],
    }),
    [footerButtonsAreVisible, surveyIsComplete],
  );

  window.electron.log.info("Status", status);

  if (status === null) return <div />;

  return (
    <>
      <SurveyProvider questions={questions}>
        <SurveyModal
          isOpen={surveyModalIsOpen}
          toggle={() => setSurveyModalIsOpen((oldState) => !oldState)}
          onChange={updateSurveyValues}
          isComplete={surveyIsComplete}
          setIsComplete={setSurveyIsComplete}
        />
      </SurveyProvider>

      <WizardLayout className="text-center" footerSlots={footerSlots}>
        {/* scraping-done: Keine Anzeige notwendig */}
        {isStatusPending(status) && (
          <StatusContent
            title="DSGVO-Daten angefordert"
            body="Bitte habe noch etwas Geduld. Deine DSGVO-Daten wurden angefordert, aber TikTok bietet sie noch nicht zum Download an."
            fancyNotificationText
          />
        )}
        {[
          "monitoring-download-action-required",
          "download-action-required",
        ].includes(status) && (
          <StatusContent
            title="Bitte die Daten herunterladen"
            body="Ihre Hilfe ist notwendig um die Daten herunterladen."
            helpButtons
            fancyNotificationText
          />
        )}
        {[
          "monitoring-download-success",
          "download-success",
          "files-imported",
        ].includes(status) && (
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
        ].includes(status) && (
          <StatusContent
            title="Fehler beim Download"
            body="Wir konnten deine TikTok-Daten nicht herunterladen. Besuche alternativ  Tiktok.com in deinem Browser und lade dir deine DSGVO-Daten in deinem Benutzerkonto herunter. Anschließend kannst du sie in der Dateskop-App importieren."
            fancyNotificationText
          />
        )}
        {["monitoring-download-expired"].includes(status) && (
          <StatusContent
            title="Download abgelaufen"
            body="Bitte neu beantragen."
            fancyNotificationText
          />
        )}
        {["monitoring-captcha"].includes(status) && (
          <StatusContent
            title="Captcha"
            body="Wir überprüden den Status später."
            fancyNotificationText
          />
        )}
        {["data-error-request"].includes(status) && (
          <StatusContent
            title="DSGVO-Anfrage fehlgeschlagen"
            body="Wir konnten den DSGVO-Export nicht beantragen. Bitte logge dich auf tiktok.com ein und beantrage dort die Daten. Eine Anleitung findest du auf unserer Homepage."
            fancyNotificationText
          />
        )}
        {[
          "monitoring-error-nothing-found",
          "monitoring-error-tab-not-found",
          "data-error-tab-not-found",
          "status-not-available",
        ].includes(status) && (
          <StatusContent
            title="Fehler"
            body="Es gibt ein Fehler unserseits."
            fancyNotificationText
          />
        )}
      </WizardLayout>
    </>
  );
}
