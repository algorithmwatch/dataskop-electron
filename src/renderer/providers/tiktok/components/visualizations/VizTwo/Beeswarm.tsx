import * as Plot from "@observablehq/plot";
import {
  forceCollide,
  forceSimulation,
  forceX as d3forceX,
  forceY as d3forceY,
} from "d3-force";
import { select } from "d3-selection";
import _ from "lodash";
import { useEffect, useMemo } from "react";
import { useRect } from "../utils/useRect";

function beeswarm(
  data,
  { gap = 1, ticks = 40, dynamic, direction = "y", ...options },
) {
  const dots = Plot.dot(data, options);
  const { render } = dots;

  dots.render = function () {
    const g = render.apply(this, arguments);
    const circles = select(g).selectAll("circle");

    const nodes = [];
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
          .iterations(4),
      )
      .tick(ticks)
      .stop();
    update();
    if (dynamic) force.on("tick", update).restart();
    return g;

    function update() {
      // console.log('update');
      circles.attr(cx, (_, i) => nodes[i].x).attr(cy, (_, i) => nodes[i].y);
    }
  };

  return dots;
}

export default function Beeswarm({ data }) {
  // const beeRef = useRef(null);
  const [rect, beeRef] = useRect();
  const { width, height } = rect;

  const beeSvg = useMemo(
    () =>
      width &&
      height &&
      Plot.plot({
        width: width,
        height: height,
        marginTop: 30,
        marginBottom: 53,
        marginLeft: 200,
        style: {
          fontSize: "0.8rem",
          color: "#000",
        },
        //grid: true,
        // y: {
        //   grid: false,
        //   transforsm: (c) => `${c}`,
        //   fill: (c) => c,
        // },
        y: { tickSize: 0 },
        x: {
          type: "band",
          // ticks: 15,
          domain: _.orderBy(_.uniq(data.map((x) => x.day)), "date"),
          reverse: true,
          tickRotate: -45,
        },
        marks: [
          beeswarm(data, {
            marginTop: 50,
            marginLeft: 50,
            dynamic: true,
            title: (d) => d.label,
            x: (d) => d.day,
            y: (d) => d.label,
            fill: (d) => d.label,
            stroke: "none",
            //r: (d) => 5,
            gap: 0.5,
          }),
        ],
      }),
    [data, width, height],
  );

  useEffect(() => {
    if (beeRef.current && beeSvg) {
      // console.log("rendering beeswarm");
      // console.log(data);
      // select(beeRef.current).selectAll('text').style('font-size', '2em');
      beeRef.current.replaceChildren(beeSvg);
      return () => beeSvg?.remove();
    }
  }, [beeSvg, beeRef, width, height]);

  return <div className="flex-1 mb-2" ref={beeRef} />;
}
