/**
 * Tiktok specific code for main.
 */

import { b } from "@algorithmwatch/schaufel-ab";
import {
  getTiktokVideoMeta,
  idToTiktokUrl,
  scrapeAuthorAvatar,
} from "@algorithmwatch/schaufel-core";
import { BrowserWindow } from "electron";
import log from "electron-log";
import _ from "lodash";
import pLimit from "p-limit";
import PQueue from "p-queue";
import { addLookups, addLookupsToUpload, getLookups } from "../../db";
import { HTML_FOLDER } from "../../scraping";
import { addMainHandler, delay, fetchBackend } from "../../utils";

const BACKEND_CHUNK_SIZE = 50;
const SCRAPE_CHUNK_SIZE = 20;
const SCRAPE_CONCURRENCY = 2;

// Set ENV to save broken schaufel html to this very folder
// FIXME: not working right now
process.env.SCHAUFEL_DIR = HTML_FOLDER;

const queue = new PQueue();

// Avoid race conditions by saving the scraped files via a single worker queue
const persistsDoneScraping = async (videos: any) => {
  addLookups(videos);

  // save keys to upload them later
  addLookupsToUpload(_.keys(videos));

  // Add some delay because it's unclear how electron-store handles multiple
  // writes within a short timeframe
  await delay(1000);
};

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
    htmlLogging,
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
      // check local lookups
      const [existings, missing] = _.partition(
        getLookups(ids),
        (x) => x[1] !== null && isResultSane(x[1]),
      );
      log.info(
        `Scraping Tiktok videos: ${existings.length} existing lookups and ${missing.length} missing`,
      );

      const missingKeys = missing.map(_.head) as string[];

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
      const pScrapes = _.chunk(todoLimited, SCRAPE_CHUNK_SIZE).map((x) =>
        limit(() => scrapeVideos(x, htmlLogging)),
      );
      const scrapedDone = (await Promise.all(pScrapes)).flat();

      if (onlyScrape) return {};
      return _.merge(Object.fromEntries(existings), backendDone, scrapedDone);
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
      // check local lookups
      const [existings, missing] = _.partition(
        getLookups(avatars.map((x) => `ta${x}`)),
        (x) => x != null,
      );
      log.info(
        `Scraping Tiktok author avatars: ${existings.length} existing lookups and ${missing.length} missing`,
      );

      const missingKeys = missing.map(_.head) as string[];

      const scrapedDone = [];
      for (const k of missingKeys) {
        const result = await scrapeAuthorAvatar(
          k.slice(2),
          log.scope("schaufel").info,
        );

        addLookups({ [k]: result });
        scrapedDone.push([k, result]);
      }

      return _.merge(Object.fromEntries(existings), scrapedDone);
    },
  );
}
