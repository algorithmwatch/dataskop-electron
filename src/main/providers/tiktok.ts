/**
 * Youtube specific code for main.
 */

import { b } from "@algorithmwatch/schaufel-ab";
import { getTiktokVideoMeta } from "@algorithmwatch/schaufel-core";
import { BrowserWindow } from "electron";
import fetch from "electron-fetch";
import _ from "lodash";
import { addLookups, addLookupsToUpload, getLookups } from "../db";
import { addMainHandler } from "../utils";

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
      const missingKeys = missing.map(_.head) as string[];

      // check backend lookups
      const backendDone = {};
      const todo: string[] = [];
      for (const chunk of _.chunk(missingKeys, 50)) {
        const res: any[] = await (
          await fetch(
            `${process.env.PLATFORM_URL}/api/lookups?${chunk
              .map((x) => `l=${x}`)
              .join("&")}`,
          )
        ).json();
        const [chunkDone, chunkMissing] = _.partition(res, "data");
        _.merge(
          backendDone,
          Object.fromEntries(chunkDone.map((x) => [x.id, b(x.data)])),
        );
        todo.push(...chunkMissing);
      }
      addLookups(backendDone);

      const todoLimited = max ? todo.slice(0, max) : todo;
      // scrape new lookups
      const newDone = _.zip(
        todoLimited,
        await getTiktokVideoMeta(todoLimited, true, false, false, 0),
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
