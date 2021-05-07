import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format } from 'd3-format';
import _ from 'lodash';
import React, { useState } from 'react';
import Select from 'react-select';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory';
import { ScrapingResult } from '../../db/types';
import { getThumbnails } from '../../providers/youtube/utils';
import Button from '../Button';

export function Thumbnail({ x }) {
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <img
      src={getThumbnails(x.id).small[imgIdx]}
      alt={x.id}
      style={{ width: '100%', height: 'auto' }}
    />
  );
}

export function VideoMetrics({ x, metrics }) {
  const data = metrics.map((m) => ({ key: m, value: x[m] }));

  return (
    <VictoryChart
      domainPadding={{ x: [30, 30] }}
      padding={{ left: 100, bottom: 30 }}
      width={200}
      height={100}
    >
      <VictoryAxis />
      <VictoryAxis
        dependentAxis
        fixLabelOverlap
        tickFormat={(t) => format('.2s')(t)}
      />
      <VictoryBar
        horizontal
        style={{
          data: { fill: 'lightblue' },
        }}
        data={data}
        x="key"
        y="value"
      />
    </VictoryChart>
  );
}

export function Topic({ x }) {
  return (
    <div
      style={{
        width: 'auto',
        padding: '2rem',
        border: '2px solid grey',
      }}
    >
      {x.category}
      <FontAwesomeIcon icon={faCoffee} color="black" />
    </div>
  );
}

const groupByFollowId = (x) =>
  Object.values(_.groupBy(x, (y) => y.fields.followId));

function ChartRow({ SmallChart, row, ...rest }) {
  return (
    <div
      style={{
        border: '2px solid grey',
        padding: '0.5rem',
        margin: '1rem',
        display: 'flex',
      }}
    >
      <div
        style={{
          margin: '1rem',
          paddingRight: '1rem',
          paddingBottom: '0.5rem',
          borderRight: '2px solid grey',
          borderBottom: '2px solid grey',
          width: '10rem',
          height: 'auto',
          flex: '0 0 auto',
        }}
      >
        <SmallChart x={row[0]} {...rest} />
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {row.slice(1).map((x, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            style={{
              margin: '1rem',
              width: '10rem',
              height: 'auto',
            }}
          >
            <SmallChart x={x} {...rest} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Chart({ visType, data }) {
  const availMetrics = ['upvotes', 'downvotes', 'duration', 'viewCount'];
  const options = availMetrics.map((x) => ({ value: x, label: x }));
  const [chosenOptions, setChosen] = useState<any>(options);

  if (visType === 'recommended-thumbnails') {
    return (
      <>
        {data.map((x, i) => (
          <ChartRow
            key={i}
            SmallChart={Thumbnail}
            row={[x.fields].concat(x.fields.recommendedVideos)}
          />
        ))}
      </>
    );
  }

  if (visType === 'followed-thumbnails') {
    const followData = groupByFollowId(data);

    return (
      <>
        {followData.map((x, i) => (
          <ChartRow
            key={i}
            SmallChart={Thumbnail}
            row={x.map(({ fields }) => fields)}
          />
        ))}
      </>
    );
  }

  if (visType === 'followed-metrics') {
    const followData = groupByFollowId(data);

    return (
      <>
        <Select
          value={chosenOptions}
          options={options}
          isMulti
          onChange={setChosen}
        />
        {followData.map((x, i) => (
          <ChartRow
            key={i}
            SmallChart={VideoMetrics}
            metrics={chosenOptions.map(({ value }) => value)}
            row={x.map(({ fields }) => fields)}
          />
        ))}
      </>
    );
  }

  if (visType === 'followed-topics') {
    const followData = groupByFollowId(data);

    return (
      <>
        {followData.map((x, i) => (
          <ChartRow
            key={i}
            SmallChart={Topic}
            row={x.map(({ fields }) => fields)}
          />
        ))}
      </>
    );
  }

  return null;
}

export default function SmallMultipleChart({
  data,
}: {
  data: Array<ScrapingResult>;
}) {
  const [visType, setVisType] = useState<string>('recommended-thumbnails');

  return (
    <>
      <h1>Visalization</h1>
      <div>
        <Button onClick={() => setVisType('recommended-thumbnails')}>
          recommended thumbnails
        </Button>
        <Button onClick={() => setVisType('followed-thumbnails')}>
          followed thumbnails
        </Button>
        <Button onClick={() => setVisType('followed-metrics')}>
          followed metrics
        </Button>
        <Button onClick={() => setVisType('followed-topics')}>
          followed topics
        </Button>
      </div>
      <Chart
        data={data.filter((x) => x.success && x.slug.includes('video-page'))}
        visType={visType}
      />
    </>
  );
}
