/**
 * Store, load and wrangle data.
 *
 * Initially, we've used [Dexie.js](https://github.com/dfahlander/Dexie.js/) with indexedDB to store data. But we ran into strangle problems that we were unable to fix. The resulting error message:
 * > Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.InvalidStateError: Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.
 * Did not give us the option to debug it. We have found a hard-to-reprocude bug with indexedDB: https://github.com/dfahlander/Dexie.js/issues/613
 * So we decided to to [lowdb](https://github.com/typicode/lowdb) to store all data in JSON file in the `userData` directory.
 *
 * We use a queue for adding the data because otherwise some results were skipped due to some race conditions.
 * Things that could be done to improve the data handling:
 * - don't start processing the tasks (in the queue) once there were added. Only process them every 30 seconds (to reduce disk access)
 * - likewise, when reading data from the disk, add a cache (e.g. 10 seconds)
 * @module
 */
import _ from 'lodash';
import { Low } from 'lowdb';
import PQueue from 'p-queue';
import { Campaign, ScrapingConfig } from '../../providers/types';
import dayjs from '../dayjs';
import { statsForArray } from '../utils/math';
import { LookupMap, ScrapingResultSaved, ScrapingSession } from './types';

type Data = {
  scrapingSessions: ScrapingSession[];
  scrapingResults: ScrapingResultSaved[];
  campaigns: Campaign[];
  lookup: { oldest: number; items: LookupMap } | null;
};

let db: Low<Data> | null = null;

const queue = new PQueue({ concurrency: 1 });

const initDb = async () => {
  class CustomAsyncAdapter {
    async read() {
      return window.electron.ipcRenderer.invoke('db-read');
    }

    async write(data: any) {
      return window.electron.ipcRenderer.invoke('db-write', data);
    }
  }

  const adapter = new CustomAsyncAdapter();
  db = new Low<Data>(adapter);
};

initDb();

const setUpDb = async () => {
  if (db === null) throw Error('db is not initialized');

  await db.read();

  db.data ||= {
    scrapingSessions: [],
    scrapingResults: [],
    campaigns: [],
    lookup: null,
  };
  return db.data;
};

// sessions

const addNewSession = async (
  sessionId: string,
  scrapingConfig: ScrapingConfig,
  campaign: Campaign | null,
) => {
  const obj = {
    sessionId,
    startedAt: Date.now(),
    finishedAt: null,
    scrapingConfig,
    campaign,
    questionnaire: null,
  };

  await setUpDb();

  if (db === null || db.data === null) throw Error('db is not initialized');
  db.data.scrapingSessions.push(obj);

  return db.write();
};

const setSessionFinishedAt = async (sessionId: string) => {
  await setUpDb();

  if (db === null || db?.data === null) throw Error();

  const theSession = db.data.scrapingSessions.filter(
    (x) => x.sessionId === sessionId,
  )[0];

  db.data.scrapingSessions = [
    { ...theSession, finishedAt: Date.now() } as ScrapingSession,
  ].concat(db.data.scrapingSessions.filter((x) => x.sessionId !== sessionId));

  db.write();
};

const addQuestionnaireToSession = async (
  sessionId: string,
  questionnaire: any,
) => {
  await setUpDb();

  if (db === null || db?.data === null) throw Error();

  const theSession = db.data.scrapingSessions.filter(
    (x) => x.sessionId === sessionId,
  )[0];

  db.data.scrapingSessions = [
    { ...theSession, questionnaire } as ScrapingSession,
  ].concat(db.data.scrapingSessions.filter((x) => x.sessionId !== sessionId));

  db.write();
};

const getSessions = async () => {
  const data = await setUpDb();

  const sessionsCount = _.countBy(data.scrapingResults, 'sessionId');
  const sessions = data.scrapingSessions.map((x) => ({
    ...x,
    count: sessionsCount[x.sessionId] ?? 0,
  }));

  sessions.sort((a, b) => (b?.startedAt ?? 0) - (a?.startedAt ?? 0));
  return sessions;
};

const getSessionById = async (
  sessionId: string,
): Promise<ScrapingSession | null> => {
  const data = await setUpDb();

  const res = data.scrapingSessions.filter((x) => x.sessionId === sessionId);
  if (res.length === 1) return res[0];

  return null;
};

// scraping results

const queuedAddScrapingResult = async (obj: ScrapingResultSaved) => {
  await setUpDb();

  if (db === null || db.data === null) throw Error('db is not initialized');

  db.data.scrapingResults.push(obj);

  return db.write();
};

const addScrapingResult = (sessionId: string, step: number, data: any) => {
  const obj = {
    sessionId,
    step,
    ...data,
    scrapedAt: Date.now(),
  };

  return queue.add(() => queuedAddScrapingResult(obj));
};

const getScrapingResults = async () => {
  const data = await setUpDb();
  return _.orderBy(data.scrapingResults, 'scrapedAt');
};

const getScrapingResultsBySession = async (
  sessiondId: string,
  filter: { slug?: null | string; step?: null | number } = {},
) => {
  const { slug, step } = filter;
  const data = await setUpDb();
  return data.scrapingResults.filter(
    (x) =>
      x.sessionId === sessiondId &&
      (slug == null || x.slug === slug) &&
      (step == null || x.step === step),
  );
};

// scraping config

const modifyLocalCampaigns = async (campaign: Campaign, remove = false) => {
  await setUpDb();
  if (db === null || db.data === null) throw Error('db is not initialized');

  const newData =
    db.data.campaigns?.filter((x) => x.slug !== campaign.slug) || [];
  if (!remove) newData.unshift(campaign);

  db.data.campaigns = newData;
  return db.write();
};

const getLocalCampaigns = async () => {
  const data = await setUpDb();
  return data.campaigns || [];
};

// lookup table for e.g. additional background scraping

const getLookups = async (
  options: { deleteOld: boolean; ids: null | string[] } = {
    deleteOld: false,
    ids: null,
  },
): Promise<LookupMap> => {
  const KEEP_LOOKUPS_MAX_DAYS = 7;

  const lookup = (await setUpDb()).lookup;

  if (lookup == null) return {};

  // If the first entry (the oldest one) is older than the max value,
  // clear all lookups and get fresh data.
  if (
    options.deleteOld &&
    dayjs().diff(dayjs(lookup.oldest), 'day') > KEEP_LOOKUPS_MAX_DAYS
  ) {
    await clearLookups();
    return {};
  }

  if (options.ids) {
    return _.pick(lookup.items, options.ids);
  }

  return lookup.items;
};

const addLookups = async (newItems: LookupMap) => {
  if (_.isEmpty(newItems)) return;

  await setUpDb();

  if (db === null || db.data === null) throw Error('db is not initialized');

  if (db.data.lookup == null) {
    db.data.lookup = { items: newItems, oldest: Date.now() };
  } else {
    db.data.lookup.items = _.merge(db.data.lookup.items, newItems);
  }
  return db.write();
};

const clearLookups = async () => {
  await setUpDb();

  if (db === null || db.data === null) throw Error('db is not initialized');

  db.data.lookup = null;
  return db.write();
};

// some utils

const getAllData = async () => {
  return setUpDb();
};

const clearData = async () => {
  if (db === null) throw Error('db is not initialized');

  if (db.data === null) return;
  // keep campaign data
  db.data = {
    scrapingSessions: [],
    scrapingResults: [],
    campaigns: db.data.campaigns,
    lookup: null,
  };
  await db.write();
};

// import data

const importResultRows = async (
  rows: ScrapingResultSaved[],
): Promise<number> => {
  const old = await getScrapingResults();

  const sum = _.uniqWith(old.concat(rows), _.isEqual);

  // db.data can't be null
  if (db === null || db.data === null) throw Error('db is not initialized');
  db.data.scrapingResults = sum;
  await db.write();

  return sum.length - old.length;
};

const importSessionRows = async (rows: ScrapingSession[]): Promise<number> => {
  const old = (await setUpDb()).scrapingSessions;

  const sum = _.uniqWith(old.concat(rows), _.isEqual);

  // db.data can't be null
  if (db === null || db.data === null) throw Error('db is not initialized');
  db.data.scrapingSessions = sum;
  await db.write();

  return sum.length - old.length;
};

// some math utils

const getStatisticsForSession = async (sessiondId: string) => {
  const data = await setUpDb();

  const allTasks = data.scrapingResults.filter(
    (x) => x.sessionId === sessiondId,
  );

  allTasks.sort((a, b) => a.scrapedAt - b.scrapedAt);

  const firstResult = data.scrapingSessions.filter(
    (x) => x.sessionId === sessiondId,
  )[0];

  if (!firstResult) return {};

  const { startedAt } = firstResult;
  const allTimesSlug = new Map();
  const allTimesStep = new Map();
  let previousTime = startedAt;

  for (let i = 0; i < allTasks.length; i += 1) {
    const { slug, scrapedAt, step } = allTasks[i];
    const duration = scrapedAt - previousTime;

    if (allTimesSlug.has(slug)) {
      const oldTimes = allTimesSlug.get(slug);
      const newTimes = oldTimes.concat([duration]);
      allTimesSlug.set(slug, newTimes);
    } else {
      allTimesSlug.set(slug, [duration]);
    }

    if (allTimesStep.has(step)) {
      const oldTimes = allTimesStep.get(step);
      const newTimes = oldTimes.concat([duration]);
      allTimesStep.set(step, newTimes);
    } else {
      allTimesStep.set(step, [duration]);
    }

    previousTime = scrapedAt;
  }

  const resultSlug: { [key: string]: any } = {};
  allTimesSlug.forEach((value, key: string) => {
    resultSlug[key] = statsForArray(value);
  });

  const resultStep: { [key: string]: any } = {};
  allTimesStep.forEach((value, key: string) => {
    resultStep[key] = statsForArray(value);
  });

  return { steps: resultStep, slugs: resultSlug };
};

export {
  getLookups,
  addLookups,
  clearLookups,
  getAllData,
  addScrapingResult,
  importResultRows,
  importSessionRows,
  getScrapingResults,
  clearData,
  getSessionById,
  getSessions,
  getScrapingResultsBySession,
  addNewSession,
  getStatisticsForSession,
  modifyLocalCampaigns,
  getLocalCampaigns,
  setSessionFinishedAt,
  addQuestionnaireToSession,
};
