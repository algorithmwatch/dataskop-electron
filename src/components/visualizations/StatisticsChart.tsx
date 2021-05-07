import React from 'react';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory';

function DsBarChar({ data, title }) {
  return (
    <div className="h-1/3">
      <h4>{title}</h4>
      <VictoryChart
        // theme={VictoryTheme.material}
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
          style={
            {
              // tickLabels: { fontSize: 5 },
            }
          }
        />
        <VictoryBar
          horizontal
          barRatio={0.9}
          style={{ data: { fill: '#c43a31' } }}
          data={data}
          y="count"
          x="id"
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

  console.log(onlyRecVideos);

  const freqRecIds = Object.entries(_.countBy(onlyRecVideos, 'id')).map((x) => {
    return { id: x[0], count: x[1] };
  });

  const maxFreqRecIds = _.sortBy(freqRecIds, ['count']).reverse().slice(0, 10);

  console.log(maxFreqRecIds);

  return (
    <>
      <DsBarChar data={maxFreqRecIds} title="Most Recommended Video" />
      {/* <Chart
        data={data.filter((x) => x.success && x.slug.includes('video-page'))}
        visType={visType}
      /> */}
    </>
  );
}
