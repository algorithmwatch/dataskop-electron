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
import { doScreenshot } from "../../../lib/visualizations/screenshot";
import { VizThree } from "../components/visualizations";
import { useData } from "../lib/useData";

const VizThreePage = (): JSX.Element => {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();
  const { dump, lookups } = useData({
    dumpPicks: [
      "Activity.Video Browsing History",
      "Activity.Favorite Videos",
      "Activity.Share History",
      "Activity.Like List",
    ],
  });
  const [aboutModalIsOpen, setAboutModalIsOpen] = useState(
    !window.viz3modalHide,
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
    <>
      <Modal
        theme="tiktok"
        isOpen={aboutModalIsOpen}
        closeModal={() => {
          if (!window.viz3modalHide) window.viz3modalHide = true;
          setAboutModalIsOpen(false);
        }}
      >
        <div className="text-center">
          <h1 className="hl-2xl mb-4">Über diese Grafik</h1>
          <p className="">
            Die Visualisierung zu Interaktionen mit anderen zeigt dir, mit wem
            du auf TikTok am meisten zu tun hattest: wessen Videos du geteilt
            hast, wessen Videos favorisiert wurden, welche Videos du gelikt und
            wessen Videos du angesehen hast. Die Größe der Punkte bestimmt dabei
            die Anzahl der Interaktionen.
          </p>
        </div>
      </Modal>
      <WizardLayout className="text-center" footerSlots={footerSlots}>
        <div
          className="mt-4 lg:mt-8 xl:mt-12 flex flex-col w-full grow"
          id="dataskop-export-screenshot-outer"
        >
          {dump && lookups && <VizThree gdprData={dump} metadata={lookups} />}
        </div>
      </WizardLayout>
    </>
  );
};

export default VizThreePage;
