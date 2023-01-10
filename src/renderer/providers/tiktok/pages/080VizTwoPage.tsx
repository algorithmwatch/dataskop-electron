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
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Modal from "../../../components/Modal";
import { useNavigation } from "../../../contexts";
import { VizTwo } from "../components/visualizations";
import { doScreenshot } from "../components/visualizations/utils/screenshot";
import { useData } from "../lib/useData";

const VizTwoPage = (): JSX.Element => {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();

  const { dump, lookups } = useData({
    dumpPicks: ["Activity.Video Browsing History"],
  });
  const [aboutModalIsOpen, setAboutModalIsOpen] = useState(
    !window.viz2modalHide,
  );

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
            "DataSkop_TikTok_Viz_2.jpg",
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
    <>
      <Modal
        theme="tiktok"
        isOpen={aboutModalIsOpen}
        closeModal={() => {
          if (!window.viz2modalHide) window.viz2modalHide = true;
          setAboutModalIsOpen(false);
        }}
      >
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Über diese Grafiken</h1>
          <p className="">
            Die Visualisierung zu Hashtags und Kategorien zeigt dir, welche
            Inhalte bei dir besonders beliebt waren. Du kannst zwischen
            „Hashtags“ (von Creatorn vergeben) und „Kategorien“ (von TikTok
            vergeben) auswählen. Die Anzahl der Punkte repräsentiert die Zahl
            der Videos, die du länger als fünf Sekunden geschaut hast.
          </p>
        </div>
      </Modal>
      <WizardLayout className="text-center" footerSlots={footerSlots}>
        <div
          className="mt-4 lg:mt-8 xl:mt-12 flex flex-col w-full grow"
          id="dataskop-export-screenshot-outer"
        >
          {dump && lookups && <VizTwo gdprData={dump} metadata={lookups} />}
        </div>
      </WizardLayout>
    </>
  );
};

export default VizTwoPage;
