/* eslint-disable react/no-danger */
import * as Plot from "@observablehq/plot";
import {
  forceCollide,
  forceSimulation,
  forceX as d3forceX,
  forceY as d3forceY,
} from "d3-force";
import { select } from "d3-selection";
import { useEffect, useMemo, useRef, useState } from "react";
import { shortenGdprData } from "./utils/shorten_data";
import { getTopData } from "./utils/viz-two-utils";

function beeswarm(
  data,
  { gap = 1, ticks = 50, dynamic, direction = "y", ...options },
) {
  const dots = Plot.dot(data, options);
  const { render } = dots;

  dots.render = function () {
    const g = render.apply(this, arguments);
    const circles = select(g).selectAll("circle");

    const nodes = [];
    function update() {
      // console.log('update');
      circles.attr(cx, (_, i) => nodes[i].x).attr(cy, (_, i) => nodes[i].y);
    }
    const [cx, cy, x, y, forceX, forceY] =
      direction === "x"
        ? ["cx", "cy", "x", "y", d3forceX, d3forceY]
        : ["cy", "cx", "y", "x", d3forceY, d3forceX];
    for (const c of circles) {
      const node = {
        x: +c.getAttribute(cx),
        y: +c.getAttribute(cy),
        r: +c.getAttribute("r"),
      };
      nodes.push(node);
    }
    const force = forceSimulation(nodes)
      .force("x", forceX((d) => d[x]).strength(0.8))
      .force("y", forceY((d) => d[y]).strength(0.05))
      .force(
        "collide",

        forceCollide()
          .radius((d) => d.r + gap)
          .iterations(3),
      )
      .tick(ticks)
      .stop();
    update();
    // if (dynamic) force.on('tick', update).restart();
    return g;
  };

  return dots;
}

export default function VisTwo({
  gdprData,
  metadata,
}: {
  gdprData: any;
  metadata: any;
}) {
  const [topNum, setTopNum] = useState({ id: "3", label: "10", value: 10 });
  const [range, setRange] = useState({
    id: "3",
    label: "letzte 365 Tage",
    value: 365,
  });
  const [
    videodata,
    logindata,
    loginObj,
    tiktokLiveVids,
    likedVids,
    sharedVids,
    savedVids,
  ] = useMemo(() => shortenGdprData(gdprData), [gdprData]);
  const [
    hashtagData,
    soundData,
    diverseLabelData,
    topHashtag,
    topSound,
    topDivLabel,
  ] = useMemo(
    () => getTopData(topNum.value, 7, range.value, metadata, videodata),
    [topNum.value, 7, range.value],
  );

  const beeRef = useRef(null);
  const sumRef = useRef(null);
  console.warn("hashtagData", hashtagData);

  // TODO: Make charts dimensions listen to resize event with throttle
  const chartWidth = Math.round((window.outerWidth * 90) / 100);
  const chartHeight = Math.round((window.outerHeight * 40) / 100);
  const beeSvg = useMemo(
    () =>
      Plot.plot({
        width: chartWidth,
        height: chartHeight,
        marginTop: 30,
        marginBottom: 50,
        marginLeft: 30,
        style: {
          // fontSize: '0.8em',
          color: "#5c4d00",
        },
        // grid: true,
        // y: {
        //   grid: false,

        //   transforsm: (c) => `${c}`,
        //   fill: (c) => c,
        // },
        y: { axis: null },
        x: { types: "time", ticks: 15, tickRotate: -45 },
        marks: [
          beeswarm(hashtagData, {
            marginTop: 50,
            marginLeft: 50,
            dynamic: true,
            title: (d) => "title",
            x: (d) => d.DateStart,
            y: (d) => d.Name,
            fill: (d) => d.Name,
            stroke: "none",
            r: (d) => d.Count,
            gap: 1,
          }),
        ],
      }),
    [hashtagData],
  );

  const sumSvg = useMemo(
    () =>
      Plot.plot({
        width: 300,
        marginLeft: 140,
        height: 400,
        marginTop: 30,
        marginBottom: 50,
        y: {
          label: null,
          axis: "left",
          //domain: d3.groupSort(watchHistory, g => -d3.sum(g, d => d.watchTime), d => d.category)
        },
        x: {
          grid: false,
          transform: (d) => d / 60,
          // label: 'minutes watched',
          label: null,
        },
        marks: [
          Plot.barX(
            hashtagData,
            Plot.groupY(
              {
                x: "sum",
                // title: (d) => {
                //   return `${Math.round(
                //     sum(d, (d) => d.watchTime) / 60,
                //   )} minutes`;
                // },
                title: (d) => "title2",
              },
              { y: "Name", fill: (d) => d.Name, x: "Count" },
            ),
          ),
          //Plot.ruleX([0])
        ],
      }),
    [hashtagData],
  );

  useEffect(() => {
    if (beeRef.current) {
      beeRef.current.replaceChildren(beeSvg);
    }
    if (sumRef.current) {
      sumRef.current.replaceChildren(sumSvg);
    }
  }, []);

  return (
    <div className="flex flex-row">
      <div ref={sumRef} />
      <div ref={beeRef} />
    </div>
  );
}
