/**
 * TODO: For TikTok
 *
 * @module
 */
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useNavigation } from "../../../contexts";
import { doScreenshot } from "../components/visualizations/utils/screenshot";
import VizThree from "../components/visualizations/VizThree";
import { useData } from "../lib/hooks";

export default function VizTwoPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();
  const { dump, lookups } = useData();

  const footerSlots: FooterSlots = {
    start: [
      <Button
        theme="outline"
        key="1"
        onClick={() => {
          const outer = window.document.querySelector(
            "#dataskop-export-screenshot-outer",
          );
          const inner = window.document.querySelector(
            "#dataskop-export-screenshot-inner svg",
          );

          if (!outer || !inner) return;

          const box = outer.getBoundingClientRect();
          const svgBox = inner.getBoundingClientRect();
          const bottomPadding = 10;

          const width = Math.round(box.width + box.x);
          const height = Math.round(svgBox.height + svgBox.y) + bottomPadding;

          doScreenshot(
            { width, height, y: 0, x: 0 },
            "DataSkop_TikTok_Viz_3.jpg",
          );
        }}
      >
        Als Bild speichern
      </Button>,
    ],
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
      <div
        className="mt-12 flex flex-col w-full grow"
        id="dataskop-export-screenshot-outer"
      >
        {dump && lookups && <VizThree gdprData={dump} metadata={lookups} />}
      </div>
    </WizardLayout>
  );
}
