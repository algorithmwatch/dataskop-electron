/**
 * TODO: For TikTok
 *
 * @module
 */
import { faFileHeart } from "@fortawesome/pro-light-svg-icons";
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";
import { useNavigation } from "../../../contexts";

export default function DonationFormPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();
  const saveDonationEmail = () => {
    // to be implemented
  };

  const footerSlots: FooterSlots = {
    center: [
      <Button
        key="1"
        theme="text"
        startIcon={faAngleLeft}
        onClick={() => {
          // Die Seite nach Klick auf "Zurück" kann unterschiedlich sein.
          // 1. Wenn genug Daten vorhanden waren und Visualisierungen gezeigt werden konnten:
          // --> /tiktok/donation_choice
          // 2. Wenn nicht genug Daten vorhanden waren, sind User von dieser Seite gekommen:
          // --> /tiktok/waiting_done

          // Todo:
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

          saveDonationEmail();
        }}
      >
        Weiter
      </Button>,
    ],
  };

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <Content title="Daten spenden" theme="transparent" icon={faFileHeart}>
        <p>
          Prima! Bitte gib deine E-Mail-Adresse ein. Über diese E-Mail-Adresse
          kannst du jederzeit auf deine Daten zugreifen und sie gegebenenfalls
          löschen.
        </p>
        <div className="mt-12">
          <input
            type="email"
            placeholder="Deine E-Mail-Adresse"
            className="px-4 py-2 max-w-md w-full text-xl bg-white appearance-none border-2 border-black rounded ring-8 ring-east-blue-100 focus:outline-none focus:ring-east-blue-300"
          />
        </div>
      </Content>
    </WizardLayout>
  );
}
