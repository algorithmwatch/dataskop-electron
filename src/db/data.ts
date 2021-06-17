import { ipcRenderer } from 'electron';
import _ from 'lodash';
import { JSONFile, Low } from 'lowdb';
import PQueue from 'p-queue';
import { join } from 'path';
import { ScrapingConfig } from '../providers/types';
import { statsForArray } from '../utils/math';
import { ScrapingResultSaved, ScrapingSession } from './types';

type Data = {
  scrapingSessions: ScrapingSession[];
  scrapingResults: ScrapingResultSaved[];
  scrapingConfigs: ScrapingConfig[];
};

let db: Low<Data> | null = null;

const queue = new PQueue({ concurrency: 1 });

const initDb = async () => {
  const userFolder = await ipcRenderer.invoke('get-path-user-data');
  const file = join(userFolder, 'db.json');
  const adapter = new JSONFile<Data>(file);
  db = new Low<Data>(adapter);
};

initDb();

const setUpDb = async () => {
  if (db === null) throw Error('db is not initialized');

  await db.read();

  db.data ||= {
    scrapingSessions: [],
    scrapingResults: [],
    scrapingConfigs: [],
  };
  return db.data;
};

const addNewSession = async (sessionId: string, configSlug: string) => {
  const obj = {
    sessionId,
    startedAt: Date.now(),
    finishedAt: null,
    configSlug,
  };

  await setUpDb();

  if (db === null || db.data === null) throw Error('db is not initialized');
  db.data.scrapingSessions.push(obj);

  return db.write();
};

const internAddScrapingResult = async (obj: ScrapingResultSaved) => {
  await setUpDb();

  if (db === null || db.data === null) throw Error('db is not initialized');

  db.data.scrapingResults.push(obj);

  return db.write();
};

// important: use queue because otherwise some results were skipped due to race
// condition
const addScrapingResult = (sessionId: string, step: number, data: any) => {
  const obj = {
    sessionId,
    step,
    ...data,
    scrapedAt: Date.now(),
  };

  return queue.add(() => internAddScrapingResult(obj));
};

const getScrapingResults = async () => {
  const data = await setUpDb();
  return _.orderBy(data.scrapingResults, 'scrapedAt');
};

const modifyScrapingConfig = async (config: ScrapingConfig, remove = false) => {
  await setUpDb();
  if (db === null || db.data === null) throw Error('db is not initialized');

  const newData =
    db.data.scrapingConfigs?.filter((x) => x.slug !== config.slug) || [];
  if (!remove) newData.unshift(config);

  db.data.scrapingConfigs = newData;
  return db.write();
};

const getStoredScrapingConfigs = async () => {
  const data = await setUpDb();
  return data.scrapingConfigs;
};

const getAllData = async () => {
  return setUpDb();
};

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

const getSessionData = async (
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

const clearData = async () => {
  if (db === null) throw Error('db is not initialized');

  if (db.data === null) return;
  db.data = {
    scrapingSessions: [],
    scrapingResults: [],
    scrapingConfigs: db.data.scrapingConfigs,
  };
  await db.write();
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
  const allTimes = new Map();
  let previousTime = startedAt;

  for (let i = 0; i < allTasks.length; i += 1) {
    const { slug, scrapedAt } = allTasks[i];
    const duration = scrapedAt - previousTime;

    if (allTimes.has(slug)) {
      const oldTimes = allTimes.get(slug);
      const newTimes = oldTimes.concat([duration]);
      allTimes.set(slug, newTimes);
    } else {
      allTimes.set(slug, [duration]);
    }

    previousTime = scrapedAt;
  }

  const result: { [key: string]: any } = {};
  allTimes.forEach((value, key: string) => {
    result[key] = statsForArray(value);
  });
  return result;
};

export {
  getAllData,
  addScrapingResult,
  importResultRows,
  importSessionRows,
  getScrapingResults,
  clearData,
  getSessions,
  getSessionData,
  addNewSession,
  getStatisticsForSession,
  modifyScrapingConfig,
  getStoredScrapingConfigs,
  setSessionFinishedAt,
};
