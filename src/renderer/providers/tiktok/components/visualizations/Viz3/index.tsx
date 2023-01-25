/* eslint-disable jsx-a11y/anchor-is-valid */
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { VizBoxRow } from "../VizBox";
import BeeswarmConnected from "./BeeswarmConnected";
import { transformData } from "./data";

const NUM_TOP_AUTHORS = 10;

const VizThree = ({ gdprData, metadata }) => {
  const [pics, setPics] = useState(null);

  const { allData, stats } = useMemo(
    () => transformData(gdprData, metadata),
    [gdprData, metadata],
  );

  useEffect(() => {
    (async () => {
      const allAuthors = Object.entries(
        _.countBy(allData.map((x) => x.author)),
      );

      const topAuthors = _.orderBy(allAuthors, (x) => x[1], "desc")
        .slice(0, NUM_TOP_AUTHORS)
        .map((x) => x[0]);

      window.electron.log.info(
        `Fetching avatars for the top authors ${JSON.stringify(topAuthors)}`,
      );

      const r = await window.electron.ipc.invoke(
        "tiktok-scrape-author-avatars",
        topAuthors,
      );
      setPics(r);
    })();
  }, allData);

  if (pics)
    window.electron.log.info(
      `Got pics for ${Object.keys(pics).length} authors`,
    );

  return (
    <>
      <div className="mx-auto flex items-center text-2xl mb-3 lg:mb-6">
        <div className="">Deine Interaktionen mit Anderen</div>
      </div>

      <VizBoxRow
        values={[
          { head: `${stats.shares}`, label: "geteilt" },
          { head: `${stats.favorites}`, label: "favorisiert" },
          { head: `${stats.likes}`, label: "gelikt" },
          { head: `${stats.views}`, label: "angesehen" },
        ]}
      />

      <main
        className="flex flex-col items-stretch min-h-[50vh] grow"
        id="dataskop-export-screenshot-inner"
      >
        <BeeswarmConnected data={allData} pics={pics} />
      </main>
    </>
  );
};

export default VizThree;
