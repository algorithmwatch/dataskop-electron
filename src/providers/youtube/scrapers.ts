/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import {
  parsePlaylistPage,
  parseSearchHistory,
  parseSubscribedChannels,
  parseVideoPage,
  parseWatchHistory,
} from '@algorithmwatch/harke-parser';
import { ParserResult } from '@algorithmwatch/harke-parser/src/types';
import _ from 'lodash';
import { ScrapingResult } from '../../db/types';
import { delay } from '../../utils/time';
import { GetCurrentHtml, GetHtmlFunction } from './types';

// play list of special lists
const LIST_ID_POPULAR = 'PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-';
const LIST_ID_NATIONAL_NEWS_TOP_STORIES = 'PLNjtpXOAJhQJYbpJxMnoLKCUPanyEfv_j';
const LIST_ID_LIKED_VIDEOS = 'LL';

const waitUntilDone = async (
  getCurrentHtml: GetCurrentHtml,
  parseHtml: (url: string) => ParserResult,
  isDoneCheck: null | ((arg0: ScrapingResult, arg1: number) => boolean) = null,
  timeout = { max: 5000, start: 700, factor: 1.3 },
  slugPrefix = 'yt',
) => {
  let curTimeout = timeout.start;

  // set to some dummy value to please TypeScript
  let prevResult = {
    success: false,
    fields: {},
    errors: [],
    slug: '',
  } as ScrapingResult;

  while (curTimeout < timeout.max) {
    await delay(curTimeout);
    const currentHtml = await getCurrentHtml();

    // cast to slightly different `ScrapingResult`
    const result: ScrapingResult = {
      success: false,
      ...parseHtml(currentHtml),
    };
    // always prepend the provider's slug
    result.slug = `${slugPrefix}-${result.slug}`;

    if (
      result.errors.length === 0 &&
      _.isEqual(result, prevResult) &&
      (isDoneCheck === null || isDoneCheck(result, curTimeout / timeout.max))
    ) {
      // mark as success
      result.success = true;
      return result;
    }
    prevResult = result;
    curTimeout *= timeout.factor;
  }

  // prevResult is the last extracted result.
  // `success` is still set to `false`.
  return prevResult;
};

const scrapePlaylist = async (
  playlistId: string,
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
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
    (x, timeFrac) => timeFrac >= 1 || x.fields.recommendedVideos.length > 10,
  );
};

const scrapeWatchedVideos = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const getCurrentHtml = await getHtml('https://www.youtube.com/feed/history');
  await delay(1000);
  return waitUntilDone(getCurrentHtml, parseWatchHistory);
};

const scrapeSearchHistory = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const getCurrentHtml = await getHtml(
    'https://myactivity.google.com/activitycontrols/youtube',
  );
  return waitUntilDone(getCurrentHtml, parseSearchHistory);
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
): Promise<ScrapingResult> => {
  const getCurrentHtml = await getHtml('https://www.youtube.com/feed/channels');
  return waitUntilDone(getCurrentHtml, parseSubscribedChannels);
};

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

    // do not follow if there are no recommended videos and abort
    if (dataFromSeed.fields.recommendedVideos.length === 0) {
      return [1, dataFromSeed];
    }

    yield [step / maxSteps, dataFromSeed];

    let toScrapeId = dataFromSeed.fields.recommendedVideos[0].id;

    // using `for (const .. of ..)` to work with `await`
    // eslint-disable-next-line no-empty-pattern
    for (const {} of [...Array(followVideos).keys()]) {
      let followVideo = null;

      followVideo = await scrapeVideo(toScrapeId, getHtml, comments);

      followVideo.slug += '-followed';
      followVideo.fields.followId = followChainId;

      step += 1;

      // proceed if: 1) we didn't meet the max number of steps 2) there are actually recommended videos
      if (step < maxSteps && followVideo.fields.recommendedVideos.length > 0) {
        toScrapeId = followVideo.fields.recommendedVideos[0].id;
        yield [step / maxSteps, followVideo];
      } else {
        return [1, followVideo];
      }
    }
  }
  // Should never be reached.
  return [1, null];
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
  // Should never be reached.
  return [1, null];
}

export const profileScrapers = {
  scrapeWatchedVideos,
  scrapeLikedVideos,
  scrapeSearchHistory,
  // scrapeCommentHistory,
  scrapeSubscriptions,
};

export const experimentScrapers = {
  scrapeSeedVideos,
  scrapeSeedVideosAndFollow,
  scrapePopularVideos,
  scrapeNationalNewsTopStories,
};
