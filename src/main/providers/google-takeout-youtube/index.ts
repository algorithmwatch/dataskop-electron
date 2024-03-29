/**
 * YouTube specific scraping.
 */
import fs from "fs";

import { extractIdFromUrl, getVideoUrl } from "@algorithmwatch/harke-parser";
import {
  extractWatchedVideosFromDump,
  scrapeYouTubeVideos,
} from "@algorithmwatch/harke-scraper";
import { BrowserWindow, app, dialog } from "electron";
import _ from "lodash";
import path from "path";
import { getNowString } from "../../../shared/utils/time";
import { HTML_FOLDER } from "../../active-scraping";
import { dataStore, getLookups } from "../../db";
import { getDownload } from "../../downloads";
import { backgroundScraping } from "../../passive-scraping/background-scraping";
import { addMainHandler } from "../../utils";

const brokenHtmlFolder = path.join(HTML_FOLDER, "broken-html");

const fromUrlToId = (x) => `yv${extractIdFromUrl(x)}`;
const fromIdtoUrl = (x) => getVideoUrl(x.slice(2));

const getDump = () => getDownload(undefined);

export default function registerGoogleTakeoutYoutubeHandlers(
  mainWindow: BrowserWindow,
) {
  addMainHandler(
    "google-takout-youtube-use-data",
    async (_event: any, maxVideos: number): Promise<any> => {
      const rawDump = await getDump();

      const dump = _.uniq(
        extractWatchedVideosFromDump(rawDump, false)
          .slice(0, maxVideos)
          .filter((x) => x.titleUrl),
      );

      const urls = dump.map((x) => x.titleUrl);
      const ids = urls.map(fromUrlToId);
      const lookups = getLookups(ids);
      return [dump, lookups];
    },
  );

  addMainHandler(
    "google-takout-youtube-scrape-watched-videos",
    async (
      _event: any,
      maxVideos: number,
      maxScraping: number,
    ): Promise<any> => {
      const dump = await getDump();

      const urls = _.uniq(
        (extractWatchedVideosFromDump(dump) as string[])
          .slice(0, maxVideos)
          .filter((x) => x),
      );

      const ids = urls.map(fromUrlToId);

      const fetchFun = (videoIds: string[]) =>
        scrapeYouTubeVideos(videoIds.map(fromIdtoUrl), {
          delay: 0,
          saveCache: false,
          verbose: true,
          storeBrokenHtml: false,
        });

      const limitScraping = maxScraping
        ? (items: any[]) => items.slice(0, maxScraping)
        : null;

      return backgroundScraping(
        mainWindow,
        ids,
        fetchFun,
        limitScraping,
        false,
      );
    },
  );

  addMainHandler("google-takout-youtube-data-export", async (_event: any) => {
    if (mainWindow === null) return;

    const dump = await getDump();
    const ids = dump
      .filter((x) => x.titleUrl)
      .map((x) => `yv${extractIdFromUrl(x.titleUrl)}`);

    const lookups = getLookups(ids);

    const sessions = dataStore.store.data;
    const data = {
      sessions,
      dump,
      lookups,
      version: app.getVersion(),
    };

    const defaultPath = `dataskop-google-takeout-youtube-watch-history-${getNowString()}.json`;

    if (process.env.PLAYWRIGHT_TESTING === "true") {
      fs.writeFileSync(defaultPath, JSON.stringify(data));
      return;
    }

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath,
    });
    if (canceled || !filePath) return;

    fs.writeFileSync(filePath, JSON.stringify(data));
  });
}
