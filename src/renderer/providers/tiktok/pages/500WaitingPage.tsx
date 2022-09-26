/**
 * TODO: For TikTok
 *
 * @module
 */

/*

  Hook "useStatus":
  - currentStatus
  -


*/

import { faLoader } from "@fortawesome/pro-regular-svg-icons";
import { faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { Transition } from "@headlessui/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import Modal from "renderer/components/Modal";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useConfig, useScraping } from "renderer/contexts";
import { currentDelay } from "renderer/lib/delay";
import Content from "renderer/providers/tiktok/components/Content";
import HelpButton from "renderer/providers/tiktok/components/HelpButton";
import { getStatus, STATUS } from "renderer/providers/tiktok/lib/status";

const getStatusTexts = (statusKey: keyof typeof STATUS): string[] | void => {
  switch (statusKey) {
    case "monitoring-pending":
    case "data-request-success":
      return [
        "DSGVO-Daten angefordert",
        "Es kann eine Weile dauern, bis TikTok die Daten bereitstellt.",
      ];

    case "monitoring-download-success":
      return [
        "DSGVO-Daten werden verarbeitet",
        "Die DataSkop-App hat deine DSGVO-Daten heruntergeladen und verarbeitet sie nun.",
      ];

    default:
      break;
  }
};

export default function WaitingPage(): JSX.Element {
  const history = useHistory();
  const {
    state: { scrapingProgress },
    dispatch,
  } = useScraping();
  const {
    state: { isDebug },
  } = useConfig();

  const [footerButtonsAreVisible, setFooterButtonsAreVisible] = useState(true);
  const [modal1IsOpen, setModal1IsOpen] = useState(false);
  const [modal2IsOpen, setModal2IsOpen] = useState(false);
  const [statusKey, setStatusKey] = useState<string | null>(null);

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
      if (newStatus === statusKey) return;

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

      setStatusKey(newStatus);
    })();
  }, [scrapingProgress.value]);

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
      ],
    }),
    [footerButtonsAreVisible],
  );

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
      <WizardLayout className="text-center" footerSlots={footerSlots}>
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
                Du kannst die App schließen, aber sie muss im Hintergrund
                geöffnet bleiben.
              </div>
            </span>
          </div>
        </Content>
      </WizardLayout>
    </>
  );
}
