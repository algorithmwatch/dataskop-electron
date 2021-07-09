import * as chrono from 'chrono-node';
import { mean, rollups, sum } from 'd3-array';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Lookup, ScrapingResult } from '../../../db/types';

const parseDate = (() => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const yesterday = new Date(today - 864e5);
  return (str: string) => {
    if (str === 'Today') return today;
    if (str === 'Yesterday') return yesterday;
    if (str.split(' ').length === 1) {
      try {
        return moment().day(str).toDate();
        // eslint-disable-next-line no-empty
      } catch {}
    }

    const germanDate = chrono.de.parseDate(str);
    if (germanDate !== null) return germanDate;

    return chrono.en.parseDate(str);
  };
})();

export const useData = (raw: Array<ScrapingResult>, lookups: Array<Lookup>) => {
  const [data, setData] = useState({});

  const slugHistory = raw.find(
    (x) => x.success && x.slug.includes('user-watch-history'),
  )?.fields.videos;

  const channels = raw.find(
    (x) => x.success && x.slug.includes('subscribed-channels'),
  )?.fields.channels;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const history = slugHistory.map((d) => {
          const date = parseDate(d.watchedAt);
          const watchTime = parseInt((d.duration * d.percWatched) / 100 / 1000);
          const detail = lookups.find((l) => l.info.videoId === d.id)?.info;
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
        });
      } catch (error) {
        console.error(error);
      }
    };

    if (slugHistory) {
      fetchData();
    } else {
      setData({ empty: true });
    }
  }, [slugHistory, channels]);

  return data;
};
