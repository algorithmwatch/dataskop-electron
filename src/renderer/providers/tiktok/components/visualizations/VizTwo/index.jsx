/* eslint-disable jsx-a11y/anchor-is-valid */
// import "./App.css";

import { useState, useMemo } from "react";
import Beeswarm from "./Beeswarm";

import { transformData } from "./data";

function DatasourceSwitch({ datasource, setDatasource }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="inline-flex shadow-md hover:shadow-lg focus:shadow-lg"
        role="group"
      >
        <a
          href="#"
          onClick={() => setDatasource("hashtags")}
          aria-current="page"
          className={`
        rounded-l
        px-6
        py-2.5
        font-medium
        text-xs
        leading-tight
        uppercase
        ${datasource === "hashtags" ? "bg-blue-800" : "bg-blue-600"}
        `}
        >
          Hashtags
        </a>
        <a
          href="#"
          onClick={() => setDatasource("diversification")}
          className={`
              px-6
              py-2.5
              font-medium
              text-xs
              leading-tight
              uppercase
              ${
                datasource === "diversification" ? "bg-blue-800" : "bg-blue-600"
              }
              `}
        >
          Diversification Labels
        </a>
      </div>
    </div>
  );
}

export default function VizTwo({ gdprData, metadata }) {
  const [datasource, setDatasource] = useState("hashtags");

  const { topDiversificationLabels, topHashtagsFlat } = useMemo(
    () => transformData(gdprData, metadata),
    [gdprData, metadata],
  );

  const data =
    datasource === "hashtags" ? topHashtagsFlat : topDiversificationLabels;
  return (
    <main className="viz-two-main">
      <DatasourceSwitch datasource={datasource} setDatasource={setDatasource} />
      <div className="flex items-center justify-center h-full">
        <Beeswarm data={data} />
      </div>
    </main>
  );
}
