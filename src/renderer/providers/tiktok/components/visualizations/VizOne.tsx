import { faPenToSquare } from "@fortawesome/pro-regular-svg-icons";
import * as Plot from "@observablehq/plot";
import _ from "lodash";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SelectInput } from "./SelectInput";
import TabBar from "./TabBar";
import { shortenGdprData } from "./utils/shorten_data";
import addTooltips from "./utils/tooltips";
import { arrangeDataVizOne } from "./utils/viz-utils";
import { VizBoxRow } from "./VizBox";

function rangeOfTime(timeofday: string) {
  switch (timeofday) {
    case "morgens":
      return "6:00 - 11:59";
    case "nachmittags":
      return "12:00 - 17:59";
    case "abends":
      return "18:00 - 23:59";
    case "nachts":
      return "00:00 - 5:59";
    default:
      throw new Error("Unexpected value for timeofday" + timeofday);
  }
}

const rangeOptions = [
  { id: "1", label: "letzte 14 Tage", value: 14 },
  { id: "2", label: "letzte 30 Tage", value: 30 },
  { id: "3", label: "letzte 90 Tage", value: 90 },
  { id: "4", label: "letzte 180 Tage", value: 180 },
  { id: "5", label: "letzte 365 Tage", value: 365 },
];

const graphOptions = [
  { option: "solid bars, watch activity", value: "default" },
  { option: "time slot bars, watch activity", value: "timeslots" },
  { option: "percentage bars, watchtime", value: "watchtime" },
];

function VizOne({ gdprData, height, width }: { gdprData: any }) {
  const toggleRef = useRef<null | HTMLDivElement>(null);
  const [range, setRange] = useState(rangeOptions[2]);
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
  const chartWidth = width;

  const chartHeight =
    Math.round(height * (smallerScreen ? 0.5 : 0.7)) +
    (graph === "default" ? 0 : -45);

  const uniqDates = _.orderBy(
    _.uniqBy(videoData, (x) => `${x.Date.getDate()} ${x.Date.getMonth()}`),
    "Date",
  ).map((x) => x.Date);

  const numTicks = Math.round(uniqDates.length / (smallerScreen ? 15 : 30));

  let ticks = uniqDates;
  if (ticks.length > (smallerScreen ? 15 : 30)) {
    ticks = uniqDates.filter((_x: any, i: number) => i % numTicks === 0);
  }

  const commonProps = {
    width: chartWidth,
    height: chartHeight,
    marginBottom: smallerScreen ? 50 : 75,
    marginTop: 0,
    marginLeft: smallerScreen ? 55 : 70,
    marginRight: smallerScreen ? 50 : 60,
    style: {
      background: "transparent",
      fontSize: "0.8rem",
    },
    x: {
      type: "band",
      tickRotate: -45,
      tickFormat: (d) =>
        `${`0${d.getDate()}`.slice(-2)}.${`0${d.getMonth() + 1}`.slice(-2)}.${d
          .getFullYear()
          .toString()
          .slice(-2)}`,
      label: null,
      ticks,
    },
  };

  const timeslotsAndSingleColorBarsPlot = {
    ...commonProps,
    y: {
      grid: true,
      label: null,
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
                  )}) aktiv, am ${d.Date.toLocaleString("de-de", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`
              : (d) =>
                  `<strong>${d.TotalTime.toFixed(
                    0,
                  )} Min.</strong> aktiv am ${d.Date.toLocaleString("de-de", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`,
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
      label: "Anzahl Videos",
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
            title: (d) => `Anzahl Videos: `,
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
  }, [videoData, graph, chartHeight]);

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
          { head: `${numAppOpen}x`, label: "App geöffnet" },
          { head: `${coreTimeString}:00`, label: "Hauptzeit" },
        ]}
      />

      <TabBar
        datasource={graph}
        setDatasource={setGraph}
        options={[
          ["default", "Aktivität"],
          ["timeslots", "Tageszeiten"],
          ["watchtime", "Übersprungen"],
        ]}
      />

      {/* Chart wrapper */}
      <div className="relative">
        <div
          ref={toggleRef}
          className="pl-16 2xl:pl-20 w-full mt-6"
          id="dataskop-export-screenshot-inner"
        />
        <div
          className="text-center text-gray-400 rotate-[270deg] absolute"
          style={{ top: chartHeight / 2 - 20 }}
        >
          Minuten
        </div>
      </div>
      <div className="text-center text-gray-400 pt-3 2xl:pt-5 mb-5">
        Zeitverlauf
      </div>
    </>
  );
}

export default VizOne;
