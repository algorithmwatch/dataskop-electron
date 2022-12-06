/* eslint-disable jsx-a11y/anchor-is-valid */
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { VizBoxRow } from "../VizBox";
import BeeswarmConnected from "./BeeswarmConnected";
import { transformData } from "./data";

export default function VizThree({ gdprData, metadata }) {
  const [pics, setPics] = useState(null);

  const { allData, stats } = useMemo(
    () => transformData(gdprData, metadata),
    [gdprData, metadata],
  );

  useEffect(() => {
    (async () => {
      console.log(allData);
      const authors = _.uniq(allData.map((x) => x.author));
      console.log(authors);

      const r = await window.electron.ipc.invoke(
        "tiktok-scrape-author-avatars",
        authors.slice(0, 10),
      );
      setPics(r);
    })();
  }, allData);

  console.log(allData);
  console.log(pics);

  return (
    <>
      <div className="mx-auto flex items-center text-2xl mb-6">
        <div className="">Deine Interaktionen mit Anderen</div>
      </div>

      <VizBoxRow
        values={[
          { head: `${stats.totalNicknames} Kanäle`, label: "insgesamt" },
          { head: `${stats.views} Videos`, label: "gesehen" },
          { head: `${stats.shares} Videos`, label: "mit anderen geteilt" },
          { head: `${stats.comments} x`, label: "kommentiert" },
          { head: `${stats.favorites} Favoriten`, label: "gespeichert" },
          // { head: "33 x", label: "geliked" },
          // { head: "45 Videos", label: "mit anderen geteilt" },
          // { head: "123 x", label: "kommentiert" },
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
}
