import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { arrangeDataVizOne } from "../utils/viz_utilities";
import VizOneBoxes from "./VizOneBoxes";
import VizOneDropDown from "./VizOneDropDown";
import VizOneToggleButtons from "./VizOneToggleButtons";
import React from "react";

function VizOne() {
  const headerRef = useRef();
  const boxesRef = useRef();
  const toggleRef = useRef();
  // store whether or not user clicked on button to show time slots (default unclicked)
  // timeSlotsFunc = () => false;
  let timeSlots = true;
  // have to input 6, 29, or 89 days to get proper amount of days
  let timeRange = 29; // this will be linked to button

  const rangeOptions = [
    { option: "letzte 7 Tage", value: 6 },
    { option: "letzte 30 Tage", value: 29 },
    { option: "letzte 90 Tage", value: 89 },
  ];
  const [range, setRange] = useState(rangeOptions[0]);
  // useEffect(() => {setData(data);)};
  const [totActivity, avgMinsPerDay, numAppOpen, coreTimeString, videoData] =
    React.useMemo(
      () => arrangeDataVizOne(timeSlots, range.value),
      [timeSlots, range.value]
    );
  // const options = ["letzte 7 Tage", "letzte 30 Tage", "letzte 90 Tage"];

  //   useEffect(() => {
  //     arrangeDataVizOne(timeSlots).then(setData);
  //   }, []);
  //   let videoData = arrangeDataVizOne(timeSlots);

  //   useEffect(() => {
  //     d3.csv("/gistemp.csv", d3.autoType).then(setData);
  //   }, []);

  useEffect(() => {
    if (videoData === undefined) return;
    const chart = Plot.plot({
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
            reverse: true,
            fill: timeSlots ? "TimeOfDay" : "black",
          })
        ),
        Plot.ruleY([0]),
      ],
    });
    // headerRef.current.append(chart);
    boxesRef.current.append(chart);
    // toggleRef.current.append(chart);
    return () => chart.remove();
  }, [videoData]);

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
      <div className="toggle-button" ref={toggleRef}>
        <VizOneToggleButtons
          onClick={() => {
            timeSlots = true;
          }}
          toggleColor="pink-toggle"
          classname1="w-11 h-6 bg-pink-light rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-pink-light dark:peer-focus:ring-pink-light peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-dark"
          textLabel="Tageszeiten"
        />
        <VizOneToggleButtons
          toggleColor="aqua-toggle"
          classname1="w-11 h-6 bg-aqua-light rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-aqua-light dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-aqua-dark"
          textLabel="Watchtime in %"
        />
      </div>
      <div className="ui-container-stats" ref={boxesRef}>
        <div className="box1">
          <VizOneBoxes
            statistic={`${totActivity} min.`}
            statisticText="Activität"
          />
        </div>
        <div className="box2">
          <VizOneBoxes
            statistic={`${avgMinsPerDay} min.`}
            statisticText="pro Tag"
          />
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
    </div>
  );
}

export default VizOne;
