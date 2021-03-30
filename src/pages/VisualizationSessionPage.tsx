/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VictoryBar, VictoryChart } from 'victory';
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

  return <img src={getThumbnails(x.id).small[imgIdx]} alt={x.id} />;
}

function Metric() {
  const data = [
    { quarter: 1, earnings: 13000 },
    { quarter: 2, earnings: 16500 },
    { quarter: 3, earnings: 14250 },
    { quarter: 4, earnings: 19000 },
  ];

  return (
    <VictoryChart domainPadding={20}>
      <VictoryBar
        horizontal
        style={{
          data: { fill: '#c43a31' },
        }}
        data={data}
        x="quarter"
        y="earnings"
      />
    </VictoryChart>
  );
}

function FollowedMetrics() {
  const data = Array.from({ length: 10 }, (_, i) => ({
    id: '4Y1lZQsyuSQ',
  }));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {data.map((x, i) => {
        return (
          <div
            style={{
              width: 'auto',
              minWidth: '2rem',
              height: '5rem',
              margin: '1rem',
              border: '2px solid pink',
            }}
          >
            <Metric />
          </div>
        );
      })}
    </div>
  );
}

function FollowedTopics() {
  const data = Array.from({ length: 10 }, (_, i) => ({
    id: '4Y1lZQsyuSQ',
  }));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {data.map((x, i) => {
        return (
          <div
            style={{
              width: 'auto',
              minWidth: '2rem',
              height: '5rem',
              margin: '1rem',
              border: '2px solid pink',
            }}
          >
            <FontAwesomeIcon icon={faCoffee} color="red" />
          </div>
        );
      })}
    </div>
  );
}

function ChartRow({ Element, row }) {
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
          display: 'inline-block',
        }}
      >
        <Element x={row[0]} />
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          flexGrow: 1,
        }}
      >
        {row.slice(1).map((x, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            style={{
              width: 'auto',
              minWidth: '2rem',
              height: '5rem',
              backgroundColor: 'white',
              margin: '1rem',
            }}
          >
            <Element x={x} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Chart({ visType, data }) {
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
          charts
        </button>
        <button type="button" onClick={() => setVisType('followed-topics')}>
          topics
        </button>
      </div>
      <Chart data={data} visType={visType} />
    </Base>
  );
}
