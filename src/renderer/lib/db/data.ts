/* eslint-disable class-methods-use-this */
/**
 * Store, load and wrangle data.
 *
 * Initially, we've used [Dexie.js](https://github.com/dfahlander/Dexie.js/) with indexedDB to store data. But we ran into strangle problems that we were unable to fix. The resulting error message:
 * > Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.InvalidStateError: Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.
 * Did not give us the option to debug it. We have found a hard-to-reprocude bug with indexedDB: https://github.com/dfahlander/Dexie.js/issues/613
 * And: the indexedDb may get corrupted on version updates: https://github.com/sindresorhus/electron-store/issues/17#issuecomment-962635119
 *
 * So we decided to to [lowdb](https://github.com/typicode/lowdb) to store all data in JSON file in the `userData` directory.
 *
 * We use a queue for adding the data because otherwise some results were skipped due to some race conditions.
 *
 * Things that could be done to improve the data handling:
 * - don't start processing the tasks (in the queue) once there were added. Only process them every 30 seconds (to reduce disk access)
 * - likewise, when reading data from the disk, add a cache (e.g. 10 seconds)
 * - don't pass the whole JSON object via IPC every time a changes of the DB is needed (This code was added before contextIsolation so initially we had access to node and the file system)
 * @module
 */
import _ from "lodash";
import { Low } from "lowdb";
import PQueue from "p-queue";
import { Campaign } from "../../providers/types";
import { ScrapingResultSaved, ScrapingSession } from "./types";

type Data = {
  scrapingSessions: ScrapingSession[];
  scrapingResults: ScrapingResultSaved[];
  campaigns: Campaign[];
};

let db: Low<Data> | null = null;

const queue = new PQueue({ concurrency: 1 });

const initDb = async () => {
  class CustomAsyncAdapter {
    async read() {
      return window.electron.ipc.invoke("db-read");
    }

    async write(data: any) {
      return window.electron.ipc.invoke("db-write", data);
    }
  }

  const adapter = new CustomAsyncAdapter();
  db = new Low<Data>(adapter);
};

initDb();

const setUpDb = async () => {
  if (db === null) throw Error("db is not initialized");

  await db.read();

  db.data ||= {
    scrapingSessions: [],
    scrapingResults: [],
    campaigns: [],
  };
  return db.data;
};

// sessions

const addNewSession = async (sessionId: string, campaign: Campaign) => {
  const scrapingConfig = campaign.config;
  const obj = {
    sessionId,
    startedAt: Date.now(),
    finishedAt: null,
    scrapingConfig,
    campaign,
    questionnaire: null,
  };

  await setUpDb();

  if (db === null || db.data === null) throw Error("db is not initialized");
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

  const sessionsCount = _.countBy(data.scrapingResults, "sessionId");
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

// eslint-disable-next-line @typescript-eslint/naming-convention
const _addScrapingResult = async (obj: ScrapingResultSaved) => {
  await setUpDb();

  if (db === null || db.data === null) throw Error("db is not initialized");

  db.data.scrapingResults.push(obj);

  return db.write();
};

const addScrapingResult = (
  sessionId: string,
  step: number,
  data: any,
  skipQueue = false,
) => {
  const obj = {
    sessionId,
    step,
    ...data,
    scrapedAt: Date.now(),
  };
  if (skipQueue) _addScrapingResult(obj);
  return queue.add(() => _addScrapingResult(obj));
};

const getScrapingResults = async (): Promise<ScrapingResultSaved[]> => {
  const data = await setUpDb();
  return _.orderBy(data.scrapingResults, "scrapedAt");
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

const getLastResult = async (): Promise<ScrapingResultSaved> => {
  const data = await getScrapingResults();
  return data[data.length - 1];
};

// scraping config

const modifyLocalCampaigns = async (campaign: Campaign, remove = false) => {
  await setUpDb();
  if (db === null || db.data === null) throw Error("db is not initialized");

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

// some utils

const getAllData = async () => {
  return setUpDb();
};

const clearData = async () => {
  await setUpDb();

  if (db === null) throw Error("db is not initialized");

  if (db.data === null) return;
  // keep campaign data
  db.data = {
    scrapingSessions: [],
    scrapingResults: [],
    campaigns: db.data.campaigns,
  };
  await db.write();
  window.electron.log.info("Deleting all session and results data");
};

// import data

const importResultRows = async (
  rows: ScrapingResultSaved[],
): Promise<number> => {
  const old = await getScrapingResults();

  const sum = _.uniqWith(old.concat(rows), _.isEqual);

  // db.data can't be null
  if (db === null || db.data === null) throw Error("db is not initialized");
  db.data.scrapingResults = sum;
  await db.write();

  return sum.length - old.length;
};

const importSessionRows = async (rows: ScrapingSession[]): Promise<number> => {
  const old = (await setUpDb()).scrapingSessions;

  const sum = _.uniqWith(old.concat(rows), _.isEqual);

  // db.data can't be null
  if (db === null || db.data === null) throw Error("db is not initialized");
  db.data.scrapingSessions = sum;
  await db.write();

  return sum.length - old.length;
};

export {
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
  getLastResult,
  setUpDb,
  modifyLocalCampaigns,
  getLocalCampaigns,
  setSessionFinishedAt,
  addQuestionnaireToSession,
};
