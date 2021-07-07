import { mean, rollups, sum } from 'd3-array';
import { timeParse } from 'd3-time-format';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryHistogram,
} from 'victory';
import { getLookups } from '../../../db';
import { ScrapingResult } from '../../../db/types';

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

const parseDate = (() => {
  const time = timeParse('%b %d');
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const yesterday = new Date(today - 864e5);
  return (str) => {
    if (str === 'Today') return today;
    else if (str === 'Yesterday') return yesterday;
    else if (str.split(' ').length == 1) return moment().day(str).toDate();
    else return new Date(time(str).setFullYear(today.getFullYear()));
  };
})();

const useData = (raw: Array<ScrapingResult>) => {
  const [data, setData] = useState({});

  const slug = raw.find(
    (x) => x.success && x.slug.includes('user-watch-history'),
  )?.fields.videos;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lookups = await getLookups();
        const history = slug.map((d) => {
          const date = parseDate(d.watchedAt);
          const watchTime = parseInt((d.duration * d.percWatched) / 100 / 1000);
          const detail = lookups.find((l) => l.info.videoId === d.id).info;
          return { ...d, date, watchTime, ...detail };
        });
        const days = parseInt(
          (history[0].date - history[history.length - 1].date) /
            (1000 * 60 * 60 * 24),
        );
        const mostWatchedCategoriesTime = rollups(
          history,
          (v) => sum(v, (d) => d.watchTime),
          (d) => d.category,
        );
        const mostWatchedCategoriesAmount = rollups(
          history,
          (v) => v.length,
          (d) => d.category,
        );
        const watchTime = sum(history, (d) => d.watchTime) / 60;
        const watchPercentAverage = mean(history, (d) => d.percWatched);
        const watchTimeAverage = mean(history, (d) => d.watchTime) / 60;

        setData({
          history,
          days,
          mostWatchedCategoriesTime,
          mostWatchedCategoriesAmount,
          watchTime,
          watchPercentAverage,
          watchTimeAverage,
        });
      } catch (error) {
        console.error(error);
      }
    };

    if (slug) {
      fetchData();
    } else {
      setData({ empty: true });
    }
  }, [slug]);

  return data;
};

function Badge({ title, value, unit, small = false }) {
  return (
    <div className="flex flex-col shadow rounded-lg text-center w-45 overflow-hidden">
      <div className="p-2 backdrop-filter backdrop-contrast-125 backdrop-brightness-110 backdrop-saturate-200 flex justify-center items-center flex-grow flex-row">
        <div>
          <span className={small ? 'hl-2xl' : 'hl-4xl'}>{value}</span>{' '}
          <span className="text-sm ">{unit}</span>
        </div>
      </div>
      <div className="p-2 text-sm text-yellow-1300  backdrop-filter backdrop-saturate-50">
        {title}
      </div>
    </div>
  );
}

export default function StatisticsChart({
  data,
}: {
  data: Array<ScrapingResult>;
}) {
  const db = useData(data);

  if (!db.history) return 'loading';

  console.log('dsb', db);

  return (
    <div className="p-7 grid grid-cols-6 gap-4">
      <Badge title="watch history" value={db.days} unit="days" />
      <Badge title="videos" value={db.history?.length} unit="" />
      <Badge
        title="total watchtime"
        value={Math.round(db.watchTime)}
        unit="minutes"
      />
      <Badge
        title="average watched"
        value={Math.round(db.watchPercentAverage)}
        unit="%"
      />
      <Badge
        title="average per video"
        value={Math.round(db.watchTimeAverage)}
        unit="minutes"
      />
      <Badge
        title="favorite category"
        value={db.mostWatchedCategoriesTime[0][0]}
        small={true}
        unit=""
      />
    </div>
  );
}
