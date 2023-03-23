/**
 * TODO: For TikTok
 *
 * @module
 */
import {
  faAngleLeft,
  faAngleRight,
  faImage,
  faInfoCircle,
} from "@fortawesome/pro-solid-svg-icons";
import _ from "lodash";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useWindowSize } from "react-use";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Modal from "../../../components/Modal";
import TimeConsumedViz from "../../../components/visualizations/TimeConsumedViz";
import { useNavigation } from "../../../contexts";
import { doScreenshot } from "../../../lib/visualizations/screenshot";
import { useData } from "../lib/useData";
import {
  arrangeDataVizOne,
  getMaxRange,
} from "../lib/visualizations/viz1-data";

const VizOnePage = (): JSX.Element => {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();
  const [aboutModalIsOpen, setAboutModalIsOpen] = useState(
    !window.viz1modalHide,
  );

  const [graph, setGraph] = useState("");

  const { dump } = useData({
    dumpPicks: ["Activity.Video Browsing History", "Activity.Login History"],
  });

  const footerSlots: FooterSlots = {
    start: [
      <Button
        className="mt-2 lg:mt-3"
        theme="text"
        size="sm"
        key="1"
        startIcon={faInfoCircle}
        onClick={() => setAboutModalIsOpen(true)}
      >
        Über diese Grafik
      </Button>,
      <Button
        className="mt-2 lg:mt-3"
        theme="text"
        key="2"
        size="sm"
        startIcon={faImage}
        onClick={() => {
          const outer = window.document.querySelector(
            "#dataskop-export-screenshot-outer",
          );
          let inner = window.document.querySelector(
            "#dataskop-export-screenshot-inner figure > svg",
          );

          if (!inner) {
            inner = window.document.querySelector(
              "#dataskop-export-screenshot-inner svg",
            );
          }

          if (!outer || !inner) return;

          const box = outer.getBoundingClientRect();
          const svgBox = inner.getBoundingClientRect();
          const bottomPadding = 10;

          const width = Math.round(box.width + box.x);
          const height = Math.round(svgBox.height + svgBox.y) + bottomPadding;

          doScreenshot(
            { width, height, y: 0, x: 0 },
            `DataSkop_TikTok_Viz_1_${graph}.jpg`,
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

  const { width, height } = useWindowSize();

  const maxRange = useMemo(() => getMaxRange(dump), [dump]);

  return (
    <>
      <Modal
        theme="tiktok"
        isOpen={aboutModalIsOpen}
        closeModal={() => {
          if (!window.viz1modalHide) window.viz1modalHide = true;
          setAboutModalIsOpen(false);
        }}
      >
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Über diese Grafiken</h1>
          <p className="">
            Die Visualisierung zur Nutzungszeit zeigt dir, wann und wie du in
            der TikTok-App aktiv warst. Du kannst zwischen „Aktivität“ (wie
            viele Minuten an welchem Tag), „Tageszeit“ (welcher Zeitraum an
            welchem Tag) und „Übersprungen“ (Anteil der gesehenen Videos, die du
            kürzer oder länger als drei Sekunden geschaut hast) auswählen.
          </p>
        </div>
      </Modal>
      <WizardLayout className="text-center" footerSlots={footerSlots}>
        <div
          className="mt-3 lg:mt-9 2xl:mt-12 flex flex-col 2xl:mx-16"
          id="dataskop-export-screenshot-outer"
        >
          {dump && (
            <TimeConsumedViz
              arrangeData={_.partial(arrangeDataVizOne, dump)}
              width={width}
              height={height}
              onGraphChange={setGraph}
              maxRange={maxRange}
            />
          )}
        </div>
      </WizardLayout>
    </>
  );
};

export default VizOnePage;
