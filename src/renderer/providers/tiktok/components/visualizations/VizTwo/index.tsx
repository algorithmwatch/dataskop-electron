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
        <div className="min-w-[12rem] ">
          <a
            href="#"
            onClick={() => setDatasource("hashtags")}
            aria-current="page"
            className={`
            grow rounded-l-md py-2 flex flex-col items-center
        ${
          datasource === "hashtags"
            ? "bg-gradient-to-t from-white to-transparent"
            : "opacity-70"
        }
        `}
          >
            Hashtags
          </a>
        </div>
        <div className="min-w-[12rem]">
          <a
            href="#"
            onClick={() => setDatasource("diversification")}
            className={`
          grow rounded-r-md  py-2 flex flex-col items-center
              ${
                datasource === "diversification"
                  ? "bg-gradient-to-t from-white to-transparent"
                  : "opacity-70"
              }
              `}
          >
            Diversification Labels
          </a>
        </div>
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

  console.log(data);
  return (
    <>
      <div className="mx-auto flex items-center text-2xl mb-6">
        <div className="">Deine XXXX</div>
      </div>

      <VizBoxRow
        values={[
          { head: "todo", label: "todo1" },
          { head: "todo", label: "todo2" },
          { head: "todo", label: "todo3" },
          { head: "todo", label: "todo4" },
        ]}
      />

      <main className="flex flex-col items-stretch min-h-[50vh] grow">
        <DatasourceSwitch
          datasource={datasource}
          setDatasource={setDatasource}
        />
        <Beeswarm data={data} />
      </main>
    </>
  );
}
