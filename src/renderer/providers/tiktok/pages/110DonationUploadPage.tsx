/**
 * TODO: For TikTok
 *
 * @module
 */
import { faFileHeart } from "@fortawesome/pro-light-svg-icons";
import {
  faAngleLeft,
  faAngleRight,
  faCog,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import Content from "renderer/components/Content";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { isValidEmail } from "shared/utils/strings";
import { useConfig, useNavigation, useScraping } from "../../../contexts";

window.persistEmail = "";
window.hasDonated = false;

const DonationFormPage = (): JSX.Element => {
  const { getNextPage } = useNavigation();
  const {
    state: { platformUrl },
  } = useConfig();
  const {
    state: { campaign },
  } = useScraping();

  const history = useHistory();
  const inputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState(window.persistEmail);
  const [isUploading, setUploading] = useState(false);
  const [isDone, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputIsValid = useMemo(() => {
    return isValidEmail(email);
  }, [email]);

  const upload = async () => {
    if (campaign === null || platformUrl === null) {
      setError("Ups, uns ist ein Fehler passiert.");
      return;
    }

    setError(null);
    setUploading(true);

    const uploadSuccess = await window.electron.ipc.invoke(
      "tiktok-data-upload",
      email,
      campaign.id,
    );

    if (uploadSuccess) {
      setUploading(false);
      setDone(true);
      window.hasDonated = true;
      window.persistEmail = email;
      history.push(getNextPage("path"));
    } else {
      setUploading(false);
      setError("Ups, uns ist ein Fehler passiert.");
    }
  };

  const footerSlots: FooterSlots = {
    center: [
      <Button
        key="1"
        theme="text"
        startIcon={faAngleLeft}
        onClick={() => {
          window.persistEmail = email;
          history.goBack();
        }}
      >
        Zurück
      </Button>,
      <Button
        key="2"
        endIcon={faAngleRight}
        disabled={isUploading || !inputIsValid}
        onClick={upload}
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
            disabled={isDone}
            ref={inputRef}
            type="email"
            required
            placeholder="Deine E-Mail-Adresse"
            className="px-4 py-2 max-w-md w-full text-xl bg-white appearance-none border-2 border-black rounded ring-8 ring-east-blue-100 focus:outline-none focus:ring-east-blue-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputIsValid) {
                upload();
              }
            }}
          />
        </div>
        <div className="mt-10">
          {!isDone && error === null && (
            <div
              className={isUploading ? "opacity-100 p-10" : "opacity-0 p-10"}
            >
              <FontAwesomeIcon spin icon={faCog} size="3x" />
              <div className="mt-5">
                Einen Moment, bitte. Die Daten werden hochgeladen.
              </div>
            </div>
          )}

          {error !== null && (
            <div className="text-xl text-red-800 font-bold pt-10">{error}</div>
          )}

          {isDone && (
            <div className="text-xl text-green-800 font-bold pt-10">
              Deine Daten wurden erfolgreich hochgeladen.
            </div>
          )}
        </div>
      </Content>
    </WizardLayout>
  );
};

export default DonationFormPage;
