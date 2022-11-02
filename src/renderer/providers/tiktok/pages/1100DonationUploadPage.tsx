/**
 * TODO: For TikTok
 *
 * @module
 */
import { faFileHeart } from "@fortawesome/pro-light-svg-icons";
import {
  faAngleLeft,
  faAngleRight,
  faAngleUp,
  faCog,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useRef, useState } from "react";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { postDonation } from "renderer/lib/networking";
import Content from "renderer/providers/tiktok/components/Content";
import { useConfig, useNavigation, useScraping } from "../../../contexts";

export default function DonationFormPage(): JSX.Element {
  const { getNextPage } = useNavigation();
  const {
    state: { platformUrl, seriousProtection, version },
  } = useConfig();
  const {
    state: { campaign },
  } = useScraping();

  const history = useHistory();
  const inputRef = useRef<HTMLInputElement>(null);

  const [emailInputValue, setEmailInputValue] = useState<string>(""); // TODO: insert initial state value when user came back to this form
  const [inputIsValid, setInputIsValid] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [isDone, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputIsValid(
      event.target.checkValidity() &&
        /^\S+@\S+\.\S\S+$/.test(event.target.value),
    );
    setEmailInputValue(event.target.value);
  };

  const footerSlots: FooterSlots = {
    center: [
      <Button
        key="1"
        theme="text"
        startIcon={faAngleLeft}
        onClick={() => history.goBack()}
      >
        Zurück
      </Button>,
      <Button
        key="2"
        endIcon={faAngleRight}
        disabled={!isDone}
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
      <Content title="Daten spenden" theme="transparent" icon={faFileHeart}>
        <p>
          Prima! Bitte gib deine E-Mail-Adresse ein. Über diese E-Mail-Adresse
          kannst du jederzeit auf deine Daten zugreifen und sie gegebenenfalls
          löschen.
        </p>
        <div className="mt-12">
          <input
            ref={inputRef}
            type="email"
            required
            placeholder="Deine E-Mail-Adresse"
            className="px-4 py-2 max-w-md w-full text-xl bg-white appearance-none border-2 border-black rounded ring-8 ring-east-blue-100 focus:outline-none focus:ring-east-blue-300"
            value={emailInputValue}
            onChange={handleInputChange}
          />
        </div>
        <div className="mt-10">
          {true && (
            <Button
              disabled={isUploading || !inputIsValid}
              endIcon={faAngleUp}
              onClick={async () => {
                if (campaign === null || platformUrl === null) {
                  setError("Ups, uns ist ein Fehler passiert.");
                  return;
                }

                setUploading(true);

                const data = {};

                const resp = await postDonation(
                  version,
                  platformUrl,
                  seriousProtection,
                  emailInputValue,
                  data,
                  campaign.id,
                );

                if (resp.ok) {
                  setUploading(false);
                  setDone(true);
                } else {
                  setUploading(false);
                  setError("Ups, uns ist ein Fehler passiert.");
                }
              }}
            >
              Hochladen
            </Button>
          )}

          <div className={isUploading ? "opacity-100 p-10" : "opacity-0 p-10"}>
            <FontAwesomeIcon spin icon={faCog} size="3x" />
            <div>Einen Moment bitte.</div>
          </div>

          {error !== null && (
            <div className="text-xl text-red-800 font-bold">{error}</div>
          )}
        </div>
      </Content>
    </WizardLayout>
  );
}
