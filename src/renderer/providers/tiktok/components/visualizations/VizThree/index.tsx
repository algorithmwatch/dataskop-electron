/* eslint-disable jsx-a11y/anchor-is-valid */
import { useMemo } from "react";
import { VizBoxRow } from "../VizBox";
import BeeswarmConnected from "./BeeswarmConnected";
import { transformData } from "./data";

export default function VizThree({ gdprData, metadata }) {
  const { allData } = useMemo(
    () => transformData(gdprData, metadata),
    [gdprData, metadata],
  );

  console.log(allData);

  return (
    <>
      <div className="mx-auto flex items-center text-2xl mb-6">
        <div className="">Deine Interaktionen mit Anderen</div>
      </div>

      <VizBoxRow
        values={[
          { head: "345 Kanäle", label: "insgesamt" },
          { head: "1234 Videos", label: "gesehen" },
          { head: "33 x", label: "geliked" },
          { head: "45 Videos", label: "mit anderen geteilt" },
          { head: "123 x", label: "kommentiert" },
        ]}
      />

      <main className="flex flex-col items-stretch min-h-[50vh] grow">
        <BeeswarmConnected data={allData} />
      </main>
    </>
  );
}
