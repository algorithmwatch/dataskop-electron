/**
 * TODO: For TikTok
 *
 * @module
 */
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useNavigation } from "../../../contexts";

export default function IntroductionPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();

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
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <h1 className="hl-4xl mb-20">Willkommen bei DataSkop 👋</h1>
      <div className="space-y-4">
        <p>
          TikTok sammelt viele Daten über dich, aber weißt du auch welche?
          Sogenannte “personenbezogene Daten” lassen Rückschlüsse auf deine
          Persönlichkeit oder Lebensführung zu, aber sind nicht oder nur schwer
          zugänglich.
        </p>

        <p>
          Mit der DataSkop-App wollen wir gemeinsam mit dir dein TikTok-Profil
          untersuchen und ordnen diese Daten ein.
        </p>

        <p>
          Darüberhinaus tust du noch etwas Gutes für die Wissenschaft, wenn du
          deine Daten am Ende spendest (darüber würden wir uns sehr freuen!)
        </p>
      </div>
    </WizardLayout>
  );
}
