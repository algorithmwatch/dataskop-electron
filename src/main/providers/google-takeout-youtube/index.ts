/**
 * YouTube specific scraping.
 */

import { extractIdFromUrl, getVideoUrl } from "@algorithmwatch/harke-parser";
import {
  extractWatchedVideosFromDump,
  scrapeYouTubeVideos,
} from "@algorithmwatch/harke-scraper";
import { BrowserWindow } from "electron";
import _ from "lodash";
import path from "path";
import { HTML_FOLDER } from "../../active-scraping";
import { getLookups } from "../../db";
import { getDownload } from "../../downloads";
import { backgroundScraping } from "../../passive-scraping/background-scraping";
import { addMainHandler } from "../../utils";

const brokenHtmlFolder = path.join(HTML_FOLDER, "broken-html");

const fromUrlToId = (x) => `yv${extractIdFromUrl(x)}`;
const fromIdtoUrl = (x) => getVideoUrl(x.slice(2));

const getDump = () => getDownload(undefined, /.*watch-history.*/);

export default function registerGoogleTakeoutYoutubeHandlers(
  mainWindow: BrowserWindow,
) {
  addMainHandler(
    "google-takout-youtube-use-data",
    async (_event: any, maxVideos: number): Promise<any> => {
      const dump = await getDump();

      const urls = _.uniq(
        (extractWatchedVideosFromDump(dump) as string[])
          .slice(0, maxVideos)
          .filter((x) => x),
      );

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

      console.log(urls);
      const ids = urls.map(fromUrlToId);
      console.log(ids);

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
}
