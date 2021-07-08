import React from 'react';
import { ScrapingResult } from '../../../db/types';
import { useData } from './useData';

function Badge({ title, value, unit, small = false }) {
  return (
    <div className="flex flex-col shadow rounded-lg text-center w-45 overflow-hidden">
      <div className="p-2 backdrop-filter backdrop-contrast-125 backdrop-brightness-110 backdrop-saturate-200 flex justify-center items-center flex-grow flex-row">
        <div>
          <span className={small ? 'hl-1xl font-bold' : 'hl-3xl'}>{value}</span>{' '}
          <span className="text-xs ">{unit}</span>
        </div>
      </div>
      <div className="p-2 text-xs text-yellow-1300  backdrop-filter backdrop-saturate-50">
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

  if (!db.history) return null;

  console.log('data', data);

  return (
    <div className="p-7 grid grid-cols-9 gap-4 cursor-default">
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
        small
        unit=""
      />
      <Badge title="subscribed to" value={db.channels.length} unit="channels" />
      <Badge
        title="width notifications"
        value={db.channelsNotification.length}
        unit="channels"
      />
      {db.topChannel && (
        <Badge
          title="favorite channel"
          value={db.topChannel.name}
          small
          unit=""
        />
      )}
    </div>
  );
}
