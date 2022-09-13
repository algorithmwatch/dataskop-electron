/**
 * Youtube specific code for main.
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
import { addMainHandler, fetchBackend } from "../utils";

export default function registerTiktokHandlers(mainWindow: BrowserWindow) {
  addMainHandler(
    "tiktok-get-lookups",
    async (
      _event: any,
      ids: string[],
      onlyScrape = false,
      max: null | number = null,
    ): Promise<any> => {
      // check local lookups
      const [existings, missing] = _.partition(
        getLookups(ids),
        (x) => x[1] !== null,
      );
      log.info(
        `${existings.length} existing lookups and ${missing.length} missing`,
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
          `chunk: ${chunkDone.length} existing lookups from backups and ${chunkMissing.length} missing`,
        );

        _.merge(
          backendDone,
          Object.fromEntries(chunkDone.map((x) => [x.id, b(x.data)])),
        );
        todo.push(...chunkMissing);
      }
      addLookups(backendDone);

      const todoLimited = max ? todo.slice(0, max) : todo;
      // scrape new lookups

      const fetched = await getTiktokVideoMeta(
        todoLimited.map(idToTiktokUrl),
        true,
        false,
        false,
        false,
        0,
      );

      log.info(`Fetched ${fetched.length} for ${todoLimited.length}`);

      const newDone = _.zip(todoLimited, fetched);

      const scrapedDone = Object.fromEntries(newDone);
      addLookups(scrapedDone);
      // save keys to upload them later
      console.log(_.keys(scrapedDone));
      addLookupsToUpload(_.keys(scrapedDone));
      if (onlyScrape) return {};
      return _.merge(Object.fromEntries(existings), backendDone, scrapedDone);
    },
  );
}
