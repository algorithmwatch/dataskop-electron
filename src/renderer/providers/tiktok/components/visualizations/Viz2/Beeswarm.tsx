import * as Plot from "@observablehq/plot";
import {
  forceCollide,
  forceSimulation,
  forceX as d3forceX,
  forceY as d3forceY,
} from "d3-force";
import { scaleQuantize } from "d3-scale";
import { pointer, select } from "d3-selection";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { chooseTicks } from "../utils/ticks";
import { useRect } from "../utils/useRect";

const forceStrengthX = 0.8;
const forceStrengthY = 0.4;

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
      .force("x", forceX((d) => d[x]).strength(forceStrengthX))
      .force("y", forceY((d) => d[y]).strength(forceStrengthY))
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

function on(mark, listeners = {}) {
  const { render } = mark;
  mark.render = function (facet, { x, y }, channels, dimensions, context) {
    // 🌶 I'd like to be allowed to read the facet
    // …  mutable debug = fx.domain()??

    // 🌶 data[i] may or may not be the datum, depending on transforms
    // (at this stage we only have access to the materialized channels we requested)
    // but in simple cases it works
    const { data } = this;

    // 🌶 since a point or band scale doesn't have an inverse, create one from its domain and range
    if (x && x.invert === undefined)
      x.invert = scaleQuantize(x.range(), x.domain());
    if (y && y.invert === undefined)
      y.invert = scaleQuantize(y.range(), y.domain());

    const g = render.apply(this, arguments);
    const r = select(g).selectChildren();
    for (const [type, callback] of Object.entries(listeners)) {
      r.on(type, function (event, i) {
        const p = pointer(event, g);
        callback(event, {
          type,
          p,
          datum: data[i],
          i,
          facet,
          data,
          channels,
          dimensions,
          context,
          children: r,
          ...(x && { x: x.invert(p[0]) }),
          ...(y && { y: y.invert(p[1]) }),
          ...(x && channels.x2 && { x2: x.invert(channels.x2[i]) }),
          ...(y && channels.y2 && { y2: y.invert(channels.y2[i]) }),
        });
      });
    }
    return g;
  };
  return mark;
}

const Beeswarm = ({ data, tooltipFun }) => {
  const [rect, beeRef] = useRect();
  const [tooltip, setTooltip] = useState(null);

  const { width, height } = rect;

  let dotRadius = 4;
  if (height > 600 && width > 800) dotRadius = 5;

  const beeSvg = useMemo(
    () =>
      width &&
      height &&
      Plot.plot({
        width,
        height,
        marginTop: 35,
        marginBottom: 53,
        marginLeft: 220,
        style: {
          fontSize: "0.8rem",
          color: "#000",
        },
        y: { tickSize: 0 },
        x: {
          type: "band",
          ticks: chooseTicks(
            _.orderBy(_.uniq(data.map((x) => x.day)), "date"),
            window.outerWidth,
          ),
          domain: _.orderBy(_.uniq(data.map((x) => x.day)), "date"),

          reverse: true,
          tickRotate: -45,
        },
        marks: [
          on(
            beeswarm(data, {
              dynamic: true,
              // title: (d) => d.label,
              x: (d) => d.day,
              y: (d) => d.label,
              fill: (d) => d.label,
              stroke: "none",
              gap: 0.5,
              r: dotRadius,
            }),
            {
              pointerenter(event, d) {
                select(event.target)
                  .style("cursor", "pointer")
                  .style("fill", "black");

                let x = event.clientX + 10;
                const y = event.clientY + 10;

                if (x + 300 > width) {
                  x = width - 300;
                }

                setTooltip({
                  x,
                  y,
                  label: tooltipFun(d),
                });
                // d.children.nodes().forEach((c, ii) => {
                //   if (d.y == d.channels.title[ii]) {
                //     select(c).style("fill", "black");
                //   }
                // });
              },
              pointermove(event, { datum }) {},
              pointerout(event, d) {
                select(event.target)
                  .style("cursor", "pointer")
                  .style("fill", null);

                setTooltip(null);
                // d.children.nodes().forEach((c, ii) => {
                //   select(c).style("fill", d.channels.fill[ii]);
                // });
              },
            },
          ),
        ],
      }),
    [data, width, height],
  );

  useEffect(() => {
    if (beeRef.current && beeSvg) {
      beeRef.current.replaceChildren(beeSvg);
      return () => beeSvg?.remove();
    }
  }, [beeSvg, beeRef, width, height]);

  return (
    <div className="flex mb-2 flex-col h-full grow">
      <div ref={beeRef} className="flex-1 h-full" />
      {tooltip && (
        <div
          className="absolute max-w-md z-10 dataskop-tooltip py-2 px-3 rounded shadow bg-white border-2 border-east-blue-200 whitespace-normal pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
};

export default Beeswarm;
