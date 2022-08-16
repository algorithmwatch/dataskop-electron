import {
  buildSearchUrl,
  parsePlaylistPage,
  parseSearchHistory,
  parseSearchResultsVideos,
  parseSubscribedChannels,
  parseVideoPage,
  parseWatchHistory,
} from "@algorithmwatch/harke";
import _ from "lodash";
import { ScrapingResult } from "renderer/lib/db/types";
import { currentDelay } from "renderer/lib/delay";
import { parseUntilDone } from "renderer/lib/scraping";
import { GetHtmlFunction } from "renderer/providers/types";
import { lookupOrScrapeVideos } from "./html-scrapers";
import { ProfileScraper, SeedScraper, SeedVideo } from "./types";

// play list of special lists
const LIST_ID_POPULAR = "PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-";
const LIST_ID_NATIONAL_NEWS_TOP_STORIES = "PLNjtpXOAJhQJYbpJxMnoLKCUPanyEfv_j";
const LIST_ID_LIKED_VIDEOS = "LL";

const scrapePlaylist = async (
  playlistId: string,
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const url = `https://www.youtube.com/playlist?list=${playlistId}`;
  return parseUntilDone(getHtml, url, parsePlaylistPage);
};

const scrapePopularVideos = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(LIST_ID_POPULAR, getHtml);
  result.slug += "-popular-videos";
  return result;
};

const scrapeNationalNewsTopStories = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(
    LIST_ID_NATIONAL_NEWS_TOP_STORIES,
    getHtml,
  );
  result.slug += "-national-news-top-stories";
  return result;
};

const scrapeLikedVideos = async (
  getHtml: GetHtmlFunction,
  _enableLogging: boolean,
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(LIST_ID_LIKED_VIDEOS, getHtml);
  result.slug += "-liked-videos";
  return result;
};

const scrapeVideo = async (
  videoId: string,
  getHtml: GetHtmlFunction,
  _comments = false,
  enableLogging = false,
): Promise<ScrapingResult> => {
  // comments are currently not implemented
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  return parseUntilDone(
    getHtml,
    url,
    parseVideoPage,
    // at least 10 videos, still pass if timeout is reached
    (x, timeFrac) => {
      if (enableLogging)
        window.electron.log.info("not done yet", JSON.stringify(x));
      return x.fields.recommendedVideos.length > 10;
    },
    enableLogging,
    1,
  );
};

const scrapeWatchedVideos = async (
  getHtml: GetHtmlFunction,
  enableLogging: boolean,
): Promise<ScrapingResult> => {
  const url = "https://www.youtube.com/feed/history";
  const results = await parseUntilDone(
    getHtml,
    url,
    parseWatchHistory,
    null,
    false,
    2,
    20,
    2000,
  );

  if (!results.success) {
    window.electron.log.error(
      "there is a problem with scraping the watch history",
      results,
    );
  }

  if (enableLogging) {
    window.electron.log.info(
      `scrapeWatchedVideos: scraping finished successfully: ${results.success}. We got ${results.fields.videos?.length} watched videos`,
    );
  }

  // - we need to figure out if a video is private / unlisted
  // - we need to scrape all those videos here because otherwise we need to set
  //   the consent cookie again
  await lookupOrScrapeVideos(
    _.uniq(results.fields.videos.map(({ id }) => id)),
    enableLogging,
  );

  await currentDelay("longer");

  return results;
};

const scrapeSearchHistory = async (
  getHtml: GetHtmlFunction,
  _enableLogging: boolean,
): Promise<ScrapingResult> => {
  const url = "https://myactivity.google.com/activitycontrols/youtube";
  return parseUntilDone(getHtml, url, parseSearchHistory);
};

// const scrapeCommentHistory = async (
//   getHtml: GetHtmlFunction,
// ): Promise<ScrapingResult> => {
//   const html = await getHtml(
//     'https://www.youtube.com/feed/history/comment_history',
//   );
//   return { result: parseCommentHistory(html), task: 'YT-commentHistory' };
// };

const scrapeSubscriptions = async (
  getHtml: GetHtmlFunction,
  _enableLogging: boolean,
): Promise<ScrapingResult> => {
  const url = "https://www.youtube.com/feed/channels";
  return parseUntilDone(getHtml, url, parseSubscribedChannels);
};

const scrapeVideoSearch = async (getHtml: GetHtmlFunction, query: string) => {
  const url = buildSearchUrl(query);

  // hard to parse query from rendered html so pass it to the parser
  return parseUntilDone(getHtml, url, (html) =>
    parseSearchResultsVideos(html, query),
  );
};

async function* scrapeSeedVideosAndFollow(
  getHtml: GetHtmlFunction,
  seedVideos: SeedVideo[],
  initialStep: number,
  maxSteps: number,
  followVideos: number,
  comments: boolean,
  enableLogging: boolean,
) {
  let step = initialStep;

  for (const { id, creator } of seedVideos) {
    if (enableLogging) window.electron.log.info(`do seed video: ${id}`);
    const followChainId = `${id}-${Date.now()}`;
    const dataFromSeed = await scrapeVideo(id, getHtml, comments);
    step += 1;

    dataFromSeed.slug += "-seed-follow";
    // assign an unique ID to extract follow chains
    dataFromSeed.fields.followId = followChainId;
    dataFromSeed.fields.seedCreator = creator;

    if (enableLogging)
      window.electron.log.info(
        `got the following number of seed videos: ${dataFromSeed.fields.recommendedVideos.length}`,
      );
    // do not follow if there are no recommended videos
    if (dataFromSeed.fields.recommendedVideos.length === 0) {
      // skip over the follow steps
      step += followVideos;

      // since we skip over some data, we may have reached the end already
      if (step >= maxSteps) {
        window.electron.log.info("reached early end");
        return [1, dataFromSeed];
      }

      window.electron.log.info("skipping over following videos");
      // we have to continue because we should not try to get the following videos.
      // thus we yield here already
      yield [step / maxSteps, dataFromSeed];
      // eslint-disable-next-line no-continue
      continue;
    }

    yield [step / maxSteps, dataFromSeed];

    let toScrapeId = dataFromSeed.fields.recommendedVideos[0].id;

    // using `for (const .. of ..)` to work with `await`
    // eslint-disable-next-line no-empty-pattern
    for (const loopI of _.range(followVideos)) {
      let followVideo = null;

      followVideo = await scrapeVideo(
        toScrapeId,
        getHtml,
        comments,
        enableLogging,
      );

      followVideo.slug += "-followed";
      followVideo.fields.followId = followChainId;

      step += 1;

      // proceed if: 1) we didn't meet the max number of steps 2) there are actually recommended videos
      if (step < maxSteps) {
        if (followVideo.fields.recommendedVideos.length > 0) {
          toScrapeId = followVideo.fields.recommendedVideos[0].id;
          yield [step / maxSteps, followVideo];
        } else {
          // if we DO NOT have a another video to follow, we have to get out of the loop
          step += followVideos - loopI;
          // are we already at the end?
          if (step < maxSteps) return [1, followVideo];
          yield [step / maxSteps, followVideo];
          // continue with new seed video
          break;
        }
      } else {
        return [1, followVideo];
      }
    }
  }
  // Should never be reached.

  const errMessage = `reached end of scrapeSeedVideosAndFollow with, initialStep: ${initialStep}, maxSteps: ${maxSteps},  followVideos: ${followVideos}, seedVideos: ${JSON.stringify(
    seedVideos,
  )}`;

  // Should never be reached.
  return [
    1,
    {
      success: false,
      fields: {},
      errors: [{ message: errMessage, field: "general error" }],
    },
  ];
}

async function* scrapeSeedVideos(
  getHtml: GetHtmlFunction,
  seedVideoIds: SeedVideo[],
  initialStep: number,
  maxSteps: number,
  comments: boolean,
) {
  let step = initialStep;
  for (const { id, creator } of seedVideoIds) {
    const data = await scrapeVideo(id, getHtml, comments);

    data.slug += "-seed-no-follow";
    data.fields.seedCreator = creator;

    step += 1;

    if (step < maxSteps) {
      yield [step / maxSteps, data];
    } else {
      return [1, data];
    }
  }

  const errMessage = `reached end of scapeSeedVideos with, initialStep: ${initialStep}, maxSteps: ${maxSteps}, seedVideoIds: ${JSON.stringify(
    seedVideoIds,
  )}`;

  // Should never be reached.
  return [
    1,
    {
      success: false,
      fields: {},
      errors: [{ message: errMessage, field: "general error" }],
    },
  ];
}

export const profileScraperSlugToFun: {
  [key in ProfileScraper]: (
    arg0: GetHtmlFunction,
    enableLogging: boolean,
  ) => Promise<ScrapingResult>;
} = {
  "yt-user-watch-history": scrapeWatchedVideos,
  "yt-playlist-page-liked-videos": scrapeLikedVideos,
  "yt-user-search-history": scrapeSearchHistory,
  // scrapeCommentHistory,
  "yt-user-subscribed-channels": scrapeSubscriptions,
};

export const experimentScrapersSlugToFun: {
  [key in SeedScraper]: (arg0: GetHtmlFunction) => Promise<ScrapingResult>;
} = {
  "yt-playlist-page-popular-videos": scrapePopularVideos,
  "yt-playlist-page-national-news-top-stories": scrapeNationalNewsTopStories,
};

export { scrapeVideoSearch, scrapeSeedVideos, scrapeSeedVideosAndFollow };
