import { faPenToSquare } from "@fortawesome/pro-regular-svg-icons";
import * as Plot from "@observablehq/plot";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Switch from "renderer/components/Switch";
import { SelectInput } from "renderer/providers/tiktok/components/visualizations/SelectInput";
import { shortenGdprData } from "./utils/shorten_data";
import addTooltips from "./utils/tooltips";
import { arrangeDataVizOne, getDayOfWeek } from "./utils/viz-utils";
import { VizBox } from "./VizBox";

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

  const chartWidth = Math.round((window.outerWidth * 90) / 100);
  const commonProps = {
    width: chartWidth,
    marginBottom: 75,
    marginTop: 60,
    height: 500,
    marginLeft: 60,
    marginRight: 60,
    style: {
      background: "transparent",
      fontSize: "16px",
    },
    x: {
      type: "band",
      tickFormat: (d) =>
        `${d.getDate()}.${
          d.getMonth() === 0 ? 12 : d.getMonth() + 1
        }\n${getDayOfWeek(d)}`,
      // tickFormat: (d) =>
      //   `${d.getDate()}.${
      //     d.getMonth() === 0 ? 12 : d.getMonth() + 1
      //   }.${d.getFullYear()}`,
      // tickRotate: -90,
      label: "Zeitverlauf",
    },
  };

  const timeslotsAndSingleColorBarsPlot = {
    ...commonProps,
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
              ? (d) => `${d.TimeOfDay}: ${rangeOfTime(d.TimeOfDay)}`
              : (d) => `${d.TotalTime.toFixed(0)} min.`,
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

      <div className="flex mx-auto space-x-4 mb-6">
        <VizBox head={totActivity} label="Aktivität" />
        <VizBox head={avgMinsPerDay} label="pro Tag" />
        <VizBox head={`${numAppOpen} x`} label="App geöffnet" />
        <VizBox head={`${coreTimeString} h`} label="Kernzeit" />
      </div>

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
      <div ref={toggleRef} className="w-full min-h-[50vh]" />
    </>
  );
}

export default VizOne;
