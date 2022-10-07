/**
 * Tiktok specific code for main.
 */

import { b } from "@algorithmwatch/schaufel-ab";
import {
  getTiktokVideoMeta,
  idToTiktokUrl,
} from "@algorithmwatch/schaufel-core";
import { BrowserWindow } from "electron";
import log from "electron-log";
import _ from "lodash";
import { addLookups, addLookupsToUpload, getLookups } from "../db";
import { HTML_FOLDER } from "../scraping";
import { addMainHandler, fetchBackend } from "../utils";

// set ENV to save broken schaufel html to this very folder
// FIXME: not working right now
process.env.SCHAUFEL_DIR = HTML_FOLDER;

const isResultSane = (x: any) => {
  return x.error === null || x.error !== "Parsing error";
};

export default function registerTiktokHandlers(mainWindow: BrowserWindow) {
  addMainHandler(
    "tiktok-scrape-videos",
    async (
      _event: any,
      ids: string[],
      onlyScrape = false,
      max: null | number = null,
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
      const BACKEND_CHUNK_SIZE = 50;
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

      const todoLimited = max ? todo.slice(0, max) : todo;

      log.info(`Scraping: ${todoLimited.length} videos`);
      const fetched = await getTiktokVideoMeta(
        todoLimited.map(idToTiktokUrl),
        true,
        false,
        false,
        htmlLogging,
        0,
        log.scope("schaufel").info,
      );
      log.info(`Fetched: ${fetched.length} videos`);

      const newDone: any[] = _.zip(todoLimited, fetched).filter((x: any[]) =>
        isResultSane(x[1]),
      );

      const scrapedDone = Object.fromEntries(newDone);
      addLookups(scrapedDone);

      // save keys to upload them later
      addLookupsToUpload(_.keys(scrapedDone));

      if (onlyScrape) return {};
      return _.merge(Object.fromEntries(existings), backendDone, scrapedDone);
    },
  );
}
