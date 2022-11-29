/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
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
import { faCog, faEnvelope } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useState } from "react";
import WizardLayout from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";

const ShareButton = ({
  title,
  icon,
  url,
  className,
}: {
  title: string;
  icon: IconDefinition;
  url: any;
  className: string;
}) => {
  // `target="_blank" isn't necessary. All links are handled by the OS (Browser / Mail client)
  return (
    <a
      className={clsx(
        "inline-flex items-center justify-center px-4 py-3 text-lg font-medium rounded-full bg-white shadow-sm focus:ring",
        className,
      )}
      href={url}
    >
      <FontAwesomeIcon
        icon={icon}
        aria-hidden="true"
        className="shrink-0 mr-2 text-3xl"
      />
      {title}
    </a>
  );
};

const ExportLink = ({ setExporting }) => {
  return (
    <span>
      Wenn du deine Daten herunterladen möchtest, klicke{" "}
      <span
        className="hover:cursor-pointer underline"
        onClick={async () => {
          setExporting(true);
          await window.electron.ipc.invoke("tiktok-data-export");
          setExporting(false);
        }}
      >
        hier
      </span>
      . Sie werden beim Schließen der App gelöscht.
    </span>
  );
};

const NotEligibleLink = () => {
  return (
    <span>
      Weil du unter 18 bist, kannst du deine Daten leider{" "}
      <a href="https://dataskop.net/faq">nicht spenden</a>.{" "}
    </span>
  );
};

export default function ThankYouPage(): JSX.Element {
  const [isExporting, setExporting] = useState(false);
  const shareUrl = "https://dataskop.net/";
  const shareText = encodeURIComponent(
    "Was weiß TikTok über dich? Mach mit bei der Datenspende-Aktion:",
  );
  const facebookUrl = `https://www.facebook.com/sharer.php?u=${shareUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
  const mailUrl =
    "mailto:m.mustermann@domain.de?subject=DataSkop&body=Hallo%20Max,%0D%0A%0D%0Ahier%20steht%20die%20Nachricht.";

  const footerSlots = {
    center: [
      <div className="text-sm text-neutral-500" key="1">
        Du kannst die App jetzt schließen.
      </div>,
    ],
  };

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <Content
        title={
          window.hasDonated
            ? "Danke für deine Spende!"
            : "Danke für deine Teilnahme!"
        }
        theme="tiktokLight"
        icon={window.hasDonated ? faFaceSmileHearts : faFaceRelieved}
      >
        {isExporting && (
          <>
            <FontAwesomeIcon spin icon={faCog} size="3x" />
            <div className="my-5">
              Einen Moment, bitte. Die Daten werden exportiert.
            </div>
          </>
        )}
        {window.hasDonated ? (
          <>
            <p className="mb-5">
              Du hilfst uns mit deiner Spende, TikTok besser zu verstehen. Damit
              tust du etwas Gutes für die Wissenschaft.{" "}
              <ExportLink setExporting={setExporting} />
            </p>

            <p>
              <b>Wichtig:</b> Bitte schau in dein Postfach und bestätige deine
              E-Mail-Adresse. Nur so können wir deine Daten für die Auswertung
              nutzen.
            </p>
          </>
        ) : (
          <p>
            Wir sind froh, dass du ein Teil von DataSkop warst.{" "}
            {window.notEligibleToDonate && <NotEligibleLink />}
            <ExportLink setExporting={setExporting} />
          </p>
        )}

        <h2 className="hl-2xl mt-16 mb-3">Sag es weiter</h2>
        <p>Wir würden uns freuen, wenn du anderen von DataSkop erzählst.</p>
        <div className="flex items-center justify-center space-x-4 mt-8">
          <ShareButton
            title="Teilen"
            icon={faFacebook}
            url={facebookUrl}
            className="text-[#4267B2] focus:ring-[#4267B2]/60"
          />
          <ShareButton
            title="Twittern"
            icon={faTwitter}
            url={twitterUrl}
            className="text-[#1DA1F2] focus:ring-[#1DA1F2]/60"
          />
          <ShareButton
            title="E-Mail versenden"
            icon={faEnvelope}
            url={mailUrl}
            className="text-east-blue-700 focus:ring-east-blue-600/60"
          />
        </div>
      </Content>
    </WizardLayout>
  );
}
