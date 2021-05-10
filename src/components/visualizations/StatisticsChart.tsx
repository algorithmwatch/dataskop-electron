import _ from 'lodash';
import React from 'react';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryHistogram,
} from 'victory';
import { ScrapingResult } from '../../db/types';

function DsBarChart({ data, title, x, y }) {
  return (
    <div>
      <h4>{title}</h4>
      <VictoryChart
        padding={{ left: 100, bottom: 100 }}
        domainPadding={{ x: 10 }}
        // width={200}
        // height={200}
      >
        <VictoryAxis
          dependentAxis
          tickCount={3}
          style={
            {
              // tickLabels: { fontSize: 5 },
            }
          }
        />
        <VictoryAxis
          style={{
            tickLabels: { fontSize: 10 },
          }}
        />
        <VictoryBar
          horizontal
          barRatio={0.9}
          style={{ data: { fill: '#c43a31' } }}
          data={data}
          y={y}
          x={x}
        />
      </VictoryChart>
    </div>
  );
}

function DsHistogram({ data, field }) {
  return (
    <div>
      <h4>{field}</h4>
      <VictoryChart domainPadding={10}>
        <VictoryHistogram
          style={{ data: { fill: '#c43a31' } }}
          data={data.map((row) => ({ x: row.fields[field] }))}
        />
      </VictoryChart>
    </div>
  );
}

export default function StatisticsChart({
  data,
}: {
  data: Array<ScrapingResult>;
}) {
  const onlyVideos = data.filter(
    (x) => x.success && x.slug.includes('video-page'),
  );

  const onlyRecVideos = onlyVideos
    .map((x) => x.fields.recommendedVideos)
    .flat();

  const freqRecIds = Object.entries(_.countBy(onlyRecVideos, 'id')).map((x) => {
    return { id: x[0], count: x[1] };
  });
  const maxFreqRecIds = _.sortBy(freqRecIds, ['count']).reverse().slice(0, 10);

  const freqCreators = Object.entries(
    _.countBy(onlyRecVideos, 'channelName'),
  ).map((x) => {
    return { creator: x[0], count: x[1] };
  });
  const maxCreators = _.sortBy(freqCreators, ['count']).reverse().slice(0, 10);
  const availMetrics = ['upvotes', 'downvotes', 'duration', 'viewCount'];

  return (
    <>
      <div className="grid grid-cols-2">
        <DsBarChart
          data={maxFreqRecIds}
          title="Most Recommended Video"
          x="id"
          y="count"
        />
        <DsBarChart
          data={maxCreators}
          title="Most Recommended Creators"
          x="creator"
          y="count"
        />
        {availMetrics.map((x) => (
          <DsHistogram key={x} data={onlyVideos} field={x} />
        ))}
      </div>
    </>
  );
}
