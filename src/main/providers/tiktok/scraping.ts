/**
 * Tiktok specific scraping.
 */

import {
  getTiktokVideoMeta,
  idToTiktokUrl,
  scrapeAuthorAvatar,
} from "@algorithmwatch/schaufel-core";
import { BrowserWindow } from "electron";
import log from "electron-log";
import _ from "lodash";
import path from "path";
import { delay } from "../../../shared/utils/time";
import { HTML_FOLDER } from "../../active-scraping";
import { addLookups, getLookups } from "../../db";
import { backgroundScraping } from "../../passive-scraping/background-scraping";
import { addMainHandler } from "../../utils";

const brokenHtmlFolder = path.join(HTML_FOLDER, "broken-html");

export default function registerTiktokScrapingHandlers(
  mainWindow: BrowserWindow,
) {
  addMainHandler(
    "tiktok-scrape-videos",
    async (
      _event: any,
      ids: string[],
      returnItems = true,
      maxScraping: null | number = null,
      htmlLogging = false,
    ): Promise<any> => {
      const fetchFun = (videos: string[]) =>
        getTiktokVideoMeta(
          videos.map(idToTiktokUrl),
          true,
          false,
          htmlLogging ? brokenHtmlFolder : false,
          0,
          log.scope("schaufel").info,
          undefined, // use default fetch function without proxy
          undefined, // try only 5 (the default) times
        );

      const limitScraping = maxScraping
        ? (items: any[]) => items.slice(0, maxScraping)
        : null;

      return backgroundScraping(
        mainWindow,
        ids,
        fetchFun,
        limitScraping,
        returnItems,
      );
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
