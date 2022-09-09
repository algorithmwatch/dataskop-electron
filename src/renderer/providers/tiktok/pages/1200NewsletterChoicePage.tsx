/**
 * TODO: For TikTok
 *
 * @module
 */
import { faEnvelopeOpenText } from "@fortawesome/pro-light-svg-icons";
import { faAngleLeft } from "@fortawesome/pro-solid-svg-icons";
import { ChangeEvent, Fragment, useMemo, useRef, useState } from "react";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";

export default function NewsletterChoicePage(): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [emailInputValue, setEmailInputValue] = useState<string>(""); // TODO: insert initial state value, when user entered email address in donation form already
  const [inputIsValid, setInputIsValid] = useState(false);
  const [formIsVisible, setFormIsVisible] = useState(false);
  const history = useHistory();
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputIsValid(event.target.checkValidity());
    setEmailInputValue(event.target.value);
  };
  const signUpForNewsletter = () => {
    // TODO: to be implemented
  };

  const footerSlots: FooterSlots = useMemo(
    () => ({
      start: [
        <Button
          key="1"
          theme="text"
          startIcon={faAngleLeft}
          onClick={() => history.goBack()}
        >
          Zurück
        </Button>,
      ],
      center: [
        !formIsVisible ? (
          <Fragment key="1">
            <Button
              key="1"
              className="min-w-[6rem]"
              onClick={() => {
                setFormIsVisible(true);
              }}
            >
              Ja, ich will den Newsletter
            </Button>
            <Button
              key="2"
              className="min-w-[6rem]"
              theme="outline"
              onClick={() => {
                history.push("/tiktok/thank_you");
              }}
            >
              Nein, danke
            </Button>
          </Fragment>
        ) : (
          <Fragment key="1">
            <Button
              key="1"
              className="min-w-[6rem]"
              disabled={!inputIsValid}
              onClick={() => {
                if (!inputIsValid) return;

                signUpForNewsletter();
                history.push("/tiktok/thank_you");
              }}
            >
              Newsletter abonnieren
            </Button>
            <Button
              key="2"
              className="min-w-[6rem]"
              theme="outline"
              onClick={() => {
                setFormIsVisible(false);
              }}
            >
              Abbrechen
            </Button>
          </Fragment>
        ),
      ],
    }),
    [formIsVisible, emailInputValue, inputIsValid],
  );

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <Content
        title="Eine Sache noch!"
        theme="transparent"
        icon={faEnvelopeOpenText}
      >
        {!formIsVisible && (
          <div className="space-y-8">
            <p>
              Mit dem Newsletter von AlgorithmWatch erfährst du von weiteren
              Datenspende-Aktionen, Forschungsprojekten und Recherchen. Die
              Mailings erscheinen monatlich. Du kannst dich jederzeit wieder
              abmelden.
            </p>
            <p className="font-bold">
              Möchtest du unseren Newsletter abonnieren?
            </p>
          </div>
        )}

        {formIsVisible && (
          <div className="space-y-8">
            <p>An welche E-Mail-Adresse sollen wir den Newsletter schicken?</p>
            <input
              ref={inputRef}
              type="email"
              required
              placeholder="Deine E-Mail-Adresse"
              className="px-4 py-2 max-w-lg w-full max-auto text-xl bg-white appearance-none border-2 border-black rounded ring-8 ring-east-blue-100 focus:outline-none focus:ring-east-blue-300"
              value={emailInputValue}
              onChange={handleInputChange}
            />
            <p className="text-neutral-500 text-base max-w-prose mx-auto">
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
              geht&apos;s zu den Datenschutzbestimmungen.
            </p>
          </div>
        )}
      </Content>
    </WizardLayout>
  );
}
