import { faLoader, IconDefinition } from "@fortawesome/pro-regular-svg-icons";
import { useState } from "react";
import { Button } from "renderer/components/Button";
import Modal from "renderer/components/Modal";
import { useConfig } from "renderer/contexts";
import HelpButton from "renderer/providers/tiktok/components/HelpButton";
import { addStatusReset } from "../lib/status";

import Content from "./Content";

const StatusContent = ({
  title,
  body,
  icon = faLoader,
  helpButtons,
  fancyNotificationText,
}: {
  title: string;
  body: string;
  icon?: IconDefinition;
  helpButtons?: boolean;
  fancyNotificationText?: boolean;
}) => {
  const {
    state: { isMac },
  } = useConfig();

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

      <Content title={title} icon={icon} iconSpinning theme="tiktokAnimated">
        <p>{body}</p>

        {helpButtons && (
          <div className="mt-14 space-x-6">
            <HelpButton onClick={() => setModal1IsOpen(true)}>
              Wie lange dauert das?
            </HelpButton>
            <HelpButton onClick={() => setModal2IsOpen(true)}>
              Was kommt danach?
            </HelpButton>
          </div>
        )}

        {fancyNotificationText && (
          <div className="mt-24 text-base font-medium relative whitespace-nowrap">
            <span className="absolute inset-0 animate-fade1 flex items-center justify-center">
              <div className="rounded-full bg-white/50 px-5 py-4">
                Du erhältst eine Benachrichtigung, sobald es weitergehen kann.
              </div>
            </span>
            <span className="absolute inset-0 animate-fade2 flex items-center justify-center">
              <div className="rounded-full bg-white/50 px-5 py-4">
                {`Du kannst das Fenster ${
                  isMac ? "schließen" : "minimieren"
                }, aber die App muss im Hintergrund geöffnet bleiben.`}
              </div>
            </span>
          </div>
        )}

        <div>
          <Button
            onClick={async () => {
              window.electron.log.info("Resetting state and restarting app");
              await addStatusReset();
              window.electron.ipc.invoke("restart");
            }}
          >
            Reset (TODO: Improve design)
          </Button>
        </div>
      </Content>
    </>
  );
};

export default StatusContent;
