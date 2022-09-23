/* eslint-disable no-nested-ternary */
import { faPenToSquare } from "@fortawesome/pro-regular-svg-icons";
import * as Plot from "@observablehq/plot";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Switch from "renderer/components/Switch";
import { SelectInput } from "renderer/providers/tiktok/components/visualizations/SelectInput";
import { shortenGdprData } from "./utils/shorten_data";
import addTooltips from "./utils/tooltips";
import { convertDaysToMs } from "./utils/viz-utils";
import { getTopData } from "./utils/viz_two_utils";
import { VizBox } from "./VizBox";

const rangeOptions = [
  { id: "1", label: "letzte 90 Tage", value: 90 },
  { id: "2", label: "letzte 180 Tage", value: 180 },
  { id: "3", label: "letzte 365 Tage", value: 365 },
];
const topNumOptions = [
  { id: "1", label: "3", value: 3 },
  { id: "2", label: "5", value: 5 },
  { id: "3", label: "10", value: 10 },
];

function VizTwo({ metadata, gdprData }: { gdprData: any; metadata: any }) {
  const [
    videodata,
    logindata,
    loginObj,
    tiktokLiveVids,
    likedVids,
    sharedVids,
    savedVids,
  ] = useMemo(() => shortenGdprData(gdprData), [gdprData]);

  // const soundRef = useRef();
  // const hashtagsRef = useRef();
  // const diverseRef = useRef();
  const toggleRef = useRef(null);

  const coreTimeString = null;
  const [range, setRange] = useState(rangeOptions[0]);
  const [topNum, setTopNum] = useState(topNumOptions[0]);

  const [
    hashtagData,
    soundData,
    diverseLabelData,
    topHashtag,
    topSound,
    topDivLabel,
  ] = React.useMemo(
    () => getTopData(topNum.value, 7, range.value, metadata, videodata),
    [topNum.value, 7, range.value],
  );

  // console.log("hashtagdata", hashtagData);
  const [highlighted, setHighlight] = useState(null);

  const graphOptions = [
    { option: "sound", value: "default" },
    { option: "hashtags", value: "hashtags" },
    { option: "divlabels", value: "divlabels" },
  ];
  const [graph, setGraph] = useState(graphOptions[0].value);

  function getRightFormat(d) {
    const enddate = new Date(d - convertDaysToMs(7 - 1));
    return `${enddate.getDate()}.${
      enddate.getMonth() === 0 ? 12 : enddate.getMonth() + 1
    } - ${d.getDate()}.${d.getMonth() === 0 ? 12 : d.getMonth() + 1}`;
  }
  const chartWidth = Math.round((window.outerWidth * 90) / 100);
  const chartHeight = Math.round((window.outerHeight * 40) / 100);
  const commonProps = {
    width: chartWidth,
    height: chartHeight,
    marginBottom: 60,
    marginTop: 60,
    marginLeft: 60,
    marginRight: 60,
    style: {
      background: "transparent",
    },
    x: {
      type: "point",
      tickFormat: (d: any) => getRightFormat(d),

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
    title: (d: any) => `${d.Name}: ${d.Count}`,
    strokeOpacity:
      highlighted === null ? 1 : (d) => (d.Name === highlighted ? 1 : 0.5),
    strokeWidth:
      highlighted === null ? 3 : (d) => (d.Name === highlighted ? 4 : 2),
    stroke: "Name",
    sort: (d: any) => highlighted === null || d.Name === highlighted,
  };

  const commonDotProps = {
    x: "DateStart",
    y: "Count",
    title: (d: any) => `${d.Name}: ${d.Count}`,
    stroke: "currentColor",
    strokeOpacity:
      highlighted === null ? 1 : (d) => (d.Name === highlighted ? 1 : 0.2),
    r: 7,
    fill: "Name",
    fillOpacity:
      highlighted === null ? 1 : (d) => (d.Name === highlighted ? 1 : 0.2),
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
            { ...commonLineProps },
          ),
          Plot.dot(
            graph === "default"
              ? soundData
              : graph === "hashtags"
              ? hashtagData
              : diverseLabelData,
            { ...commonDotProps },
          ),
        ],
      }),
      (e: any) => setHighlight(e.match(/(.*):.*/)[1]),
      () => setHighlight(null),
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
    <>
      <div className="mx-auto flex items-center text-2xl mb-6">
        <div className="">Show your top</div>
        <div>
          <SelectInput
            options={topNumOptions}
            selectedOption={topNum}
            onUpdate={setTopNum}
            buttonIcon={faPenToSquare}
          />
        </div>
        <div className="">sounds, hashtags, and video categories in the </div>
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
        <VizBox head={`${topHashtag}`} label="Most Frequent Hashtag OAT" />
        <VizBox head={`${topSound}`} label="Most Frequent Sound OAT" />
        <VizBox head={`${topDivLabel}`} label="Most Frequent Category OAT" />
      </div>

      <div className="flex mx-auto space-x-4">
        <Switch
          label="Sounds/Music"
          checked={graph === "default"}
          onChange={(e) => {
            setGraph("default");
          }}
        />
        <Switch
          label="Hashtags"
          checked={graph === "hashtags"}
          onChange={(e) => {
            setGraph("hashtags");
          }}
        />

        <Switch
          label="Diversification Labels/Categories"
          checked={graph === "divlabels"}
          onChange={() => {
            setGraph("divlabels");
          }}
        />
      </div>

      <div ref={toggleRef} className="w-full min-h-[50vh]" />
      {/* <div ref={soundRef}></div>

      <h2>Hashtags</h2>
      <div ref={hashtagsRef}></div>

      <h2>Diversification Labels</h2>
      <div ref={diverseRef}></div> */}
    </>
  );
}

export default VizTwo;
