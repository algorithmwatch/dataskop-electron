/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format } from 'd3-format';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory';
import { getSessionData } from '../db';
import Base from '../layouts/Base';
import { getThumbnails } from '../providers/youtube/utils';
import { randomIntFromInterval } from '../utils/math';

const groupByFollowId = (x) =>
  Object.values(_.groupBy(x, (y) => y.fields.followId));

function Thumbnail({ x }) {
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    setInterval(() => setImgIdx(randomIntFromInterval(0, 3)), 1000);
  }, []);

  return (
    <img
      src={getThumbnails(x.id).small[imgIdx]}
      alt={x.id}
      style={{ width: '100%', height: 'auto' }}
    />
  );
}

function VideoMetrics({ x, metrics }) {
  const data = metrics.map((m) => ({ key: m, value: x[m] }));

  console.log(data, x);

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

function Topic({ x }) {
  return (
    <div
      style={{
        width: 'auto',
        padding: '2rem',
        border: '2px solid grey',
      }}
    >
      <FontAwesomeIcon icon={faCoffee} color="black" />
    </div>
  );
}

function ChartRow({ Element, row, ...rest }) {
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
        <Element x={row[0]} {...rest} />
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
            <Element x={x} {...rest} />
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
            Element={Thumbnail}
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
            Element={Thumbnail}
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
            Element={VideoMetrics}
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
            Element={Topic}
            row={x.map(({ fields }) => fields)}
          />
        ))}
      </>
    );
  }

  return null;
}

export default function VisualizationPage() {
  const [visType, setVisType] = useState<string>('thumbnail');
  const [data, setData] = useState<any>([]);
  const { sessionId } = useParams();

  useEffect(() => {
    const loadData = async () => {
      setData(await getSessionData(sessionId));
    };
    loadData();
  }, [sessionId]);

  console.log(data);

  return (
    <Base>
      <h1>Vis</h1>
      <div>
        <button
          type="button"
          onClick={() => setVisType('recommended-thumbnails')}
        >
          recommended thumbnails
        </button>
        <button type="button" onClick={() => setVisType('followed-thumbnails')}>
          followed thumbnails
        </button>
        <button type="button" onClick={() => setVisType('followed-metrics')}>
          followed metrics
        </button>
        <button type="button" onClick={() => setVisType('followed-topics')}>
          followed topics
        </button>
      </div>
      <Chart data={data} visType={visType} />
    </Base>
  );
}
