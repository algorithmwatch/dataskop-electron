/**
 * TODO: For TikTok
 *
 * @module
 */
import { faCircleUser } from "@fortawesome/pro-light-svg-icons";
import { faAngleLeft } from "@fortawesome/pro-solid-svg-icons";
import { useState } from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
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
        <p className="text-center">
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
          commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus
          et magnis dis parturient montes, nascetur ridiculus mus. Donec quam
          felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla
          consequat massa quis enim.
        </p>
      </Modal>
      <Modal
        theme="tiktok"
        isOpen={modal2IsOpen}
        closeModal={() => setModal2IsOpen(false)}
      >
        <p className="text-center">
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
          commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus
          et magnis dis parturient montes, nascetur ridiculus mus. Donec quam
          felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla
          consequat massa quis enim.
        </p>
      </Modal>
      <WizardLayout className="text-center" footerSlots={footerSlots}>
        <Content title="Bei TikTok anmelden" icon={faCircleUser}>
          <p>
            Nach dem Login wird die App deine DSGVO-Daten für dich automatisch
            beantragen und verarbeiten. Du erhältst eine Benachrichtigung,
            sobald alles fertig ist.
          </p>
          <div className="mt-14 space-x-6">
            <HelpButton onClick={() => setModal1IsOpen(true)}>
              Was sind DSGVO-Daten?
            </HelpButton>
            <HelpButton onClick={() => setModal2IsOpen(true)}>
              Was geschieht mit meinen Daten?
            </HelpButton>
          </div>
          <div className="mt-auto">
            <Link
              to="/tiktok/upload_data_export"
              className="text-turquoise-700 font-semibold hover:underline text-base"
            >
              Ich habe bereits meine DSGVO-Daten.
            </Link>
          </div>
        </Content>
      </WizardLayout>
    </>
  );
}
