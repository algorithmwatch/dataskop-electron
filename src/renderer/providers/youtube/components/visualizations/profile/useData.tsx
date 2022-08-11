// @ts-nocheck

import * as chrono from 'chrono-node';
import { mean, rollups, sum } from 'd3-array';
import { useEffect, useState } from 'react';
import { LookupMap, ScrapingResult } from '../../../../../lib/db/types';

const parseDate = (str: string, referenceDate: Date) => {
  const germanDate = chrono.de.parseDate(str, referenceDate);
  if (germanDate !== null) return germanDate;

  return chrono.en.parseDate(str, referenceDate);
};

export const useData = (raw: Array<ScrapingResult>, lookups: LookupMap) => {
  const [data, setData] = useState({ loading: true });

  const slugHistory = raw.find(
    (x) => x.success && x.slug.includes('user-watch-history'),
  )?.fields.videos;

  const channels = raw.find(
    (x) => x.success && x.slug.includes('subscribed-channels'),
  )?.fields.channels;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const referenceDate = new Date(raw[0].scrapedAt);
        const history = slugHistory.map((d) => {
          const date = parseDate(d.watchedAt, referenceDate);
          const watchTime = parseInt((d.duration * d.percWatched) / 100 / 1000);
          const detail = lookups[d.id]?.data;
          return { ...d, date, watchTime, ...detail };
        });
        const days = history.length
          ? parseInt(
              (history[0].date - history[history.length - 1].date) /
                (1000 * 60 * 60 * 24),
            )
          : 0;
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
        const channelsNotification = channels.filter(
          (d) => d.notificationsEnabled,
        );
        const topChannel = channels
          .map((c) => ({
            name: c.channelName,
            num: history.filter((h) => h.channelUrl === c.channelUrl).length,
          }))
          .filter((c) => c.num)
          .sort((a, b) => a.num - b.num)
          .pop();

        setData({
          history,
          days,
          mostWatchedCategoriesTime,
          mostWatchedCategoriesAmount,
          watchTime,
          watchPercentAverage,
          watchTimeAverage,
          channels,
          channelsNotification,
          topChannel,
          loading: false,
        });
      } catch (error) {
        console.error(error);
      }
    };

    if (slugHistory && slugHistory.length === 0) {
      setData({ loading: false, empty: true });
    } else if (slugHistory && channels) {
      fetchData();
    }
  }, [slugHistory, channels, lookups]);

  return data;
};
