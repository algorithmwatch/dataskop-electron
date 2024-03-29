/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { extent, flatGroup, groups } from "d3-array";
import { Delaunay } from "d3-delaunay";
import { forceCollide, forceSimulation, forceX, forceY } from "d3-force";
import { scaleLinear, scalePoint } from "d3-scale";
import { useMemo, useState } from "react";
import { useRect } from "../../../../../lib/visualizations/useRect";

export function AxisBottom({ scale, height }) {
  return scale.ticks(10).map((tickValue, i) => (
    <g key={i} transform={`translate(${scale(tickValue)}, 0)`}>
      {/* <line y2={-height+100} className="stroke-slate-100" /> */}
      <text style={{ textAnchor: "middle" }} dy=".71em" y={0}>
        {tickValue}
      </text>
    </g>
  ));
}

export default function beeswarm({ data, pics, minNum }) {
  const [rect, ref] = useRect();
  const [active, setActive] = useState(null);
  const [simulationDone, setSimulationDone] = useState(false);

  // console.log(pics);

  const { width, height } = rect;
  const text = {
    like: "gelikte Videos",
    share: "geteilte Videos",
    view: "angesehene Videos",
    favorite: "favorisierte Videos",
  };

  const colors = {
    view: "#0090CE",
    like: "#00CEC7",
    share: "#FF004F",
    favorite: "#9999ff",
  };

  const margin = {
    left: 100,
    right: 100,
    top: 10,
    bottom: 60,
  };

  const ticks = 50;

  const groupedData = useMemo(() => {
    return flatGroup(
      data,
      (d) => d.slot,
      (d) => d.author,
    ).filter(
      ([slot, author, data]) =>
        author !== undefined && data.length >= minNum[slot],
    );
  }, [data, minNum]);

  // console.log("numAvatare",groups(data, d=> d.author).filter(d => d[1].length > minNum).length)

  const xDomain = useMemo(() => {
    return extent(groupedData, ([slot, author, data]) => data.length);
  }, [data]);

  const yDomain = useMemo(() => {
    return groups(groupedData, ([slot, author, data]) => slot).map(
      ([slot, data]) => slot,
    );
  }, [data]);

  const x = useMemo(() => {
    return scaleLinear()
      .domain(xDomain)
      .range([width - margin.left - margin.right, 0]);
  }, [data, width, xDomain]);

  const y = useMemo(() => {
    return scalePoint()
      .domain(yDomain)
      .padding(0.5)
      .range([0, height - margin.top - margin.bottom]);
  }, [data, height]);

  const size = useMemo(() => {
    return scaleLinear().domain(xDomain).range([10, 70]);
  }, [data, xDomain]);

  const simulation = useMemo(() => {
    // setSimulationDone(false)
    return forceSimulation(groupedData)
      .force("x", forceX((d) => x(d[2].length)).strength(0.7))
      .force("y", forceY((d) => y(d[0])).strength(0.05))
      .force(
        "collide",
        forceCollide()
          .radius((d) => size(d[2].length) / 1.8)
          .iterations(4),
      )
      .tick(ticks)
      .stop()
      .nodes();
  }, [groupedData, x, y, ticks]);

  const voronoiCells = useMemo(() => {
    const points = simulation.map((d) => [d.x, d.y]);
    // console.log(points);
    const voronoi = Delaunay.from(points).voronoi([
      -100,
      -100,
      width + 1,
      height + 1,
    ]);
    return [...voronoi.cellPolygons()];
  }, [simulation, width, height]);

  // const cellCenters = useMemo(() => {
  //   return voronoiCells.map(polygonCentroid);
  // }, [voronoiCells]);

  const activeAuthor = useMemo(() => {
    if (active === null) return null;
    return simulation[active][1];
  }, [active, simulation]);

  const activeLines = useMemo(() => {
    if (active === null) return [];
    return simulation.filter((d) => d[1] === activeAuthor);
  }, [active, activeAuthor]);

  const tooltipPosition = useMemo(() => {
    if (active === null) return null;
    const data = simulation[active];
    // console.log(data[1], data);
    const name = data[2][0].nickname;
    const center = [width / 2 - margin.right, height / 2 - margin.bottom];
    const pos = [data.x, data.y];
    const diff = [center[0] - pos[0], center[1] - pos[1]];
    const dist = Math.sqrt(diff[0] ** 2 + diff[1] ** 2);
    const angle = Math.atan2(diff[1], diff[0]);
    const offset = (size(data[2].length) / 2) * 1.2 + 10;
    const x = pos[0] + offset * Math.cos(angle);
    const y = pos[1] + offset * Math.sin(angle);
    return [x, y, name];
  }, [active, simulation, width, height]);

  // console.log(activeLines);

  return (
    <svg ref={ref} className="flex-1 mb-4">
      <defs>
        <filter id="floodlike">
          <feFlood
            result="floodFill"
            floodColor={colors.like}
            floodOpacity="0.5"
            x="-10%"
            y="-10%"
            width="100%"
            height="100%"
          />
          <feBlend in="SourceGraphic" in2="floodFill" mode="overlay" />
        </filter>
        <filter id="floodshare">
          <feFlood
            result="floodFill"
            floodColor={colors.share}
            floodOpacity="0.5"
            x="-10%"
            y="-10%"
            width="100%"
            height="100%"
          />
          <feBlend in="SourceGraphic" in2="floodFill" mode="multiply" />
        </filter>
        <filter id="floodview">
          <feFlood
            result="floodFill"
            floodColor={colors.view}
            floodOpacity="0.5"
            x="-10%"
            y="-10%"
            width="100%"
            height="100%"
          />
          <feBlend in="SourceGraphic" in2="floodFill" mode="overlay" />
        </filter>
      </defs>

      <g transform={`translate(${margin.left},${margin.top})`}>
        <g className="x-axis">
          <g transform={`translate(0,${height - margin.top - margin.bottom})`}>
            <AxisBottom scale={x} height={height} />
          </g>
        </g>
        <g className="lines">
          {activeLines.map(({ x, y }, i) => (
            <line
              strokeDasharray="2 2"
              key={i}
              x1={x}
              y1={y}
              x2={x}
              y2={height - margin.top - margin.bottom - 10}
              className="stroke-slate-400"
            />
          ))}
          {activeLines.length > 1 && (
            <path
              d={`M ${activeLines
                .map(({ x, y }, i) => `${x} ${y}`)
                .join(" L ")}`}
              strokeWidth="1"
              className="fill-none stroke-slate-300"
            />
          )}
        </g>

        <g className="nodes">
          {simulation.map(([slot, author, data], i) => {
            const base64image = pics ? pics[author] : null;
            return (
              <g
                key={i}
                transform={`translate(${simulation[i].x},${simulation[i].y})`}
              >
                {base64image && (
                  <image
                    key={i}
                    href={base64image}
                    x={-size(data.length) / 2}
                    y={-size(data.length) / 2}
                    width={size(data.length)}
                    height={size(data.length)}
                    className="transition-transform duration-300 ease-in-out"
                    clipPath="inset(0% round 50%)"
                    style={{
                      filter:
                        activeAuthor === author
                          ? ""
                          : `brightness(1.1) url(#flood${slot})`,
                      transform: `scale(${
                        // eslint-disable-next-line no-nested-ternary
                        activeAuthor === author
                          ? size(data.length) > 50
                            ? 2
                            : 4
                          : 1
                      })`,
                      transformOrigin: "center center",
                      transformBox: "fill-box",
                    }}
                  />
                )}
                {!base64image && (
                  <circle
                    r={size(data.length) / 2}
                    fill={colors[slot]}
                    style={{
                      transform: `scale(${activeAuthor === author ? 2 : 1})`,
                      transformOrigin: "center center",
                      transformBox: "fill-box",
                    }}
                  />
                )}
              </g>
            );
          })}
        </g>
        <g className="voronoi">
          {voronoiCells.map((polygon, i) => {
            return (
              <path
                key={i}
                d={`M${polygon.join("L")}Z`}
                fill="transparent"
                stroke="transparent"
                // className="cursor-pointer"
                onMouseEnter={() => {
                  // console.log(simulation[polygon.index]);
                  setActive(polygon.index);
                }}
              />
            );
          })}
        </g>
        {/* <g className="labels">
                {cellCenters.map(([x, y], i) => {
                    return <text
                        key={i}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{pointerEvents: "none", fill: active === simulation[i][1] ? "black" : "transparent"}}
                    >
                        {simulation[i][1]}
                    </text>
                })}
            </g> */}
        <g className="y-axis">
          {yDomain.map((slot, i) => {
            return (
              <g key={i} transform={`translate(-20, ${y(slot)})`} fill>
                <text
                  key={`white${i}`}
                  y={-y.step() / 2}
                  dy="0.5em"
                  dominantBaseline="middle"
                  textAnchor="start"
                  style={{ stroke: "white", strokeWidth: "0.4rem" }}
                >
                  {text[slot]}
                </text>
                <text
                  key={i}
                  y={-y.step() / 2}
                  dy="0.5em"
                  dominantBaseline="middle"
                  textAnchor="start"
                  style={{ pointerEvents: "none" }}
                >
                  {text[slot]}
                </text>
                <line
                  x1={0}
                  x2={width - margin.left - margin.right + 60}
                  y1={y.step() / 2 - 20}
                  y2={y.step() / 2 - 20}
                  className="stroke-gray-300"
                />
              </g>
            );
          })}
        </g>
        <g>
          <text
            x="0"
            y="0"
            textAnchor="start"
            dominantBaseline="middle"
            className="fill-gray-400"
            style={{
              pointerEvents: "none",
              transform: "translate(-60px, 50%) rotate(-90deg) ",
            }}
          >
            Art der Interaktion
          </text>
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-400"
            style={{
              pointerEvents: "none",
              transform: `translate(${width / 2 - margin.left}px, ${
                height - margin.top - 10
              }px) `,
            }}
          >
            Anzahl der Interaktionen
          </text>
        </g>
        <g className="tooltip">
          {tooltipPosition && (
            <foreignObject
              x={tooltipPosition[0]}
              y={tooltipPosition[1]}
              width="200"
              height="50"
              style={{
                pointerEvents: "none",
                transform: `translate(${
                  tooltipPosition[0] > width / 2 - margin.right ? "-200px" : "0"
                }, ${
                  tooltipPosition[1] > height / 2 - margin.bottom
                    ? "-50px"
                    : "0"
                })`,
              }}
            >
              <div className="dataskop-tooltip py-2 px-3 rounded shadow bg-white border-2 border-east-blue-200 whitespace-normal">
                {tooltipPosition[2]}
              </div>
            </foreignObject>

            // <g
            //   transform={`translate(${tooltipPosition[0]}, ${tooltipPosition[1]})`}
            // >
            //   <circle r="1" className="fill-slate-400" />
            //   <text
            //     x="0"
            //     y="0"
            //     textAnchor={
            //       tooltipPosition[0] > width / 2 - margin.right
            //         ? "end"
            //         : "start"
            //     }
            //     dominantBaseline="middle"
            //     className="fill-gray-400"
            //     style={{
            //       pointerEvents: "none",
            //     }}
            //   >
            //     {activeAuthor}
            //   </text>
            // </g>
          )}
        </g>
        {/* <g className="tooltip">
                {active && (
                    <g transform={`translate(${width - margin.left - margin.right - 200}, ${height - margin.top - margin.bottom - 200})`}>
                        <rect width="200" height="200" className="fill-white" />
                        <text

                            x="0"
                            y="0"
                            textAnchor="start"
                            dominantBaseline="middle"
                            className="fill-gray-400"
                            style={{pointerEvents: "none", transform: "translate(10px, 10px) "}}
                        >
                            {active}
                        </text>
                        <text

                            x="0"
                            y="0"
                            textAnchor="start"
                            dominantBaseline="middle"
                            className="fill-gray-400"
                            style={{pointerEvents: "none", transform: "translate(10px, 30px) "}}
                        >
                            {simulation.find(([slot, author, data]) => author === active)[2].length}
                        </text>

                    </g>
                )}
                </g> */}
      </g>
    </svg>
  );
}
