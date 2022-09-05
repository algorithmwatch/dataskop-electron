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
        <div className="font-bold mb-4 text-xl -mt-10">
          Möchtest du unseren Newsletter abonnieren?
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
          Mit dem Newsletter von AlgorithmWatch erfährst du von weiteren
          Datenspende-Aktionen, Forschungsprojekten und Recherchen. Die Mailings
          erscheinen monatlich. Du kannst dich jederzeit wieder abmelden.
        </p>
        <p className="mt-8 text-neutral-600 text-base">
          Vergiss nicht, auf den Bestätigungslink zu klicken, den du im
          Anschluss in einer E-Mail von uns erhältst.{" "}
          <a
            href="https://dataskop.net/datenschutzerklaerung/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:no-underline"
          >
            Hier
          </a>{" "}
          geht's zu den Datenschutzbestimmungen.
        </p>
      </Content>
    </WizardLayout>
  );
}
