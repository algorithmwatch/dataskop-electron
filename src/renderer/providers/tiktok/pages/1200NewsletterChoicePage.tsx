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
      <div key="1">
        <div className="font-bold mb-4 text-xl -mt-10 text-center whitespace-nowrap">
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
      <Content
        title="Eine Sache noch!"
        theme="transparent"
        icon={faEnvelopeOpenText}
      >
        <p>
          Möchtest du unseren Newsletter abonnieren? Mit dem Newsletter von
          AlgorithmWatch erfährst du von weiteren Datenspende-Aktionen,
          Forschungsprojekten und Recherchen. Die Mailings erscheinen monatlich.
          Du kannst dich jederzeit wieder abmelden.
        </p>
        <div className="mt-10">
          <input
            type="email"
            placeholder="Deine E-Mail-Adresse"
            className="px-4 py-2 max-w-lg w-full text-xl bg-white appearance-none border-2 border-black rounded ring-8 ring-east-blue-100 focus:outline-none focus:ring-east-blue-300"
          />
          <div className="mt-4 text-neutral-500 text-sm">
            Trage deine E-Mail-Adresse hier ein, wenn du den Newsletter
            abonnieren möchtest.
          </div>
        </div>
        <p className="mt-8 text-neutral-500 text-base max-w-prose mx-auto">
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
