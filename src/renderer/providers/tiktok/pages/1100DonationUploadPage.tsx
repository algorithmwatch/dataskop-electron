/**
 * TODO: For TikTok
 *
 * @module
 */
import { faFileHeart } from "@fortawesome/pro-light-svg-icons";
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { ChangeEvent, useRef, useState } from "react";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";
import { useNavigation } from "../../../contexts";

export default function DonationFormPage(): JSX.Element {
  const { getNextPage } = useNavigation();
  const history = useHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const [emailInputValue, setEmailInputValue] = useState<string>(""); // TODO: insert initial state value when user came back to this form
  const [inputIsValid, setInputIsValid] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputIsValid(event.target.checkValidity());
    setEmailInputValue(event.target.value);
  };

  const saveDonationEmail = (value: string) => {
    // TODO: to be implemented
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
        disabled={!inputIsValid}
        onClick={() => {
          if (!inputIsValid) return;

          saveDonationEmail(emailInputValue);
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
      </Content>
    </WizardLayout>
  );
}
