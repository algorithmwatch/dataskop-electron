import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VictoryBar, VictoryChart } from 'victory';
import { getSessionData } from '../db';
import Base from '../layouts/Base';
import { getThumbnails } from '../providers/youtube/utils';
import { randomIntFromInterval } from '../utils/math';

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

function RecommendedThumbnails({ video }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <div
        style={{
          width: 'auto',
          minWidth: '2rem',
          height: '5rem',
          margin: '1rem',
          border: '2px solid pink',
        }}
      >
        <Thumbnail x={video.fields} />
      </div>
      {video.fields.recommendedVideos.map((x, i) => (
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
          <Thumbnail x={x} />
        </div>
      ))}
    </div>
  );
}

function FollowedThumbnails({ allVideos }) {
  return <div></div>;
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
        <button
          type="button"
          onClick={() => setVisType('recommended-thumbnails')}
        >
          followed thumbnails
        </button>
        <button type="button" onClick={() => setVisType('followed-metrics')}>
          charts
        </button>
        <button type="button" onClick={() => setVisType('followed-topics')}>
          topics
        </button>
      </div>
      {visType === 'recommended-thumbnails' &&
        data &&
        data.map((x, i) => <RecommendedThumbnails key={i} video={x.result} />)}
      {visType === 'followed-thumbnails' && data && (
        <FollowedThumbnails allVideos={data} />
      )}
      {visType === 'followed-metrics' && data && <FollowedMetrics />}
      {visType === 'followed-topics' && data && <FollowedTopics />}
    </Base>
  );
}
