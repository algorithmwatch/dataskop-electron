import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { getTopData } from "../utils/viz_two_utils";
import { getDayOfWeek } from "../utils/viz_one_utilities";
import VizBoxes from "./VizBoxes";
import VizOneDropDown from "./VizOneDropDown";
import VizOneButtons from "./VizOneButtons";
import React from "react";
import addTooltips from "../utils/tooltips";

function VizTwo(props) {
  // const soundRef = useRef();
  // const hashtagsRef = useRef();
  // const diverseRef = useRef();
  const toggleRef = useRef();

  let coreTimeString = null;
  const rangeOptions = [
    { option: "letzte 90 Tage", value: 90 },
    { option: "letzte 180 Tage", value: 180 },
    { option: "letzte 365 Tage", value: 365 },
  ];
  const [range, setRange] = useState(rangeOptions[0]);

  const topNumOptions = [
    { option: "3", value: 3 },
    { option: "5", value: 5 },
    { option: "10", value: 10 },
  ];
  const [topNum, setTopNum] = useState(topNumOptions[0]);

  const [
    hashtagData,
    soundData,
    diverseLabelData,
    topHashtag,
    topSound,
    topDivLabel,
  ] = React.useMemo(
    () =>
      getTopData(topNum.value, 7, range.value, props.metadata, props.gdprData),
    [topNum.value, 7, range.value]
  );

  // console.log("hashtagdata", hashtagData);
  const [highlighted, setHighlight] = useState(null);

  const graphOptions = [
    { option: "sound", value: "default" },
    { option: "hashtags", value: "hashtags" },
    { option: "divlabels", value: "divlabels" },
  ];
  const [graph, setGraph] = useState(graphOptions[0].value);

  const commonProps = {
    width: 1500,
    marginBottom: 60,
    marginTop: 60,
    height: 600,
    marginLeft: 60,
    marginRight: 60,
    style: {
      background: "transparent",
    },
    x: {
      type: "point",
      tickFormat: (d) =>
        `${d.getDate()}.${d.getMonth() === 0 ? 12 : d.getMonth() + 1}`,
      // tickFormat: (d) =>
      //   `${d.getDate()}.${
      //     d.getMonth() === 0 ? 12 : d.getMonth() + 1
      //   }.${d.getFullYear()}`,
      // tickRotate: -90,
      label: "Zeitverlauf",
    },
    // x: {
    //   axis: "top",
    // },
    // r: {
    //   range: [0, 20],
    // },
    color: {
      type: "categorical",
      scheme: "set2",
      legend: true,
      // range: ['#ff0050', '#000000', '#00f2ea']
      // className: "top-items",
      // swatchSize: 20,
      // tickFormat: (hashtagData) => `#${hashtagData.Name}`,
    },
  };

  const commonLineProps = {
    x: "DateStart",
    y: "Count",
    z: "Name",
    title: (d) => `${d.Name}: ${d.Count}`,
    strokeOpacity:
      highlighted === null ? 1 : (d) => (d.Name === highlighted ? 1 : 0.5),
    strokeWidth:
      highlighted === null ? 3 : (d) => (d.Name === highlighted ? 4 : 2),
    stroke: "Name",
    sort: (d) => highlighted === null || d.Name === highlighted,
  };

  const commonDotProps = {
    x: "DateStart",
    y: "Count",
    title: (d) => `${d.Name}: ${d.Count}`,
    stroke: "currentColor",
    strokeOpacity:
      highlighted === null ? 1 : (d) => (d.Name === highlighted ? 1 : 0.3),
    r: 7,
    fill: "Name",
    fillOpacity:
      highlighted === null ? 1 : (d) => (d.Name === highlighted ? 1 : 0.3),
  };

  useEffect(() => {
    if (hashtagData === undefined) return;
    const chart = addTooltips(
      Plot.plot({
        ...commonProps,
        y: {
          grid: true,
          label:
            graph === "default"
              ? "Frequency of Sounds"
              : graph === "hashtags"
              ? "Frequency of Hashtags"
              : "Frequency of Categories",
        },
        marks: [
          Plot.ruleY([0]),
          Plot.line(
            graph === "default"
              ? soundData
              : graph === "hashtags"
              ? hashtagData
              : diverseLabelData,
            { ...commonLineProps }
          ),
          Plot.dot(
            graph === "default"
              ? soundData
              : graph === "hashtags"
              ? hashtagData
              : diverseLabelData,
            { ...commonDotProps }
          ),
        ],
      }),
      (e) => setHighlight(e.match(/(.*):.*/)[1]),
      () => setHighlight(null)
    );
    toggleRef.current.append(chart);

    return () => chart.remove();
  }, [
    graph === "default"
      ? soundData
      : graph === "hashtags"
      ? hashtagData
      : diverseLabelData,
    highlighted,
  ]);

  return (
    <div className="App">
      <header className="VizOne-header flex">
        Show your top
        <VizOneDropDown
          options={topNumOptions}
          onChange={(e) => {
            setTopNum(e);
          }}
          selected={topNum}
        />
        sounds, hashtags, and video categories in the{" "}
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
            statistic={`#${Object.keys(topHashtag)}`}
            statisticText="Most Frequent Hashtag OAT"
          />
        </div>
        <div className="box2">
          <VizBoxes
            statistic={`${Object.keys(topSound)}`}
            statisticText="Most Frequent Sound OAT"
          />
        </div>
        <div className="box3">
          <VizBoxes
            statistic={`${Object.keys(topDivLabel)}s`}
            statisticText="Most Frequent Category OAT"
          />
        </div>
      </div>
      <div className="toggle-button" ref={toggleRef}>
        <div className="flex center">
          <VizOneButtons
            // toggleColor="pink-toggle"
            // classname1="w-11 h-6 bg-pink-light rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-pink-light dark:peer-focus:ring-pink-light peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-dark"
            id="sounds"
            label="Sounds/Music"
            checked={graph === "default"}
            onChange={(e) => {
              setGraph("default");
            }}
          />
          <VizOneButtons
            // toggleColor="pink-toggle"
            // classname1="w-11 h-6 bg-pink-light rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-pink-light dark:peer-focus:ring-pink-light peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-dark"
            // textLabel="Tageszeiten"
            id="hashtags"
            label="Hashtags"
            checked={graph === "hashtags"}
            onChange={(e) => {
              setGraph("hashtags");
            }}
          />
          <VizOneButtons
            // toggleColor="pink-toggle"
            // classname1="w-11 h-6 bg-pink-light rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-pink-light dark:peer-focus:ring-pink-light peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-dark"
            id="divlabels"
            label="Diversification Labels/Categories"
            checked={graph === "divlabels"}
            onChange={(e) => {
              setGraph("divlabels");
            }}
          />
        </div>
      </div>
      {/* <div ref={soundRef}></div>

      <h2>Hashtags</h2>
      <div ref={hashtagsRef}></div>

      <h2>Diversification Labels</h2>
      <div ref={diverseRef}></div> */}
    </div>
  );
}

export default VizTwo;
