/**
 * Manage different waiting situations
 *
 * @module
 */

import { faLoader } from "@fortawesome/pro-regular-svg-icons";
import { faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { Transition } from "@headlessui/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router";
import AdvancedMenu from "renderer/components/admin/AdvancedMenu";
import { Button } from "renderer/components/Button";
import Modal from "renderer/components/Modal";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useConfig, useScraping } from "renderer/contexts";
import { currentDelay } from "renderer/lib/delay";
import Content from "renderer/providers/tiktok/components/Content";
import HelpButton from "renderer/providers/tiktok/components/HelpButton";
import StatusContent from "../components/StatusContent";
import { getStatus, isMonitoringPending, STATUS } from "../lib/status";

const PendingContent = () => {
  const [modal1IsOpen, setModal1IsOpen] = useState(false);
  const [modal2IsOpen, setModal2IsOpen] = useState(false);

  return (
    <>
      <Modal
        theme="tiktok"
        isOpen={modal1IsOpen}
        closeModal={() => setModal1IsOpen(false)}
      >
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Wie lange dauert das?</h1>
          <p className="">
            Es kann bis zu vier Tage dauern, bis TikTok die DSGVO-Daten
            bereitstellt. Es ist deshalb wichtig, dass du die DataSkop-App nicht
            schließt und sie im Hintergrund geöffnet bleibt. Du erhältst eine
            Benachrichtigung, sobald es weitergehen kann.
          </p>
        </div>
      </Modal>
      <Modal
        theme="tiktok"
        isOpen={modal2IsOpen}
        closeModal={() => setModal2IsOpen(false)}
      >
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Was kommt danach?</h1>
          <p className="">
            Wenn die DataSkop-App die Daten heruntergeladen und verarbeitet hat,
            werden dir verschiedene interaktive Grafiken präsentiert, die dein
            Nutzungsverhalten auf TikTok visualisieren und einordnen.
          </p>
        </div>
      </Modal>
      <Content
        title="DSGVO-Daten angefordert"
        icon={faLoader}
        iconSpinning
        theme="tiktokAnimated"
      >
        <p>
          Bitte habe noch etwas Geduld. Deine DSGVO-Daten wurden angefordert,
          aber TikTok bietet sie noch nicht zum Download an.
        </p>
        <div className="mt-14 space-x-6">
          <HelpButton onClick={() => setModal1IsOpen(true)}>
            Wie lange dauert das?
          </HelpButton>
          <HelpButton onClick={() => setModal2IsOpen(true)}>
            Was kommt danach?
          </HelpButton>
        </div>
        <div className="mt-24 text-base font-medium relative">
          <span className="absolute inset-0 animate-fade1 flex items-center justify-center">
            <div className="rounded-full bg-white/50 px-5 py-4">
              Du erhältst eine Benachrichtigung, sobald es weitergehen kann.
            </div>
          </span>
          <span className="absolute inset-0 animate-fade2 flex items-center justify-center">
            <div className="rounded-full bg-white/50 px-5 py-4">
              Du kannst die App schließen, aber sie muss im Hintergrund geöffnet
              bleiben.
            </div>
          </span>
        </div>
      </Content>
    </>
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

  const openSurvey = () => {
    // TODO: to be implemented
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
          show={footerButtonsAreVisible}
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
    [footerButtonsAreVisible],
  );

  window.electron.log.info("Status", status);

  if (status === null) return <div />;

  return (
    <>
      <WizardLayout className="text-center" footerSlots={footerSlots}>
        {/* scraping-done: Keine Anzeige notwendig */}
        {isMonitoringPending(status) && <PendingContent />}
        {[
          "monitoring-download-action-required",
          "download-action-required",
        ].includes(status) && (
          <StatusContent
            title="Bitte die Daten herunterladen"
            body="Ihre Hilfe ist notwendig um die Daten herunterladen."
            fancyNotificationText
          />
        )}
        {[
          "monitoring-download-success",
          "download-success",
          "files-imported",
        ].includes(status) && (
          <StatusContent
            title="Scraping dauert an"
            body="Scraping dauert an"
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
            body="Bitte gehe auf tiktok.com und lade dir die Daten da runter um sie anschließen zu importieren."
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
