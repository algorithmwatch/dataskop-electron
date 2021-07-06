import { ArrowOptions, getArrow } from 'perfect-arrows';
import * as React from 'react';

type Point = { x: number; y: number };

export function PerfectArrow({
  p1,
  p2,
  width,
  height,
  options = {},
}: {
  p1: Point;
  p2: Point;
  width: number;
  height: number;
  options?: ArrowOptions;
}) {
  const defaultOptions = {};
  const arrow = getArrow(p1.x, p1.y, p2.x, p2.y, {
    ...defaultOptions,
    ...options,
  });

  const [sx, sy, cx, cy, ex, ey, ae, as, ec] = arrow;

  const endAngleAsDegrees = ae * (180 / Math.PI);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width, height }}
      stroke="#000"
      fill="#000"
      strokeWidth={3}
    >
      {/* <circle cx={sx} cy={sy} r={4} /> */}
      <path d={`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`} fill="none" />
      <polygon
        points="0,-6 12,0, 0,6"
        transform={`translate(${ex},${ey}) rotate(${endAngleAsDegrees})`}
      />
    </svg>
  );
}
