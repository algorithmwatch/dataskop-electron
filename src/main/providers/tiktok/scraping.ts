/**
 * Tiktok specific code for main.
 */

import { b } from "@algorithmwatch/schaufel-ab";
import {
  getTiktokVideoMeta,
  idToTiktokUrl,
  scrapeAuthorAvatar,
} from "@algorithmwatch/schaufel-core";
import dayjs, { Dayjs } from "dayjs";
import { BrowserWindow } from "electron";
import log from "electron-log";
import _ from "lodash";
import pLimit from "p-limit";
import PQueue from "p-queue";
import path from "path";
import { delay } from "../../../shared/utils/time";
import { addLookups, addLookupsToUpload, getLookups } from "../../db";
import { HTML_FOLDER } from "../../scraping";
import { addMainHandler } from "../../utils";
import { fetchBackend } from "../../utils/networking";

const BACKEND_CHUNK_SIZE = 50;
const SCRAPE_CHUNK_SIZE = 20;
const SCRAPE_CONCURRENCY = 2;
// Artifically add some time to dampen the first too optimistic etas
const ETA_BASE_CORRECTION_MINUTES = 0.5;

const brokenHtmlFolder = path.join(HTML_FOLDER, "broken-html");

const queue = new PQueue();

let scrapingDone = 0;
let scrapingTodo = 0;
let scrapingStartedAt: null | Dayjs = null;
let rendererWindow: null | BrowserWindow = null;

// Avoid race conditions by saving the scraped files via a single worker queue
const persistsDoneScraping = async (videos: any) => {
  addLookups(videos);

  // save keys to upload them later
  addLookupsToUpload(_.keys(videos));

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

const scrapeVideos = async (
  videos: string[],
  htmlLogging: boolean,
): Promise<any> => {
  log.info(`Scraping: ${videos.length} videos`);
  const fetched = await getTiktokVideoMeta(
    videos.map(idToTiktokUrl),
    true,
    false,
    false,
    htmlLogging ? brokenHtmlFolder : false,
    0,
    log.scope("schaufel").info,
  );
  log.info(`Fetched: ${fetched.length} videos`);

  const newDone: any[] = _.zip(videos, fetched).filter((x: any[]) =>
    isResultSane(x[1]),
  );

  const scrapedDone = Object.fromEntries(newDone);
  await queue.add(() => persistsDoneScraping(scrapedDone));
  return scrapedDone;
};

export default function registerTiktokScrapingHandlers(
  mainWindow: BrowserWindow,
) {
  addMainHandler(
    "tiktok-scrape-videos",
    async (
      _event: any,
      ids: string[],
      onlyScrape = false,
      maxScraping: null | number = null,
      htmlLogging = false,
    ): Promise<any> => {
      rendererWindow = mainWindow;
      // check local lookups
      const existing = Object.entries(getLookups(ids)).filter(
        (x) => x[1] != null && isResultSane(x[1]),
      );
      const missingKeys = _.difference(ids, existing.map(_.head));

      log.info(
        `Scraping Tiktok videos: ${existing.length} existing lookups and ${missingKeys.length} missing`,
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
        const chunkMissing = _.difference(
          chunk,
          chunkDone.map(_.head),
        ) as string[];

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

      // Take N videos from the beginning because the ids should be still
      // ordered descendingly. So the ids are from the most recent
      const todoLimited = maxScraping ? todo.slice(0, maxScraping) : todo;

      const limit = pLimit(SCRAPE_CONCURRENCY);
      scrapingDone = 0;
      scrapingStartedAt = dayjs();
      const pScrapes = _.chunk(todoLimited, SCRAPE_CHUNK_SIZE).map((x) =>
        limit(() => scrapeVideos(x, htmlLogging)),
      );
      scrapingTodo = pScrapes.length;
      const scrapedDone = (await Promise.all(pScrapes)).flat();

      if (onlyScrape) return {};
      return _.merge(Object.fromEntries(existing), backendDone, scrapedDone);
    },
  );

  // Keep authors always on the device. Don't upload them.
  // prepend `ta` for TikTok avatars
  addMainHandler(
    "tiktok-scrape-author-avatars",
    async (
      _event: any,
      avatars: string[],
      htmlLogging = false,
    ): Promise<any> => {
      const avatarKeys = avatars.map((x) => `ta${x}`);
      // check local lookups
      const existing = Object.entries(getLookups(avatarKeys));
      const missingKeys = _.difference(
        avatarKeys,
        existing.map(_.head),
      ) as string[];

      log.info(
        `Scraping Tiktok author avatars: ${existing.length} existing lookups and ${missingKeys.length} missing`,
      );

      const scrapedDone = [];
      for (const k of missingKeys) {
        try {
          const result = await scrapeAuthorAvatar(
            k.slice(2),
            log.scope("schaufel").info,
          );
          addLookups({ [k]: result });
          scrapedDone.push([k, result]);
        } catch (err) {
          log.info(`Skipping tiktok avatar for ${k}: ${err}`);
          await delay(1000);
        }
      }

      return _.merge(
        Object.fromEntries(existing.map((x) => [x[0].slice(2), x[1]])),
        Object.fromEntries(scrapedDone.map((x) => [x[0].slice(2), x[1]])),
      );
    },
  );
}
