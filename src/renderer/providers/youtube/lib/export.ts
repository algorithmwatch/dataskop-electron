import { categories } from '@algorithmwatch/harke/src/constants';
import dayjs from 'renderer/lib/utils/dayjs';
import { exportCsv } from 'renderer/lib/utils/export';
import { lookupOrScrapeVideos } from './html-scrapers';

const translateCategories = (cat: string) => {
  const newCat = categories.filter((x) => x.en === cat);
  if (newCat.length === 1) return newCat[0].de;
  return cat;
};

const onlineSince = (x) => dayjs().diff(dayjs(x), 'day');

const exportWatchHistoryCsv = async (data) => {
  const videoIds = data.map(({ id }) => id);
  const allLookups = await lookupOrScrapeVideos(videoIds);

  const lookups = allLookups.filter((x) => videoIds.includes(x.info.videoId));

  data.forEach((x) => {
    const rawDate = lookups.filter((l) => l.info.videoId === x.id)[0].info
      .publishedAt;

    x['Online seit (Tage)'] = onlineSince(rawDate);
    x.category = translateCategories(x.category);
  });

  exportCsv({
    filename: 'watch-history',
    data,
    enumerateRows: true,
    headers: [
      'Nr',
      'Titel',
      'Videolänge (Sek.)',
      'Kanalname',
      'Wiedergabezeit_Prozent',
      'Wiedergabezeit_Absolut (Sek.)',
      'Aufrufe',
      'Kategorie',
      'Online seit (Tage)',
      'Wochentag',
    ],
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

const exportAutoplaychainCsv = (data) => {
  const transformedData = data.map((x, i) => {
    const seed = {
      Nr: i + 1,
      Titel_seed: x[0].fields.title,
      Kanalname_seed: x[0].fields.channel.name,
      Aufrufe_seed: x[0].fields.viewCount,
      Kategorie_seed: translateCategories(x[0].fields.category),
      'Online seit_seed (Tage)': onlineSince(x[0].fields.uploadDate),
      'Videolänge_seed (Sek.)': x[0].fields.duration / 10000,
    };

    const rows = x.slice(1).map((r, i) => {
      const follow = {
        Empfehlung: i + 1,
        Titel: r.fields.title,
        Kanalname: r.fields.channel.name,
        Aufrufe: r.fields.viewCount,
        Kategorie: translateCategories(r.fields.category),
        'Online seit (Tage)': onlineSince(r.fields.uploadDate),
        'Videolänge (Sek.)': r.fields.duration / 10000,
      };
      return { ...follow, ...seed };
    });
    return rows;
  });

  exportCsv({
    filename: 'autoplay',
    data: transformedData.flat(),
    headers: [
      'Nr',
      'Titel_seed',
      'Kanalname_seed',
      'Kategorie_seed',
      'Aufrufe_seed',
      'Online seit_seed (Tage)',
      'Videolänge_seed (Sek.)',
      'Empfehlung',
      'Titel',
      'Kanalname',
      'Kategorie',
      'Aufrufe',
      'Online seit (Tage)',
      'Videolänge (Sek.)',
    ],
  });
};

export { exportWatchHistoryCsv, exportAutoplaychainCsv };
