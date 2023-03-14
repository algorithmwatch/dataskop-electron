import { b } from "@algorithmwatch/schaufel-ab";
import dayjs, { Dayjs } from "dayjs";
import { BrowserWindow } from "electron";
import log from "electron-log";
import _ from "lodash";
import pLimit from "p-limit";
import PQueue from "p-queue";
import { delay } from "../../shared/utils/time";
import { addLookups, addLookupsToUpload, getLookups } from "../db";
import { fetchBackend } from "../utils/networking";

const BACKEND_CHUNK_SIZE = 50;
const SCRAPE_CHUNK_SIZE = 20;
const SCRAPE_CONCURRENCY = 2;
// Artifically add some time to dampen the first too optimistic etas
const ETA_BASE_CORRECTION_MINUTES = 0.5;

let scrapingDone = 0;
let scrapingTodo = 0;
let scrapingStartedAt: null | Dayjs = null;
let rendererWindow: null | BrowserWindow = null;

const queue = new PQueue();

// Avoid race conditions by saving the scraped files via a single worker queue
const persistsDoneScraping = async (items: any) => {
  addLookups(items);

  // save keys to upload them later
  addLookupsToUpload(_.keys(items));

  if (scrapingStartedAt && rendererWindow) {
    scrapingDone += 1;
    const prog = scrapingDone / scrapingTodo;
    const now = dayjs();
    const diffMin = now.diff(scrapingStartedAt, "minute", true);
    const eta = (ETA_BASE_CORRECTION_MINUTES + diffMin) * (1 / prog) - diffMin;

    log.debug(`Now: ${now}, startedAt: ${scrapingStartedAt}`);
    log.info(`Scraping progress: ${prog} eta: ${eta}`);

    rendererWindow.webContents.send("set-progress", [prog, _.ceil(eta)]);
  }

  // Add some delay because it's unclear how electron-store handles multiple
  // writes within a short timeframe
  await delay(1000);
};

// Check if lookup was successfully scraped (error === null) or the error was not a parsing error.
// If the latter occurse, we have to adapt the parser to don't try to scrape it again.
const isResultSane = (x: any) => {
  return x.error === null || x.error !== "Parsing error";
};

const scrapeItems = async (
  items: string[],
  fetchAndParse: any,
): Promise<any> => {
  log.info(`Scraping: ${items.length} items`);
  const fetched = await fetchAndParse(items);

  const newDone: any[] = _.zip(items, fetched).filter((x: any[]) =>
    isResultSane(x[1]),
  );

  const scrapedDone = Object.fromEntries(newDone);
  await queue.add(() => persistsDoneScraping(scrapedDone));
  return scrapedDone;
};

const backgroundScraping = async (
  mainWindow: BrowserWindow,
  ids: string[],
  fetchAndParse: any,
  limitScraping: null | ((x: any[]) => any[]) = null,
  returnItems = true,
): Promise<any> => {
  rendererWindow = mainWindow;
  // check local lookups
  const existing = Object.entries(getLookups(ids)).filter(
    (x) => x[1] != null && isResultSane(x[1]),
  );
  const missingKeys = _.difference(ids, existing.map(_.head));

  log.info(
    `Scraping items: ${existing.length} existing lookups and ${missingKeys.length} missing`,
  );

  // check backend lookups
  const backendDone = {};
  const todo: string[] = [];
  for (const chunk of _.chunk(missingKeys, BACKEND_CHUNK_SIZE)) {
    const chunkDone: any[] = await fetchBackend(
      `${process.env.PLATFORM_URL}/api/lookups?${chunk
        .map((x) => `l=${x}`)
        .join("&")}`,
    );
    const chunkMissing = _.difference(chunk, chunkDone.map(_.head)) as string[];

    log.info(
      `Scraping chunk: ${chunkDone.length} existing lookups from backend and ${chunkMissing.length} missing`,
    );

    _.merge(
      backendDone,
      Object.fromEntries(chunkDone.map((x) => [x.id, b(x.data)])),
    );
    todo.push(...chunkMissing);
  }
  addLookups(backendDone);

  // Limit the number to scrape if needed
  const todoLimited = limitScraping ? limitScraping(todo) : todo;

  const limit = pLimit(SCRAPE_CONCURRENCY);
  scrapingDone = 0;
  scrapingStartedAt = dayjs();
  const pScrapes = _.chunk(todoLimited, SCRAPE_CHUNK_SIZE).map((x) =>
    limit(() => scrapeItems(x, fetchAndParse)),
  );
  scrapingTodo = pScrapes.length;
  const scrapedDone = (await Promise.all(pScrapes)).flat();

  if (!returnItems) return {};
  return _.merge(Object.fromEntries(existing), backendDone, scrapedDone);
};

export { backgroundScraping };
