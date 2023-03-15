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
import Content from "renderer/components/Content";
import HelpButton from "renderer/components/HelpButton";
import Modal from "renderer/components/Modal";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useNavigation } from "../../../contexts";

const BeforeLoginPage = (): JSX.Element => {
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
            DSGVO-Daten sind Daten, die eine Plattform über dich speichert
            (sogenannte personenbezogene Daten). Das können z.B. Informationen
            darüber sein, wem du folgst, was du likst oder wonach du gesucht
            hast. Laut DSGVO (Datenschutz-Grundverordnung) hast du ein
            Auskunftsrecht: Die Plattform muss dir sagen, welche Daten dort über
            dich gespeichert oder verarbeitet werden.{" "}
            <a
              href="https://dataskop.net/faq/"
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
            Bevor du deine Daten spendest, entfernen wir sensible und nicht für
            die Analyse relevante Informationen. Das sind zum Beispiel die
            Nutzernamen deiner Follower, deine Kommentare oder den Textinhalt in
            Chats. Deine bereinigten Daten werden AlgorithmWatch und
            Partnerinstitutionen als Datenspende zur Verfügung gestellt.{" "}
            <a
              href="https://dataskop.net/tiktok-daten/"
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
            beantragen. Du erhältst eine Benachrichtigung, sobald es weiter
            geht. Wir speichern deine Login-Daten nicht.
          </p>
          <div className="mt-14 space-y-4 lg:space-y-0 lg:space-x-6">
            <HelpButton onClick={() => setModal1IsOpen(true)}>
              Was sind DSGVO-Daten?
            </HelpButton>
            <HelpButton onClick={() => setModal2IsOpen(true)}>
              Was geschieht mit meinen Daten?
            </HelpButton>
          </div>
          <div className="absolute bottom-5 inset-x-5">
            <Link
              to="/tiktok/import_data_export"
              className="text-east-blue-800 font-semibold hover:underline text-xl"
            >
              Ich habe die DSGVO-Daten bereits.
            </Link>
          </div>
        </Content>
      </WizardLayout>
    </>
  );
};

export default BeforeLoginPage;
