/**
 * TODO: For TikTok
 *
 * @module
 */
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useNavigation } from "../../../contexts";

export default function TutorialPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();

  const footerSlots: FooterSlots = {
    start: [
      <Button
        key="1"
        startIcon={faAngleLeft}
        theme="text"
        onClick={() => {
          history.push(getPreviousPage("path"));
        }}
      >
        Zurück
      </Button>,
    ],
    center: [
      <Button
        key="2"
        theme="text"
        onClick={() => {
          history.push(getNextPage("path"));
        }}
      >
        Überspringen
      </Button>,
      <Button
        key="3"
        endIcon={faAngleRight}
        onClick={() => {
          console.log("show next slide");
        }}
      >
        Weiter
      </Button>,
    ],
  };

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <h1 className="hl-4xl mb-20">Tutorial</h1>
      <div className="space-y-4">
        <p>This is the content</p>
      </div>
    </WizardLayout>
  );
}
