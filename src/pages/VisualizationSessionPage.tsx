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

function SmallMultiple() {
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

function Topic() {
  return (
    <div>
      <FontAwesomeIcon icon={faCoffee} color="red" />
    </div>
  );
}

function ThumbailsRecommended({ video }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
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

  // const data = Array.from({ length: 10 }, (_, i) => ({
  //   id: '4Y1lZQsyuSQ',
  // }));

  console.log(data);

  return (
    <Base>
      <h1>Vis</h1>
      <div>
        <button type="button" onClick={() => setVisType('thumbnails')}>
          thumbnails recommended
        </button>
        <button type="button" onClick={() => setVisType('charts')}>
          charts
        </button>
        <button type="button" onClick={() => setVisType('topics')}>
          topics
        </button>
      </div>
      {visType === 'thumbnails' &&
        data &&
        data.map((x, i) => <ThumbailsRecommended key={i} video={x.result} />)}
      {/* <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {data.map((x, i) => (
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
            {visType === 'thumbnails' && <Thumbnail x={x} />}
            {visType === 'charts' && <SmallMultiple />}
            {visType === 'topics' && <Topic />}
          </div>
        ))}
      </div> */}
    </Base>
  );
}
