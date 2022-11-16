/**
 * TODO: For TikTok
 *
 * @module
 */
import { faCircleUser } from "@fortawesome/pro-light-svg-icons";
import { faAngleLeft } from "@fortawesome/pro-solid-svg-icons";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import Modal from "renderer/components/Modal";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";
import HelpButton from "renderer/providers/tiktok/components/HelpButton";
import { useNavigation } from "../../../contexts";

export default function BeforeLoginPage(): JSX.Element {
  const { getPreviousPage } = useNavigation();
  const [modal1IsOpen, setModal1IsOpen] = useState(false);
  const [modal2IsOpen, setModal2IsOpen] = useState(false);
  const history = useHistory();

  const footerSlots: FooterSlots = {
    center: [
      <Button
        key="1"
        startIcon={faAngleLeft}
        theme="text"
        onClick={() => {
          history.push(getPreviousPage("path"));
        }}
      >
        Zurück
      </Button>,
      <Button
        key="2"
        onClick={() => {
          history.push("/provider_login");
        }}
      >
        Anmelden
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
          <h1 className="hl-2xl mb-4">Was sind DSGVO-Daten?</h1>
          <p>
            DSGVO-Daten sind die Daten, die eine Plattform über Dich speichert
            (sogenannte personenbezogene Daten). Das können z.B. Informationen
            darüber sein, wem Du folgst, was Du likest, oder nach was Du gesucht
            hast. Laut DSGVO (Datenschutz-Grundverordnung) hast Du ein
            Auskunftsrecht: die Plattform muss Dir sagen, welche Daten dort über
            Dich gespeichert oder verarbeitet werden.{" "}
            <a
              href="https://dataskop.net"
              target="_blank"
              rel="noreferrer"
              className="text-east-blue-700 font-semibold"
            >
              Mehr Informationen
            </a>
          </p>
        </div>
      </Modal>
      <Modal
        theme="tiktok"
        isOpen={modal2IsOpen}
        closeModal={() => setModal2IsOpen(false)}
      >
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Was geschieht mit meinen Daten? </h1>
          <p>
            Bevor Du Deine Daten spendest, entfernen wir sensible und nicht für
            die Analyse relevante Informationen. Das sind z.B. die Nutzernamen
            deiner Follower, den Text deiner Kommentare oder Inhalte von Chats.
            Deine bereinigten Daten werden Algorithmwatch und ggf.
            Partnerinstitutionen als Datenspende zur Verfügung gestellt.{" "}
            <a
              href="https://dataskop.net"
              target="_blank"
              rel="noreferrer"
              className="text-east-blue-700 font-semibold"
            >
              Mehr Informationen
            </a>
          </p>
        </div>
      </Modal>
      <WizardLayout className="text-center" footerSlots={footerSlots}>
        <Content title="Bei TikTok anmelden" icon={faCircleUser}>
          <p>
            Nach dem Login wird die App deine DSGVO-Daten für dich automatisch
            beantragen und verarbeiten. Du erhältst eine Benachrichtigung,
            sobald alles fertig ist.
          </p>
          <div className="mt-14 space-y-4 lg:space-y-0 lg:space-x-6">
            <HelpButton onClick={() => setModal1IsOpen(true)}>
              Was sind DSGVO-Daten?
            </HelpButton>
            <HelpButton onClick={() => setModal2IsOpen(true)}>
              Was geschieht mit meinen Daten?
            </HelpButton>
          </div>
          <div className="absolute bottom-4 inset-x-4">
            <Link
              to="/tiktok/import_data_export"
              className="text-east-blue-800 font-semibold hover:underline text-base"
            >
              Ich habe die DSGVO-Daten bereits.
            </Link>
          </div>
        </Content>
      </WizardLayout>
    </>
  );
}
