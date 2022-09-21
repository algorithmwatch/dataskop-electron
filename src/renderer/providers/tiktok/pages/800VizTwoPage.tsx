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
import VizTwo from "../components/visualizations/VizTwo";
import { useData } from "../lib/hooks";

export default function VizTwoPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();
  const { dump, lookups } = useData();

  const footerSlots: FooterSlots = {
    center: [
      <Button
        key="1"
        theme="text"
        startIcon={faAngleLeft}
        onClick={() => {
          history.push(getPreviousPage("path"));
        }}
      >
        Zurück
      </Button>,
      <Button
        key="2"
        endIcon={faAngleRight}
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
      {dump && lookups && <VizTwo gdprData={dump} metadata={lookups} />}
    </WizardLayout>
  );
}
