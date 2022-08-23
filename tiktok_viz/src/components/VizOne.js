import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { arrangeDataVizOne } from "../utils/viz_one_utilities";
import VizOneBoxes from "./VizBoxes";
import VizOneDropDown from "./VizOneDropDown";
import VizOneToggleButtons from "./VizOneButtons";
import React from "react";
import addTooltips from "../utils/tooltips";

function rangeOfTime(timeofday) {
  if (timeofday === "Morgens") return "6:00 - 11:59";
  if (timeofday === "Mittags") return "12:00 - 17:59";
  if (timeofday === "Abends") return "18:00 - 21:59";
  if (timeofday === "Nachts") return "22:00 - 5:59";
}

function VizOne() {
  const toggleRef = useRef();

  const rangeOptions = [
    { option: "letzte 7 Tage", value: 7 },
    { option: "letzte 30 Tage", value: 30 },
    { option: "letzte 90 Tage", value: 90 },
  ];
  const [range, setRange] = useState(rangeOptions[0]);

  const graphOptions = [
    { option: "solid bars, watch activity", value: "default" },
    { option: "time slot bars, watch activity", value: "timeslots" },
    { option: "percentage bars, watchtime", value: "watchtime" },
  ];
  const [graph, setGraph] = useState(graphOptions[0].value);

  const [totActivity, avgMinsPerDay, numAppOpen, coreTimeString, videoData] =
    React.useMemo(
      () => arrangeDataVizOne(graph, range.value),
      [graph, range.value]
    );

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
        }.${d.getFullYear()}`,
      tickRotate: -90,
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
        })
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
          }
        )
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
          : watchtimePlot
      )
    );
    toggleRef.current.append(chart);
    return () => chart.remove();
  }, [videoData, graph]);

  return (
    <div className="App">
      <header className="VizOne-header flex">
        <div>Deine Nutzungszeit </div>
        <VizOneDropDown
          options={rangeOptions}
          onChange={(e) => {
            setRange(e);
          }}
          selected={range}
        />
      </header>
      <div className="ui-container-stats">
        <div className="box1">
          <VizOneBoxes statistic={totActivity} statisticText="Activität" />
        </div>
        <div className="box2">
          <VizOneBoxes statistic={avgMinsPerDay} statisticText="pro Tag" />
        </div>
        <div className="box3">
          <VizOneBoxes
            statistic={`${numAppOpen} x`}
            statisticText="App geöffnet"
          />
        </div>
        <div className="box4">
          <VizOneBoxes
            statistic={`${coreTimeString} h`}
            statisticText="Kernzeit"
          />
        </div>
      </div>
      <div className="toggle-button" ref={toggleRef}>
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
      <div ref={toggleRef}></div>
    </div>
  );
}

export default VizOne;
