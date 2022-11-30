/**
 * TODO: For TikTok
 *
 * @module
 */
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { delay } from "renderer/lib/utils/time";
import { useNavigation } from "../../../contexts";
import VizOne from "../components/visualizations/VizOne";
import { useData } from "../lib/hooks";

export default function VizOnePage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();

  const { dump } = useData();

  const footerSlots: FooterSlots = {
    start: [
      <Button
        theme="outline"
        size="sm"
        key="1"
        onClick={async () => {
          const outer = window.document.querySelector(
            "#dataskop-export-screenshot-outer",
          );
          const inner = window.document.querySelector(
            "#dataskop-export-screenshot-inner svg",
          );

          if (!outer || !inner) return;

          const box = outer.getBoundingClientRect();
          const svgBox = inner.getBoundingClientRect();

          const div = document.createElement("div");
          div.style.cssText = "position: absolute; top:10px; left:100px;";
          div.textContent = "dataskop.net";
          div.id = "dataskop-export-brand";
          document.body.insertAdjacentElement("beforebegin", div);

          await delay(100);

          console.log(box, svgBox);

          const bottomPadding = 10;
          await window.electron.ipc.invoke(
            "export-screenshot",
            {
              x: 0,
              y: 0,
              width: Math.round(box.width + box.x),
              height: Math.round(svgBox.height + svgBox.y) + bottomPadding,
            },
            "DataSkop_TikTok_Viz_1.jpg",
          );
          document.querySelector("#dataskop-export-brand")?.remove();
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
        className="mt-12 flex flex-col mx-16"
        id="dataskop-export-screenshot-outer"
      >
        {dump && <VizOne gdprData={dump} />}
      </div>
    </WizardLayout>
  );
}
