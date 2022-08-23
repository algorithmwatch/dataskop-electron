import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { getTopData } from "../utils/viz_two_utils";
import VizBoxes from "./VizBoxes";
import VizOneDropDown from "./VizOneDropDown";
import VizOneButtons from "./VizOneButtons";
import React from "react";
import addTooltips from "../utils/tooltips";

function VizOne() {
  const headerRef = useRef();
  const boxesRef = useRef();
  const toggleRef = useRef();

  let totActivity = null;
  let avgMinsPerDay = null;
  let numAppOpen = null;
  let coreTimeString = null;
  const rangeOptions = [
    { option: "letzte 7 Tage", value: 7 },
    { option: "letzte 30 Tage", value: 30 },
    { option: "letzte 90 Tage", value: 90 },
  ];
  const [range, setRange] = useState(rangeOptions[0]);
  // const [totActivity, avgMinsPerDay, numAppOpen, coreTimeString, videoData] =
  //   React.useMemo(
  //     () => arrangeDataVizOne(timeSlots, range.value),
  //     [timeSlots, range.value]
  //   );

  const [hashtagData, soundData, diverseLabelData] = getTopData(7, 20);
  console.log(hashtagData);

  //   useEffect(() => {
  //     d3.csv("/gistemp.csv", d3.autoType).then(setData);
  //   }, []);

  // useEffect(() => {
  //   if (hashtagData === undefined) return;
  //   const chart = addTooltips(
  //     Plot.plot({
  //       width: 1000,
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
  //         label: "Frequency of Hashtags",
  //       },
  //       color: {
  //         type: "categorical",
  //         scheme: "accent",
  //         legend: true,
  //       },
  //       marks: [
  //         Plot.ruleY([0]),
  //         Plot.dot(hashtagData, {
  //           x: "DateStart",
  //           y: "Count",
  //           stroke: "Name",
  //         }),
  //       ],
  //     })
  //   );
  //   // headerRef.current.append(chart);
  //   toggleRef.current.append(chart);
  //   // toggleRef.current.append(chart);
  //   return () => chart.remove();
  // }, [hashtagData]);

  // useEffect(() => {
  //   if (soundData === undefined) return;
  //   const chart = addTooltips(
  //     Plot.plot({
  //       width: 1000,
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
  //         label: "Frequency of Sounds",
  //       },
  //       color: {
  //         type: "categorical",
  //         scheme: "accent",
  //         legend: true,
  //       },
  //       marks: [
  //         Plot.ruleY([0]),
  //         Plot.dot(soundData, {
  //           x: "DateStart",
  //           y: "Count",
  //           stroke: "Name",
  //         }),
  //       ],
  //     })
  //   );

  useEffect(() => {
    if (diverseLabelData === undefined) return;
    const chart = addTooltips(
      Plot.plot({
        width: 1000,
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
          label: "Frequency of Categories",
        },
        color: {
          type: "categorical",
          scheme: "accent",
          legend: true,
        },
        marks: [
          Plot.ruleY([0]),
          Plot.dot(diverseLabelData, {
            x: "DateStart",
            y: "Count",
            title: (d) => `${d.Name}`,
            stroke: "Name",
          }),
        ],
      })
    );

    // headerRef.current.append(chart);
    toggleRef.current.append(chart);
    // toggleRef.current.append(chart);
    return () => chart.remove();
  }, [diverseLabelData]);

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
          <VizBoxes
            statistic={`${totActivity} min.`}
            statisticText="Activität"
          />
        </div>
        <div className="box2">
          <VizBoxes
            statistic={`${avgMinsPerDay} min.`}
            statisticText="pro Tag"
          />
        </div>
        <div className="box3">
          <VizBoxes
            statistic={`${numAppOpen} x`}
            statisticText="App geöffnet"
          />
        </div>
        <div className="box4">
          <VizBoxes
            statistic={`${coreTimeString} h`}
            statisticText="Kernzeit"
          />
        </div>
      </div>
      <div ref={toggleRef}></div>
    </div>
  );
}

export default VizOne;
