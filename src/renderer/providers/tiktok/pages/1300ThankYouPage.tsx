/**
 * TODO: For TikTok
 *
 * @module
 */
import { faFacebook, faTwitter } from "@fortawesome/free-brands-svg-icons";
import {
  faFaceRelieved,
  faFaceSmileHearts,
  IconDefinition,
} from "@fortawesome/pro-light-svg-icons";
import { faEnvelope } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import WizardLayout from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";

const ShareButton = ({
  title,
  icon,
  className,
}: {
  title: string;
  icon: IconDefinition;
  className: string;
}) => {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center justify-center px-4 py-3 text-lg font-medium rounded-full bg-white shadow-sm focus:ring",
        className,
      )}
    >
      <FontAwesomeIcon
        icon={icon}
        aria-hidden="true"
        className="shrink-0 mr-2 text-3xl"
      />
      {title}
    </button>
  );
};

export default function ThankYouPage(): JSX.Element {
  const hasDonation = true;

  const footerSlots = {
    center: [
      <div className="text-sm text-neutral-500">
        Du kannst die App jetzt schließen.
      </div>,
    ],
  };

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <Content
        title={
          hasDonation ? "Danke für deine Spende!" : "Danke für deine Teilnahme!"
        }
        theme="tiktokLight"
        icon={hasDonation ? faFaceSmileHearts : faFaceRelieved}
      >
        {hasDonation ? (
          <p>
            Du hilfst uns mit deiner Spende TikTok besser zu verstehen. Und tust
            gleichzeitig noch etwas Gutes für die Wissenschaft.
          </p>
        ) : (
          <p>
            Auch wenn du dich gegen eine Datenspende entschieden hast, sind wir
            froh, dass du Teil von DataSkop warst.{" "}
          </p>
        )}

        <h2 className="hl-2xl mt-16 mb-3">Sag es weiter</h2>
        <p className="text-base">
          Wir würden uns freuen, wenn du anderen von DataSkop erzählst.
        </p>
        <div className="flex items-center justify-center space-x-4 mt-8">
          <ShareButton
            title="Teilen"
            icon={faFacebook}
            className="text-[#4267B2] focus:ring-[#4267B2]/60"
          />
          <ShareButton
            title="Twittern"
            icon={faTwitter}
            className="text-[#1DA1F2] focus:ring-[#1DA1F2]/60"
          />
          <ShareButton
            title="E-Mail versenden"
            icon={faEnvelope}
            className="text-turquoise-700 focus:ring-turquoise-600/60"
          />
        </div>
      </Content>
    </WizardLayout>
  );
}
