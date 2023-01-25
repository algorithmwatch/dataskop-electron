/* eslint-disable jsx-a11y/anchor-is-valid */
import _ from "lodash";
import { useMemo, useState } from "react";
import TabBar from "../TabBar";
import { VizBoxRow } from "../VizBox";
import Beeswarm from "./Beeswarm";
import { transformData } from "./data";

const VizTwo = ({ gdprData, metadata }) => {
  const [datasource, setDatasource] = useState("hashtags");

  const { topDiversificationLabels, topHashtagsFlat, stats } = useMemo(
    () => transformData(gdprData, metadata),
    [gdprData, metadata],
  );

  const data =
    datasource === "hashtags" ? topHashtagsFlat : topDiversificationLabels;

  window.electron.log.info(
    `Displayin Viz2 with ${datasource} for ${data.length} videos`,
  );

  const tooltip = (x) =>
    `${
      _.isString(x.datum.author) ? x.datum.author : x.datum.author.nickname
    }: ${
      datasource === `hashtags`
        ? x.datum.hashtags.join(" ")
        : x.datum.diversificationLabels.join(", ")
    }`;

  return (
    <>
      <div className="mx-auto flex items-center text-2xl mb-3 lg:mb-6">
        <div className="">Deine Top Hashtags und Kategorien</div>
      </div>

      <VizBoxRow
        values={[
          { head: `${stats.topHashtag}`, label: "Top Hashtag" },
          { head: `${stats.topLabel}`, label: "Top Kategorie" },
          { head: `${stats.totalVideos}`, label: "Anzahl Videos" },
          { head: `${stats.totalDays}`, label: "Tage" },
        ]}
      />

      <main
        className="flex flex-col items-stretch min-h-[50vh] grow"
        id="dataskop-export-screenshot-inner"
      >
        <TabBar
          datasource={datasource}
          setDatasource={setDatasource}
          options={[
            ["hashtags", "hashtags"],
            ["kategorien", "kategorien"],
          ]}
        />
        <Beeswarm data={data} tooltipFun={tooltip} />
      </main>
    </>
  );
};

export default VizTwo;
