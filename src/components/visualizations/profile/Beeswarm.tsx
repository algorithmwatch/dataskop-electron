/* eslint-disable no-restricted-syntax */
/* eslint-disable react/no-danger */
import * as Plot from '@observablehq/plot';
import { sum } from 'd3-array';
import {
  forceCollide,
  forceSimulation,
  forceX as d3forceX,
  forceY as d3forceY,
} from 'd3-force';
import { select } from 'd3-selection';
import React, { useEffect, useMemo, useRef } from 'react';

function beeswarm(
  data,
  { gap = 1, ticks = 50, dynamic, direction = 'y', ...options },
) {
  const dots = Plot.dot(data, options);
  const { render } = dots;

  dots.render = function () {
    const g = render.apply(this, arguments);
    const circles = select(g).selectAll('circle');

    const nodes = [];
    const [cx, cy, x, y, forceX, forceY] =
      direction === 'x'
        ? ['cx', 'cy', 'x', 'y', d3forceX, d3forceY]
        : ['cy', 'cx', 'y', 'x', d3forceY, d3forceX];
    for (const c of circles) {
      const node = {
        x: +c.getAttribute(cx),
        y: +c.getAttribute(cy),
        r: +c.getAttribute('r'),
      };
      nodes.push(node);
    }
    const force = forceSimulation(nodes)
      .force('x', forceX((d) => d[x]).strength(0.8))
      .force('y', forceY((d) => d[y]).strength(0.05))
      .force(
        'collide',

        forceCollide()
          .radius((d) => d.r + gap)
          .iterations(3),
      )
      .tick(ticks)
      .stop();
    update();
    // if (dynamic) force.on('tick', update).restart();
    return g;

    function update() {
      // console.log('update');
      circles.attr(cx, (_, i) => nodes[i].x).attr(cy, (_, i) => nodes[i].y);
    }
  };

  return dots;
}

export default function Beeswarm({ data }) {
  const beeRef = useRef(null);
  const sumRef = useRef(null);

  // TODO: Make charts dimensions listen to resize event with throttle

  const beeSvg = useMemo(
    () =>
      Plot.plot({
        width: 870,
        height: 400,
        marginTop: 30,
        marginBottom: 50,
        marginLeft: 30,
        style: {
          // fontSize: '0.8em',
          color: '#5c4d00',
        },
        // grid: true,
        // y: {
        //   grid: false,

        //   transforsm: (c) => `${c}`,
        //   fill: (c) => c,
        // },
        y: { axis: null },
        x: { types: 'time', ticks: 15, tickRotate: -45 },
        marks: [
          beeswarm(data, {
            marginTop: 50,
            marginLeft: 50,
            dynamic: true,
            title: (d) => d.title,
            x: (d) => d.date,
            y: (d) => d.category,
            fill: (d) => d.category,
            stroke: 'none',
            r: (d) => Math.sqrt(d.watchTime),
            gap: 1,
          }),
        ],
      }),
    [data],
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
          axis: 'left',
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
            data,
            Plot.groupY(
              {
                x: 'sum',
                title: (d) => {
                  return `${Math.round(
                    sum(d, (d) => d.watchTime) / 60,
                  )} minutes`;
                },
              },
              { y: 'category', fill: (d) => d.category, x: 'watchTime' },
            ),
          ),
          //Plot.ruleX([0])
        ],
      }),
    [data],
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
