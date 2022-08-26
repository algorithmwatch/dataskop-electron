/**
 * TODO: For TikTok
 *
 * @module
 */
import { faEnvelopeOpenText } from "@fortawesome/pro-light-svg-icons";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";

export default function NewsletterChoicePage(): JSX.Element {
  const history = useHistory();

  const footerSlots: FooterSlots = {
    center: [
      <div>
        <div className="font-bold mb-4 text-lg -mt-10">
          Möchtest du unseren Newsletter abonniernen?
        </div>
        <div className="flex items-center justify-center space-x-4">
          <Button
            className="min-w-[6rem]"
            onClick={() => {
              history.push("/tiktok/thank_you");
            }}
          >
            Ja
          </Button>
          <Button
            className="min-w-[6rem]"
            theme="outline"
            onClick={() => {
              history.push("/tiktok/thank_you");
            }}
          >
            Nein
          </Button>
        </div>
      </div>,
    ],
  };

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <Content title="Eine Sache noch!" theme="gray" icon={faEnvelopeOpenText}>
        <p>
          Mit dem Newsletter von AlgorithmWatch erfährst du als erstes von
          weiteren Datenspende-Aktionen, Forschungsprojekten und Recherchen. Die
          Mailings erscheinen ca. 1 x pro Monat und du kannst dich jederzeit
          wieder abmelden.
        </p>
        <p className="mt-8 text-neutral-600 text-base">
          Vergiss nicht, den Bestätitungslink zu klicken, den du im Anschluss in
          einer E-Mail von uns erhältst. Hier geht's zu den
          Datenschutzbestimmungen.
        </p>
      </Content>
    </WizardLayout>
  );
}
