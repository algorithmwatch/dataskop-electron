/* eslint-disable jsx-a11y/anchor-is-valid */
import { useMemo, useState } from "react";
import { VizBoxRow } from "../VizBox";
import Beeswarm from "./Beeswarm";
import { transformData } from "./data";

function DatasourceSwitch({ datasource, setDatasource }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="inline-flex rounded-lg p-1 bg-gradient-to-br from-[#B5FFFD] to-[#FFB8CE]"
        role="group"
      >
        <a
          href="#"
          onClick={() => setDatasource("hashtags")}
          aria-current="page"
          className={`
            min-w-[12rem] grow rounded-l-md py-2 flex flex-col items-center
        ${
          datasource === "hashtags"
            ? "bg-gradient-to-l from-white to-transparent"
            : "opacity-80"
        }
        `}
        >
          Hashtags
        </a>

        <a
          href="#"
          onClick={() => setDatasource("diversification")}
          className={`
            min-w-[12rem] grow rounded-r-md py-2 flex flex-col items-center
              ${
                datasource === "diversification"
                  ? "bg-gradient-to-r from-white to-transparent"
                  : "opacity-80"
              }
              `}
        >
          Kategorien
        </a>
      </div>
    </div>
  );
}

export default function VizTwo({ gdprData, metadata }) {
  const [datasource, setDatasource] = useState("hashtags");

  const { topDiversificationLabels, topHashtagsFlat, stats } = useMemo(
    () => transformData(gdprData, metadata),
    [gdprData, metadata],
  );

  const data =
    datasource === "hashtags" ? topHashtagsFlat : topDiversificationLabels;

  console.log(data);
  return (
    <>
      <div className="mx-auto flex items-center text-2xl mb-6">
        <div className="">Deine Top Hashtags und Kategorien</div>
      </div>

      <VizBoxRow
        values={[
          { head: `${stats.topHashtag}`, label: "Top Hashtag" },
          { head: `${stats.topLabel}`, label: "Top Label" },
          { head: `${stats.totalVideos}`, label: "Anzahl Videos" },
          { head: `${stats.totalDays}`, label: "Tage" },
        ]}
      />

      <main
        className="flex flex-col items-stretch min-h-[50vh] grow"
        id="dataskop-export-screenshot-inner"
      >
        <DatasourceSwitch
          datasource={datasource}
          setDatasource={setDatasource}
        />
        <Beeswarm data={data} />
      </main>
    </>
  );
}
