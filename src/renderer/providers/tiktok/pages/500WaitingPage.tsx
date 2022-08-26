/**
 * TODO: For TikTok
 *
 * @module
 */
import { faLoader } from "@fortawesome/pro-duotone-svg-icons";
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useState } from "react";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import Modal from "renderer/components/Modal";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";
import HelpButton from "renderer/providers/tiktok/components/HelpButton";
import { useNavigation } from "../../../contexts";

export default function WaitingPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();
  const [modal1IsOpen, setModal1IsOpen] = useState(false);
  const [modal2IsOpen, setModal2IsOpen] = useState(false);

  const footerSlots: FooterSlots = {
    center: [
      <Button
        key="1"
        theme="text"
        startIcon={faAngleLeft}
        onClick={() => {
          history.push(getPreviousPage("path"));
        }}
      >
        Zurück
      </Button>,
      <Button
        key="2"
        endIcon={faAngleRight}
        onClick={() => {
          history.push(getNextPage("path"));
        }}
      >
        Weiter
      </Button>,
    ],
  };

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
            bereitstellt. Es ist deshalb wichtig, dass du die DataSkop-App im
            Hintergrund geöffnet hältst und nicht schließt. Du erhältst eine
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
          <div className="mt-auto mb-14 text-base relative">
            <span className="absolute inset-x-0 top-0 animate-fade1">
              Du erhältst eine Benachrichtigung, sobald es weitergehen kann.
            </span>
            <span className="absolute inset-x-0 top-0 animate-fade2">
              Du kannst die App schließen, aber sie muss im Hintergrund geöffnet
              bleiben.
            </span>
          </div>
        </Content>
      </WizardLayout>
    </>
  );
}
