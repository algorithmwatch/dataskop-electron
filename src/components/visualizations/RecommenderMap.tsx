/* eslint-disable no-restricted-syntax */
import { Group } from '@visx/group';
import { HeatmapRect } from '@visx/heatmap';
import { Bin, Bins } from '@visx/mock-data/lib/generators/genBins';
import { scaleLinear } from '@visx/scale';
import _ from 'lodash';
import React from 'react';
import { getThumbnails, getVideos } from '../../providers/youtube/utils';

export const background = 'white';

function preprocessData(videos, colsize) {
  const cool1 = '#122549';
  const cool2 = '#b4fbde';

  const binData = [];
  const uniqueVideos = [];

  function getVideoId(videoString) {
    const res = uniqueVideos.indexOf(videoString);
    if (res >= 0) return res;
    uniqueVideos.push(videoString);
    return uniqueVideos.length - 1;
  }

  for (const video of videos) {
    const row = [];

    for (const rank of _.range(0, colsize)) {
      row.push({
        bin: 1,
        count: getVideoId(video.fields.recommendedVideos[rank]?.id),
      });
    }
    binData.push({ bins: row, bin: 1 });
  }
  // for (const rank of _.range(0, colsize)) {
  //   const row = [];

  //   for (const video of videos) {
  //     row.push({
  //       bin: 1,
  //       count: hashCode(video.fields.recommendedVideos[rank]?.id),
  //     });
  //   }
  //   binData.push({ bins: row, bin: rank });
  // }
  console.log(binData);

  function max<Datum>(data: Datum[], value: (d: Datum) => number): number {
    return Math.max(...data.map(value));
  }

  function min<Datum>(data: Datum[], value: (d: Datum) => number): number {
    return Math.min(...data.map(value));
  }

  // accessors
  const bins = (d: Bins) => d.bins;
  const count = (d: Bin) => d.count;

  const colorMin = min(binData, (d) => max(bins(d), count));
  const colorMax = max(binData, (d) => max(bins(d), count));
  const bucketSizeMax = max(binData, (d) => bins(d).length);

  // scales
  const xScale = scaleLinear<number>({
    domain: [0, binData.length],
  });
  const yScale = scaleLinear<number>({
    domain: [0, bucketSizeMax],
  });

  const rectColorScale = scaleLinear<string>({
    range: [cool1, cool2],
    domain: [colorMin, colorMax],
  });
  const opacityScale = scaleLinear<number>({
    range: [0.9, 1],
    domain: [colorMin, colorMax],
  });
  return [binData, uniqueVideos, xScale, yScale, rectColorScale, opacityScale];
}

const RecommenderMap = ({ data, events = true }) => {
  const [high, setHigh] = React.useState(null);

  const margin = { top: 20, left: 20, right: 20, bottom: 50 };
  const width = 1000;
  const height = 500;
  const colsize = 10;

  const videos = getVideos(data);

  const [binData, uniqueVideos, xScale, yScale, rectColorScale, opacityScale] =
    preprocessData(videos, colsize);

  // bounds
  const size =
    width > margin.left + margin.right
      ? width - margin.left - margin.right
      : width;
  const xMax = size;
  const yMax = height - margin.bottom - margin.top;

  const binWidth = xMax / binData.length;
  const binHeight = yMax / colsize;

  console.log(binWidth);

  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);

  return width < 10 ? null : (
    <div>
      <svg width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={14}
          fill={background}
        />
        <Group
          top={margin.top}
          left={margin.left}
          onMouseLeave={() => setHigh(null)}
        >
          <HeatmapRect
            data={binData}
            xScale={(d) => xScale(d) ?? 0}
            yScale={(d) => yScale(d) ?? 0}
            colorScale={rectColorScale}
            opacityScale={opacityScale}
            binWidth={binWidth}
            binHeight={binHeight}
            gap={5}
          >
            {(heatmap) =>
              heatmap.map((heatmapBins) =>
                heatmapBins.map((bin) => (
                  <rect
                    key={`heatmap-rect-${bin.row}-${bin.column}`}
                    className="visx-heatmap-rect"
                    width={bin.width}
                    height={bin.height}
                    x={bin.x}
                    y={bin.y}
                    fill={
                      high !== null && high === bin.count ? 'red' : bin.color
                    }
                    fillOpacity={bin.opacity}
                    onMouseEnter={() => {
                      if (!events) return;
                      // const { row, column } = bin;
                      setHigh(bin.count);
                      // alert(JSON.stringify({ row, column, bin: bin.bin }));
                    }}
                    onClick={() => {
                      if (!events) return;
                      // const { row, column } = bin;
                      setHigh(bin.count);
                      // alert(JSON.stringify({ row, column, bin: bin.bin }));
                    }}
                  />
                )),
              )
            }
          </HeatmapRect>
        </Group>
      </svg>
      <div>{high && uniqueVideos[high]}</div>
      <div>{high && <img src={getThumbnails(uniqueVideos[high]).mq} />}</div>
    </div>
  );
};

export default RecommenderMap;
