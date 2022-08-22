import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { arrangeDataVizOne } from "../utils/viz_one_utilities";
import VizOneBoxes from "./VizBoxes";
import VizOneDropDown from "./VizOneDropDown";
import VizOneToggleButtons from "./VizOneToggleButtons";
import React from "react";
import addTooltips from "../utils/tooltips";

function rangeOfTime(timeofday) {
  if (timeofday === "Morgens") return "6:00 - 11:59";
  if (timeofday === "Mittags") return "12:00 - 17:59";
  if (timeofday === "Abends") return "18:00 - 21:59";
  if (timeofday === "Nachts") return "22:00 - 5:59";
}

function VizOne() {
  const headerRef = useRef();
  const boxesRef = useRef();
  const toggleRef = useRef();
  // store whether or not user clicked on button to show time slots (default unclicked)
  // timeSlotsFunc = () => false;
  let typeOfGraph = "timeslots";
  // let totActivity = null;
  // let avgMinsPerDay = null;
  // let numAppOpen = null;
  // let coreTimeString = null;

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
  const [graph, setGraph] = useState(graphOptions[0]);
  // const [totActivity, avgMinsPerDay, numAppOpen, coreTimeString, videoData] =
  //   arrangeDataVizOne(graphOptions[1].value, rangeOptions[1].value);

  const [totActivity, avgMinsPerDay, numAppOpen, coreTimeString, videoData] =
    React.useMemo(
      () => arrangeDataVizOne(typeOfGraph, range.value),
      [typeOfGraph, range.value]
    );

  //   useEffect(() => {
  //     d3.csv("/gistemp.csv", d3.autoType).then(setData);
  //   }, []);

  useEffect(() => {
    if (videoData === undefined) return;
    const chart = addTooltips(
      Plot.plot({
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
        y: {
          grid: true,
          label: "Minuten",
        },
        color: {
          legend: true,
          range: ["#330010", "#990030", "#ff0050", "#ff99b9"],
        },
        //   color: {
        //     type: "diverging",
        //     scheme: "burd",
        //   },
        // scale: --> `${date_prev.getDate()}.${date_prev.getMonth() === 0 ? 12 : date_prev.getMonth() + 1}`
        marks: [
          Plot.barY(
            videoData,
            Plot.stackY({
              x: "Date",
              y: "TotalTime",
              title: (d) => `${d.TimeOfDay}: ${rangeOfTime(d.TimeOfDay)}`,
              reverse: true,
              fill: typeOfGraph === "timeslots" ? "TimeOfDay" : "black",
            })
          ),
          Plot.ruleY([0]),
        ],
      })
    );
    // headerRef.current.append(chart);
    toggleRef.current.append(chart);
    // toggleRef.current.append(chart);
    return () => chart.remove();
  }, [videoData]);
  console.log(videoData);

  // useEffect(() => {
  //   if (videoData === undefined) return;
  //   const chart = addTooltips(
  //     Plot.plot({
  //       width: 2000,
  //       marginBottom: 75,
  //       marginTop: 60,
  //       height: 500,
  //       marginLeft: 60,
  //       marginRight: 60,
  //       style: {
  //         background: "transparent",
  //       },
  //       x: {
  //         tickFormat: (d) =>
  //           `${d.getDate()}.${
  //             d.getMonth() === 0 ? 12 : d.getMonth() + 1
  //           }.${d.getFullYear()}`,
  //         tickRotate: -90,
  //         label: "Zeitverlauf",
  //       },
  //       y: {
  //         grid: true,
  //         label: "Number of Videos",
  //       },
  //       color: {
  //         legend: true,
  //         range: ["#00f2ea", "#008f8a"],
  //       },
  //       //   color: {
  //       //     type: "diverging",
  //       //     scheme: "burd",
  //       //   },
  //       // scale: --> `${date_prev.getDate()}.${date_prev.getMonth() === 0 ? 12 : date_prev.getMonth() + 1}`
  //       marks: [
  //         Plot.barY(
  //           videoData,
  //           Plot.groupX(
  //             {
  //               y: "count",
  //             },
  //             { x: "Date", fill: "GapLabel" }
  //             // {
  //             //   y: "sum",
  //             // },
  //             // { x: "Date", y: "GapLength", fill: "GapLabel" }
  //             // title: (d) => `${d.TimeOfDay}: ${rangeOfTime(d.TimeOfDay)}`,
  //           )
  //         ),
  //         Plot.ruleY([0]),
  //       ],
  //     })
  //   );
  //   // headerRef.current.append(chart);
  //   toggleRef.current.append(chart);
  //   // toggleRef.current.append(chart);
  //   return () => chart.remove();
  // }, [videoData]);

  return (
    <div className="App">
      <header className="VizOne-header" ref={headerRef}>
        Deine Nutzungszeit{" "}
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
        {/* <VizOneDropDown
          options={graphOptions}
          onChange={(e) => {
            setGraph(e);
          }}
          selected={graph}
        /> */}
        <VizOneToggleButtons
          // onClick={(e) => {
          //   setGraph(e);
          // }}
          // selected={graph}
          // toggleColor="pink-toggle"
          // classname1="w-11 h-6 bg-pink-light rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-pink-light dark:peer-focus:ring-pink-light peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-dark"
          // textLabel="Tageszeiten"
          defClicked={true}
          label="Activity"
        />
        <VizOneToggleButtons
          // onClick={(e) => {
          //   setGraph(e);
          // }}
          // selected={graph}
          // toggleColor="pink-toggle"
          // classname1="w-11 h-6 bg-pink-light rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-pink-light dark:peer-focus:ring-pink-light peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-dark"
          // textLabel="Tageszeiten"
          id="tageszeiten"
          defClicked={false}
          label="Tageszeiten"
        />
        <VizOneToggleButtons
          // onClick={(e) => {
          //   setGraph(e);
          // }}
          // selected={graph}
          // toggleColor="pink-toggle"
          // classname1="w-11 h-6 bg-pink-light rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-pink-light dark:peer-focus:ring-pink-light peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-dark"
          id="watchtime"
          defClicked={false}
          label="Watchtime"
        />
      </div>
      <div ref={toggleRef}></div>
    </div>
  );
}

export default VizOne;
