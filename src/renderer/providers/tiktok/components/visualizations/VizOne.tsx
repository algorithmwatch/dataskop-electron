import { faPenToSquare } from "@fortawesome/pro-regular-svg-icons";
import * as Plot from "@observablehq/plot";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Switch from "renderer/components/Switch";
import { SelectInput } from "./SelectInput";
import { shortenGdprData } from "./utils/shorten_data";
import addTooltips from "./utils/tooltips";
import { arrangeDataVizOne } from "./utils/viz-utils";
import { VizBoxRow } from "./VizBox";

function rangeOfTime(timeofday: string) {
  switch (timeofday) {
    case "Morgens":
      return "6:00 - 11:59";
    case "Mittags":
      return "12:00 - 17:59";
    case "Abends":
      return "18:00 - 21:59";
    case "Nachts":
      return "22:00 - 5:59";
    default:
      throw new Error("Unexpected value for timeofday");
  }
}

const rangeOptions = [
  { id: "1", label: "letzte 7 Tage", value: 7 },
  { id: "2", label: "letzte 30 Tage", value: 30 },
  { id: "3", label: "letzte 90 Tage", value: 90 },
];

const graphOptions = [
  { option: "solid bars, watch activity", value: "default" },
  { option: "time slot bars, watch activity", value: "timeslots" },
  { option: "percentage bars, watchtime", value: "watchtime" },
];

function VizOne({ gdprData }: { gdprData: any }) {
  const toggleRef = useRef<null | HTMLDivElement>(null);
  const [range, setRange] = useState(rangeOptions[0]);
  const [graph, setGraph] = useState(graphOptions[0].value);
  const [
    videodata,
    logindata,
    loginObj,
    tiktokLiveVids,
    likedVids,
    sharedVids,
    savedVids,
  ] = useMemo(() => shortenGdprData(gdprData), [gdprData]);
  const [totActivity, avgMinsPerDay, numAppOpen, coreTimeString, videoData] =
    React.useMemo(
      () =>
        arrangeDataVizOne(graph, range.value, videodata, logindata, loginObj),
      [graph, range.value],
    );

  const smallerScreen = window.outerHeight <= 1000;
  const chartWidth = Math.round(window.outerWidth);
  const chartHeight = Math.round(
    window.outerHeight * (smallerScreen ? 0.5 : 0.7),
  );
  const commonProps = {
    width: chartWidth,
    height: chartHeight,
    marginBottom: smallerScreen ? 60 : 75,
    marginTop: smallerScreen ? 50 : 60,
    marginLeft: smallerScreen ? 50 : 60,
    marginRight: smallerScreen ? 50 : 60,
    style: {
      background: "transparent",
      fontSize: "18px",
    },
    x: {
      type: "band",
      tickFormat: (d) =>
        `${`0${d.getDate()}`.slice(-2)}.${`0${d.getMonth() + 1}`.slice(-2)}.`,
      label: "Zeitverlauf",
    },
  };
  const tickStep =
    videoData.length > 28 ? Math.round(videoData.length / 15) : 1;
  // console.warn("tickStep", tickStep);
  // console.warn("videoData.length", videoData.length);
  const timeslotsAndSingleColorBarsPlot = {
    ...commonProps,
    x: {
      ...commonProps.x,
      ticks: videoData
        .filter((_x: any, i: number) => i % tickStep === 0)
        .map((x) => x.Date),
    },
    y: {
      grid: true,
      label: "Minuten",
    },
    color: {
      legend: true,
      range: ["#330010", "#990030", "#ff0050", "#ff99b9"],
    },
    // scale: --> `${date_prev.getDate()}.${date_prev.getMonth() === 0 ? 12 : date_prev.getMonth() + 1}`
    marks: [
      Plot.barY(
        videoData,
        Plot.stackY({
          x: "Date",
          y: "TotalTime",
          title:
            graph === "timeslots"
              ? (d) =>
                  `<strong>${d.TimeOfDay}</strong> (${rangeOfTime(
                    d.TimeOfDay,
                  )}) aktiv, am ${d.Date.getDate()}. ${d.Date.toLocaleString(
                    "default",
                    {
                      month: "long",
                    },
                  )}`
              : (d) =>
                  `<strong>${d.TotalTime.toFixed(
                    0,
                  )} Min.</strong> aktiv am ${d.Date.getDate()}. ${d.Date.toLocaleString(
                    "default",
                    {
                      month: "long",
                    },
                  )}`,
          reverse: true,
          fill: graph === "timeslots" ? "TimeOfDay" : "#9999ff",
        }),
      ),
      Plot.ruleY([0]),
    ],
  };

  const watchtimePlot = {
    ...commonProps,
    y: {
      grid: true,
      label: "Nr. Videos",
    },
    color: {
      legend: true,
      range: ["#00f2ea", "#008f8a"],
    },
    marks: [
      Plot.barY(
        videoData,
        Plot.groupX(
          {
            y: "count",
          },
          {
            x: "Date",
            fill: "GapLabel",
            title: (d) => `Nr. Videos: `,
          },
        ),
      ),

      Plot.ruleY([0]),
    ],
  };

  useEffect(() => {
    if (videoData === undefined) return;
    const chart = addTooltips(
      Plot.plot(
        graph === "default" || graph === "timeslots"
          ? timeslotsAndSingleColorBarsPlot
          : watchtimePlot,
      ),
    );
    if (toggleRef.current) toggleRef.current.append(chart);
    return () => chart.remove();
  }, [videoData, graph]);

  return (
    <>
      <div className="mx-auto flex items-center text-2xl mb-6">
        <div className="">Deine Nutzungszeit</div>
        <div>
          <SelectInput
            options={rangeOptions}
            selectedOption={range}
            onUpdate={setRange}
            buttonIcon={faPenToSquare}
          />
        </div>
      </div>

      <VizBoxRow
        values={[
          { head: totActivity, label: "Aktivität" },
          { head: avgMinsPerDay, label: "pro Tag" },
          { head: `${numAppOpen} x`, label: "App geöffnet" },
          { head: `${coreTimeString} h`, label: "Kernzeit" },
        ]}
      />

      <div className="flex mx-auto space-x-4">
        <Switch
          label="Aktivität"
          checked={graph === "default"}
          onChange={(e) => {
            setGraph("default");
          }}
        />
        <Switch
          label="Tageszeiten"
          checked={graph === "timeslots"}
          onChange={(e) => {
            setGraph("timeslots");
          }}
        />
        <Switch
          label="Watchtime"
          checked={graph === "watchtime"}
          onChange={(e) => {
            setGraph("watchtime");
          }}
        />
      </div>

      {/* Chart wrapper */}
      <div
        ref={toggleRef}
        className="w-full mt-6 min-h-[50vh]"
        id="dataskop-export-screenshot-inner"
      />
    </>
  );
}

export default VizOne;
