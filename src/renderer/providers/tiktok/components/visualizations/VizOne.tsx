import { faPenToSquare } from "@fortawesome/pro-regular-svg-icons";
import * as Plot from "@observablehq/plot";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SelectInput } from "renderer/providers/tiktok/components/visualizations/SelectInput";
import VizOneToggleButtons from "./components/VizOneButtons";
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

const commonProps = {
  width: 2000,
  marginBottom: 75,
  marginTop: 60,
  height: 500,
  marginLeft: 60,
  marginRight: 60,
  style: {
    background: "transparent",
  },
  x: {
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

  const [
    videodata,
    logindata,
    loginObj,
    tiktokLiveVids,
    likedVids,
    sharedVids,
    savedVids,
  ] = useMemo(() => shortenGdprData(gdprData), [gdprData]);
  const [range, setRange] = useState(rangeOptions[0]);
  const [graph, setGraph] = useState(graphOptions[0].value);

  const [totActivity, avgMinsPerDay, numAppOpen, coreTimeString, videoData] =
    React.useMemo(
      () =>
        arrangeDataVizOne(graph, range.value, videodata, logindata, loginObj),
      [graph, range.value],
    );

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
      label: "Number of Videos",
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
            title: (d) => `Number of vids: `,
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
      <div className="mx-auto flex items-center text-xl">
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

      <div>
        <VizBox head={totActivity} label="Activität" />
        <VizBox head={avgMinsPerDay} label="pro Tag" />
        <VizBox head={`${numAppOpen} x`} label="App geöffnet" />
        <VizBox head={`${coreTimeString} h`} label="Kernzeit" />
      </div>
      <div>
        <div className="flex">
          <VizOneToggleButtons
            // toggleColor="pink-toggle"
            // classname1="w-11 h-6 bg-pink-light rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-pink-light dark:peer-focus:ring-pink-light peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-dark"
            id="activity"
            label="Activity"
            checked={graph === "default"}
            onChange={(e) => {
              setGraph("default");
            }}
          />
          <VizOneToggleButtons
            // toggleColor="pink-toggle"
            // classname1="w-11 h-6 bg-pink-light rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-pink-light dark:peer-focus:ring-pink-light peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-dark"
            // textLabel="Tageszeiten"
            id="tageszeiten"
            label="Tageszeiten"
            checked={graph === "timeslots"}
            onChange={(e) => {
              setGraph("timeslots");
            }}
          />
          <VizOneToggleButtons
            // toggleColor="pink-toggle"
            // classname1="w-11 h-6 bg-pink-light rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-pink-light dark:peer-focus:ring-pink-light peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-dark"
            id="watchtime"
            label="Watchtime"
            checked={graph === "watchtime"}
            onChange={(e) => {
              setGraph("watchtime");
            }}
          />
        </div>
      </div>
      <div ref={toggleRef} />
    </>
  );
}

export default VizOne;
