import { faPenToSquare } from "@fortawesome/pro-regular-svg-icons";
import * as Plot from "@observablehq/plot";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import SelectInput from "../SelectInput";
import TabBar from "../TabBar";
import { chooseTicks } from "../utils/ticks";
import addTooltips from "../utils/tooltips";
import { VizBoxRow } from "../VizBox";
import { arrangeDataVizOne } from "./data";

const TIMESLOTS = ["vormittags", "nachmittags", "abends", "nachts"];

function rangeOfTime(timeofday: string) {
  switch (timeofday) {
    case "vormittags":
      return "6:00 - 11:59";
    case "nachmittags":
      return "12:00 - 17:59";
    case "abends":
      return "18:00 - 23:59";
    case "nachts":
      return "00:00 - 5:59";
    default:
      throw new Error(`Unexpected value for timeofday: ${timeofday}`);
  }
}

const rangeOptions = [
  { id: "1", label: "letzte 14 Tage", value: 14 },
  { id: "2", label: "letzte 30 Tage", value: 30 },
  { id: "3", label: "letzte 90 Tage", value: 90 },
  { id: "4", label: "letzte 180 Tage", value: 180 },
  { id: "5", label: "letzte 365 Tage", value: 365 },
];

const VizOne = ({
  gdprData,
  height,
  width,
  onGraphChange,
}: {
  gdprData: any;
  height: number;
  width: number;
  onGraphChange: (x: string) => void;
}) => {
  const toggleRef = useRef<null | HTMLDivElement>(null);
  const [range, setRange] = useState(rangeOptions[2]);
  const [graph, setGraph] = useState<"default" | "timeslots" | "watchtime">(
    "default",
  );

  const [totActivity, avgMinsPerDay, numAppOpen, headValue, videoData] =
    React.useMemo(
      () => arrangeDataVizOne(gdprData, graph, range.value),
      [graph, range.value],
    );

  const smallerScreen = window.outerHeight <= 1200;

  const chartHeight =
    Math.round(height * (smallerScreen ? 0.4 : 0.7)) +
    (graph === "default" ? 0 : -45);

  const uniqDates = _.orderBy(
    _.uniqBy(videoData, (x) => `${x.Date.getDate()} ${x.Date.getMonth()}`),
    "Date",
  ).map((x) => x.Date);

  const ticks = chooseTicks(uniqDates, window.outerWidth);

  const commonProps = {
    width,
    height: chartHeight,
    marginBottom: smallerScreen ? 50 : 75,
    marginTop: 3,
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
      ticks: 10,
    },
    color: {
      legend: graph === "timeslots",
      domain: TIMESLOTS,
      range: ["#330010", "#990030", "#ff0050", "#ff99b9"],
    },
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

  useEffect(() => {
    onGraphChange(graph);
  }, [graph]);

  let headValues: any[] = [];

  if (graph === "default") {
    headValues = [
      { head: totActivity, label: "Aktivität" },
      { head: avgMinsPerDay, label: "pro Tag" },
      { head: `${numAppOpen}x`, label: "App geöffnet" },
      { head: `${headValue}:00`, label: "Hauptzeit" },
    ];
  }

  if (graph === "timeslots") {
    headValues = TIMESLOTS.map((x) => [x, headValue[x]]).map((x) => ({
      head: `${Math.round(x[1] ?? 0)}%`,
      label: x[0],
    }));
  }

  if (graph === "watchtime") {
    headValues = [
      { head: totActivity, label: "Aktivität" },
      { head: avgMinsPerDay, label: "pro Tag" },
      {
        head: `${Math.round(headValue["über 2 Sekunden"]) ?? 0}%`,
        label: "> 2 Sekunden",
      },
      {
        head: `${Math.round(headValue["unter 2 Sekunden"] ?? 0)}%`,
        label: "< 2 Sekunden",
      },
    ];
  }

  return (
    <>
      <div className="mx-auto flex items-center text-2xl mb-3 lg:mb-6">
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

      <VizBoxRow values={headValues} />

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
          className="pl-16 2xl:pl-20 w-full h-full mt-6"
          id="dataskop-export-screenshot-inner"
        />
        <div
          className="text-center text-gray-400 rotate-[270deg] absolute"
          style={{ top: chartHeight / 2 - 20 }}
        >
          {graph === "watchtime" ? "Videos" : "Minuten"}
        </div>
      </div>
      <div className="text-center text-gray-400 pt-3 2xl:pt-5 mb-5">
        Zeitverlauf
      </div>
    </>
  );
};

export default VizOne;
