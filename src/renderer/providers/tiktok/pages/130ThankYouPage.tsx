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
import { useEffect, useState } from "react";
import Content from "renderer/components/Content";
import WizardLayout from "renderer/components/WizardLayout";

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
    <span
      className={clsx(
        "inline-flex items-center justify-center px-4 py-3 text-lg font-medium rounded-full bg-white shadow-sm focus:ring hover:cursor-pointer",
        className,
      )}
      onClick={() => {
        window.open(url);
      }}
    >
      <FontAwesomeIcon
        icon={icon}
        aria-hidden="true"
        className="shrink-0 mr-2 text-3xl"
      />
      {title}
    </span>
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

const ThankYouPage = (): JSX.Element => {
  const [isExporting, setExporting] = useState(false);
  const shareUrl = "https://dataskop.net/";
  const shareText = encodeURIComponent(
    "Was weiß TikTok über dich? Mach mit bei der Datenspende-Aktion:",
  );
  const facebookUrl = `https://www.facebook.com/sharer.php?u=${shareUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
  const mailUrl =
    "mailto:?subject=Mach%20mit%20bei%20der%20TikTok-Datenspende%21&body=Hallo%21%0A%0AIch%20habe%20gerade%20die%20DataSkop-App%20ausprobiert.%20Sie%20zeigt%20dir%2C%20was%20TikTok%20%C3%BCber%20dich%20wei%C3%9F.%20Mach%20mit%20bei%20der%20Datenspende-Aktion%20unter%20https%3A%2F%2Fdataskop.net%0A%0AGru%C3%9F";

  const footerSlots = {
    center: [
      <div className="text-sm text-neutral-500" key="1">
        Du kannst die{" "}
        <span
          className="underline hover:cursor-pointer"
          onClick={() => window.electron.ipc.invoke("quit")}
        >
          App jetzt schließen
        </span>
        .
      </div>,
    ],
  };

  useEffect(() => {
    window.reachedEnd = true;
  }, []);

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

        <h2 className="hl-2xl mt-4 xl:mt-8 2xl:mt-16 mb-3">Sag es weiter</h2>
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
};

export default ThankYouPage;
