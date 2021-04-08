/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import {
  parsePlaylistPage,
  parseVideoPage,
} from '@algorithmwatch/harke-parser';
import _ from 'lodash';
import { ScrapingResult } from '../../db/types';
import { delay } from '../../utils/time';

// play list of special lists
const LIST_ID_POPULAR = 'PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-';
const LIST_ID_NATIONAL_NEWS_TOP_STORIES = 'PLNjtpXOAJhQJYbpJxMnoLKCUPanyEfv_j';
const LIST_ID_LIKED_VIDEOS = 'LL';

const waitUntilDone = async (
  getCurrentHtml,
  parseHtml,
  isDoneCheck = null,
  timeout = { max: 5000, start: 700, factor: 1.3 },
) => {
  let curTimeout = timeout.start;
  let prevResult = null;
  while (curTimeout < timeout.max) {
    await delay(curTimeout);
    const currentHtml = await getCurrentHtml();
    const result = parseHtml(currentHtml);

    if (
      result.errors.length === 0 &&
      _.isEqual(result, prevResult) &&
      (isDoneCheck === null || isDoneCheck(result, curTimeout / timeout.max))
    ) {
      result.slug = `yt-${result.slug}`;
      return result;
    }
    prevResult = result;
    curTimeout *= timeout.factor;
  }
  throw new Error(`parse error: ${JSON.stringify(prevResult.errors)}`);
};

const scrapePlaylist = async (
  playlistId: string,
  getHtml: GetHtmlFunction,
): Promise<Video[]> => {
  const getCurrentHtml = await getHtml(
    `https://www.youtube.com/playlist?list=${playlistId}`,
  );
  return waitUntilDone(getCurrentHtml, parsePlaylistPage);
};

const scrapePopularVideos = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(LIST_ID_POPULAR, getHtml);
  result.slug += '-popular';
  return result;
};

const scrapeNationalNewsTopStories = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(
    LIST_ID_NATIONAL_NEWS_TOP_STORIES,
    getHtml,
  );
  result.slug += '-news-top-stories';
  return result;
};

const scrapeLikedVideos = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(LIST_ID_LIKED_VIDEOS, getHtml);
  result.slug += '-liked-videos';
  return result;
};

const scrapeVideo = async (
  videoId: string,
  getHtml: GetHtmlFunction,
  comments = false,
): Promise<ScrapingResult> => {
  // comments are currently not implemented
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const getCurrentHtml = await getHtml(url);
  return waitUntilDone(
    getCurrentHtml,
    parseVideoPage,
    // at least 10 videos, still pass if timeout is reached
    (x, timeFrac) => timeFrac > 1 || x.fields.recommendedVideos.length > 10,
  );
};

// const scrapeWatchedVideos = async (
//   getHtml: GetHtmlFunction,
// ): Promise<ScrapingResult> => {
//   const html = await getHtml('https://www.youtube.com/feed/history');
//   return { result: parseWatchHistory(html), task: 'YT-watchedHistory' };
// };

// const scrapeSearchHistory = async (
//   getHtml: GetHtmlFunction,
// ): Promise<ScrapingResult> => {
//   const html = await getHtml(
//     'https://www.youtube.com/feed/history/search_history',
//   );
//   return { result: parseSearchHistory(html), task: 'YT-searchHistory' };
// };

// const scrapeCommentHistory = async (
//   getHtml: GetHtmlFunction,
// ): Promise<ScrapingResult> => {
//   const html = await getHtml(
//     'https://www.youtube.com/feed/history/comment_history',
//   );
//   return { result: parseCommentHistory(html), task: 'YT-commentHistory' };
// };

// const scrapeSubscriptions = async (
//   getHtml: GetHtmlFunction,
// ): Promise<ScrapingResult> => {
//   const html = await getHtml('https://www.youtube.com/feed/channels');
//   return { result: parseSubscriptions(html), task: 'YT-subscriptions' };
// };

async function* scrapeSeedVideosAndFollow(
  getHtml: GetHtmlFunction,
  seedVideoIds: string[],
  initialStep: number,
  maxSteps: number,
  followVideos: number,
  comments: boolean,
) {
  let step = initialStep;

  for (const id of seedVideoIds) {
    const followChainId = `${id}-${Date.now()}`;
    const dataFromSeed = await scrapeVideo(id, getHtml, comments);
    step += 1;
    dataFromSeed.slug += '-seed';

    // assign an unique ID to extract follow chains
    dataFromSeed.fields.followId = followChainId;

    yield [step / maxSteps, dataFromSeed];

    let toScrapeId = dataFromSeed.fields.recommendedVideos[0].id;
    for (const i of [...Array(followVideos).keys()]) {
      let followVideo = null;

      followVideo = await scrapeVideo(toScrapeId, getHtml, comments);

      followVideo.slug += '-followed';
      followVideo.fields.followId = followChainId;

      // not sure if this `step` stuff is needed
      step += 1;
      toScrapeId = followVideo.fields.recommendedVideos[0].id;

      if (step < maxSteps) {
        yield [step / maxSteps, followVideo];
      } else {
        return [1, followVideo];
      }
    }
  }
  return null;
}

async function* scrapeSeedVideos(
  getHtml: GetHtmlFunction,
  seedVideoIds: string[],
  initialStep: number,
  maxSteps: number,
  comments: boolean,
) {
  let step = initialStep;
  for (const id of seedVideoIds) {
    const data = await scrapeVideo(id, getHtml, comments);
    step += 1;

    if (step < maxSteps) {
      yield [step / maxSteps, data];
    } else {
      return [1, data];
    }
  }
  return null;
}

export const personalScrapers = {
  scrapeLikedVideos,
};
// export const personalScrapers = {
//   scrapeWatchedVideos,
//   scrapeLikedVideos,
//   scrapeSearchHistory,
//   scrapeCommentHistory,
//   scrapeSubscriptions,
// };

export const experimentScrapers = {
  scrapeSeedVideos,
  scrapeSeedVideosAndFollow,
  scrapePopularVideos,
  scrapeNationalNewsTopStories,
};
