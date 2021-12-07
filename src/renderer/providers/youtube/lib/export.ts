import { categories } from '@algorithmwatch/harke/src/constants';
import dayjs from 'renderer/lib/utils/dayjs';
import { exportCsv } from 'renderer/lib/utils/export';
import { lookupOrScrapeVideos } from './html-scrapers';

const translateCategories = (cat: string) => {
  const newCat = categories.filter((x) => x.en === cat);
  if (newCat.length === 1) return newCat[0].de;
  return cat;
};

const exportWatchHistoryCsv = async (data) => {
  const videoIds = data.map(({ id }) => id);
  const allLookups = await lookupOrScrapeVideos(videoIds);

  const lookups = allLookups.filter((x) => videoIds.includes(x.info.videoId));

  data.forEach((x) => {
    const rawDate = lookups.filter((l) => l.info.videoId === x.id)[0].info
      .publishedAt;

    x['Online seit (Tage)'] = dayjs().diff(dayjs(rawDate), 'day');
    x.category = translateCategories(x.category);
  });

  exportCsv({
    filename: 'watch-history',
    data,
    enumerateRows: true,
    dropColumns: [
      'id',
      'description',
      'channelUrl',
      'unlisted',
      'videoId',
      'date',
      'watchedAt',
    ],
    newColumns: ['Wochentag'],
    renameColumns: {
      index: 'Nr',
      title: 'Titel',
      duration: 'Videolänge (Sek.)',
      channelName: 'Kanalname',
      percWatched: 'Wiedergabezeit_Prozent',
      watchTime: 'Wiedergabezeit_Absolut (Sek.)',
      category: 'Kategorie',
      viewCount: 'Aufrufe',
    },
    transformColumns: (x) => {
      const d = dayjs(x.date);
      // from ms to s
      x.duration = x.duration / 1000;
      // only the date is in the date, not the time
      x['Wochentag'] = d.format('dd');

      return x;
    },
  });
};

export { exportWatchHistoryCsv };
