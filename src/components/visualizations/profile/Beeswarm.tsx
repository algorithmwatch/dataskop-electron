/* eslint-disable no-restricted-syntax */
/* eslint-disable react/no-danger */
import * as Plot from '@observablehq/plot';
import {
  forceCollide,
  forceSimulation,
  forceX as d3forceX,
  forceY as d3forceY,
} from 'd3-force';
import { select } from 'd3-selection';
import React, { useEffect, useMemo, useRef } from 'react';

console.log(Plot);

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
    if (dynamic) force.on('tick', update).restart();
    return g;

    function update() {
      circles.attr(cx, (_, i) => nodes[i].x).attr(cy, (_, i) => nodes[i].y);
    }
  };

  return dots;
}

export default function Beeswarm({ data }) {
  console.log('Beewswarm', data);
  const svg = useRef(null);
  const plotSvg = useMemo(
    () =>
      Plot.plot({
        width: 800,
        marginTop: 30,
        marginLeft: 150,
        style: {
          fontSize: '0.8em',
          color: 'black',
        },
        // y: { axis: null },
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
        height: 400,
      }),
    [data],
  );

  useEffect(() => {
    if (svg.current) {
      svg.current.replaceChildren(plotSvg);
    }
  }, []);

  console.log('plopt', plotSvg);
  return <div ref={svg} />;
}
