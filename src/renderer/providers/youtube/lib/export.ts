/**
 * A collection of functions to transform scraped data into useful data formats
 * for CSV exports. This was initially implemented for the YT education mode.
 * @module
 */
import { constants } from '@algorithmwatch/harke';
import _ from 'lodash';
import dayjs from 'renderer/lib/utils/dayjs';
import { exportCsv } from 'renderer/lib/utils/export';
import { fixDuplicatedString } from 'renderer/lib/utils/strings';
import { renameKeys } from 'renderer/vendor/lodash-contrib';
import { lookupOrScrapeVideos } from './html-scrapers';

const translateCategories = (cat: string) => {
  const newCat = constants.categories.filter((x) => x.en === cat);
  if (newCat.length === 1) return newCat[0].de;
  return cat;
};

const onlineSince = (x) => dayjs().diff(dayjs(x), 'day');

const getBaseInformation = (item, suffix: string | null = null) => {
  const result = {
    Titel: item.fields.title,
    Kanalname: item.fields.channel.name,
    Aufrufe: item.fields.viewCount,
    Kategorie: translateCategories(item.fields.category),
    Online_seit_Tage: onlineSince(item.fields.uploadDate),
    Videolaenge_Sek: item.fields.duration / 10000,
  };

  if (suffix) {
    const keys = Object.keys(result);
    return renameKeys(
      result,
      Object.fromEntries(keys.map((x) => [x, x + suffix])),
    );
  }
  return result;
};

const exportWatchHistoryCsv = async (data) => {
  const videoIds = data.map(({ id }) => id);
  const lookups = await lookupOrScrapeVideos(videoIds);

  data.forEach((x) => {
    const rawDate = lookups[x.id].data.publishedAt;

    x['Online_seit_Tage'] = onlineSince(rawDate);
    x.category = translateCategories(x.category);

    // hotfix: remove duplicated channel name (scraped from watch history)
    x['channelName'] = fixDuplicatedString(x['channelName']);
  });

  exportCsv({
    filename: 'watch-history',
    data,
    enumerateRows: true,
    headers: [
      'Nr',
      'Titel',
      'Videolaenge_Sek',
      'Kanalname',
      'Wiedergabezeit_Prozent',
      'Wiedergabezeit_Absolut_Sek',
      'Aufrufe',
      'Kategorie',
      'Online_seit_Tage',
      'Wochentag',
    ],
    renameColumns: {
      index: 'Nr',
      title: 'Titel',
      duration: 'Videolaenge_Sek',
      channelName: 'Kanalname',
      percWatched: 'Wiedergabezeit_Prozent',
      watchTime: 'Wiedergabezeit_Absolut_Sek',
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
  const transformedData = data
    .map((x, i) => {
      const seed = {
        Nr: i + 1,
        ...getBaseInformation(x[0], '_seed'),
      };

      const rows = x.slice(1).map((r, i) => {
        const follow = {
          Empfehlung: i + 1,
          ...getBaseInformation(r),
        };
        return { ...follow, ...seed };
      });
      return rows;
    })
    .flat();

  exportCsv({
    filename: 'autoplay',
    data: transformedData,
    headers: Object.keys(transformedData[0]),
  });
};

const getRecoInformation = (lookups, item, suffix: string | null = null) => {
  const result = {
    Titel: item.title,
    Kanalname: item.channelName,
    Aufrufe: item.viewCount,
    Videolaenge_Sek: item.duration / 10000,
    Kategorie: translateCategories(lookups[item.id].data.category),
    Online_seit_Tage: onlineSince(lookups[item.id].data.publishedAt),
  };

  if (suffix) {
    const keys = Object.keys(result);
    return renameKeys(
      result,
      Object.fromEntries(keys.map((x) => [x, x + suffix])),
    );
  }
  return result;
};

const exportNewsCsv = async (data) => {
  // limit to 10 recommendations
  const MAX_RECOMMENDATION = 10;

  const toLookup: string[] = [];

  data.forEach((d) => {
    d.signedInVideos
      .slice(0, MAX_RECOMMENDATION)
      .concat(d.signedOutVideos.slice(0, MAX_RECOMMENDATION))
      .forEach((x) => {
        toLookup.push(x.id);
      });
  });

  const lookups = await lookupOrScrapeVideos(toLookup);

  const transformedData = data
    .map((x, i) => {
      const seed = {
        Nr: i + 1,
        ...getBaseInformation(x.video, '_seed'),
      };

      const rowsIn = x.signedInVideos
        .slice(0, MAX_RECOMMENDATION)
        .map((r, i) => {
          return {
            Empfehlung_in: i + 1,
            ...getRecoInformation(lookups, r, '_in'),
          };
        });

      const rowsOut = x.signedOutVideos
        .slice(0, MAX_RECOMMENDATION)
        .map((r, i) => {
          return {
            Empfehlung_out: i + 1,
            ...getRecoInformation(lookups, r, '_out'),
          };
        });

      return _.zipWith(
        Array.from({ length: MAX_RECOMMENDATION }, () => seed),
        rowsIn,
        rowsOut,
        (a: any, b: any, c: any) => ({ ...a, ...b, ...c }),
      );
    })
    .flat();

  exportCsv({
    filename: 'news',
    data: transformedData,
    headers: Object.keys(transformedData[0]),
  });
};

// copy & pasted from `exportNewsCsv`
const exportSearchCsv = async (data) => {
  // limit to 10 recommendations
  const MAX_RECOMMENDATION = 10;

  const toLookup: string[] = [];

  data.forEach((d) => {
    d.signedInVideos
      .slice(0, MAX_RECOMMENDATION)
      .concat(d.signedOutVideos.slice(0, MAX_RECOMMENDATION))
      .forEach((x) => {
        toLookup.push(x.id);
      });
  });

  const lookups = await lookupOrScrapeVideos(toLookup);

  const transformedData = data
    .map((x, i) => {
      const seed = {
        Suchanfrage: x.query,
      };

      const rowsIn = x.signedInVideos
        .slice(0, MAX_RECOMMENDATION)
        .map((r, i) => {
          return {
            Empfehlung_in: i + 1,
            ...getRecoInformation(lookups, r, '_in'),
          };
        });

      const rowsOut = x.signedOutVideos
        .slice(0, MAX_RECOMMENDATION)
        .map((r, i) => {
          return {
            Empfehlung_out: i + 1,
            ...getRecoInformation(lookups, r, '_out'),
          };
        });

      return _.zipWith(
        Array.from({ length: MAX_RECOMMENDATION }, () => seed),
        rowsIn,
        rowsOut,
        (a: any, b: any, c: any) => ({ ...a, ...b, ...c }),
      );
    })
    .flat();

  exportCsv({
    filename: 'search',
    data: transformedData,
    headers: Object.keys(transformedData[0]),
  });
};

export {
  exportWatchHistoryCsv,
  exportAutoplaychainCsv,
  exportNewsCsv,
  exportSearchCsv,
};
