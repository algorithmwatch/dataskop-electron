import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { getTopData } from "../utils/viz_two_utils";
import VizBoxes from "./VizBoxes";
import VizOneDropDown from "./VizOneDropDown";
import VizOneButtons from "./VizOneButtons";
import React from "react";
import addTooltips from "../utils/tooltips";

function VizTwo() {
  const soundRef = useRef();
  const hashtagsRef = useRef();
  const diverseRef = useRef();

  let totActivity = null;
  let avgMinsPerDay = null;
  let numAppOpen = null;
  let coreTimeString = null;
  const rangeOptions = [
    { option: "letzte 90 Tage", value: 90 },
    { option: "letzte 180 Tage", value: 180 },
    { option: "letzte 365 Tage", value: 365 },
  ];
  const [range, setRange] = useState(rangeOptions[0]);

  const [hashtagData, soundData, diverseLabelData] = React.useMemo(
    () => getTopData(7, range.value),
    [7, range.value]
  );

  // const [hashtagData, soundData, diverseLabelData] = getTopData(7, 365);

  useEffect(() => {
    if (hashtagData === undefined) return;
    const chart = addTooltips(
      Plot.plot({
        width: 1000,
        marginBottom: 200,
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
          label: "Frequency of Hashtags",
        },
        color: {
          type: "categorical",
          scheme: "set2",
          legend: true,
        },
        marks: [
          Plot.ruleY([0]),
          Plot.line(hashtagData, {
            x: "DateStart",
            y: "Count",
            z: "Name",
            strokeWidth: 1.5,
            stroke: "Name",
          }),
          Plot.dot(hashtagData, {
            x: "DateStart",
            y: "Count",
            title: (d) => `${d.Name}`,
            stroke: "currentColor",
            r: 7,
            fill: "Name",
          }),
        ],
      })
    );
    // headerRef.current.append(chart);
    hashtagsRef.current.append(chart);
    // toggleRef.current.append(chart);
    return () => chart.remove();
  }, [hashtagData]);

  useEffect(() => {
    if (soundData === undefined) return;
    const chart = addTooltips(
      Plot.plot({
        width: 1000,
        marginBottom: 200,
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
          label: "Frequency of Sounds",
        },
        color: {
          type: "categorical",
          scheme: "set2",
          legend: true,
        },
        marks: [
          Plot.ruleY([0]),
          Plot.line(soundData, {
            x: "DateStart",
            y: "Count",
            z: "Name",
            strokeWidth: 1.5,
            stroke: "Name",
          }),
          Plot.dot(soundData, {
            x: "DateStart",
            y: "Count",
            title: (d) => `${d.Name}`,
            stroke: "currentColor",
            r: 7,
            fill: "Name",
          }),
        ],
      })
    );
    soundRef.current.append(chart);
    return () => chart.remove();
  }, [diverseLabelData]);

  useEffect(() => {
    if (diverseLabelData === undefined) return;
    const chart = addTooltips(
      Plot.plot({
        width: 1000,
        marginBottom: 200,
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
          scheme: "set2",
          legend: true,
        },
        marks: [
          Plot.ruleY([0]),
          Plot.line(diverseLabelData, {
            x: "DateStart",
            y: "Count",
            z: "Name",
            strokeWidth: 1.5,
            stroke: "Name",
          }),
          Plot.dot(diverseLabelData, {
            x: "DateStart",
            y: "Count",
            title: (d) => `${d.Name}`,
            stroke: "currentColor",
            r: 7,
            fill: "Name",
          }),
        ],
      })
    );

    diverseRef.current.append(chart);
    return () => chart.remove();
  }, [diverseLabelData]);

  return (
    <div className="App">
      <header className="VizOne-header flex">
        Your Sounds, Hashtags, and Video Categories in the{" "}
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
            statisticText="Most Frequent Hashtag OAT"
          />
        </div>
        <div className="box2">
          <VizBoxes
            statistic={`${avgMinsPerDay} min.`}
            statisticText="Most Frequent Sound OAT"
          />
        </div>
        <div className="box3">
          <VizBoxes
            statistic={`${numAppOpen} x`}
            statisticText="Most Frequent Category OAT"
          />
        </div>
        <div className="box4">
          <VizBoxes
            statistic={`${coreTimeString} h`}
            statisticText="Kernzeit"
          />
        </div>
      </div>
      <h2>Sounds</h2>
      <div ref={soundRef}></div>

      <h2>Hashtags</h2>
      <div ref={hashtagsRef}></div>

      <h2>Diversification Labels</h2>
      <div ref={diverseRef}></div>
    </div>
  );
}

export default VizTwo;
