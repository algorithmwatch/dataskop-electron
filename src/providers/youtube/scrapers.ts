/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { parseVideoPage } from '@algorithmwatch/harke-parser';
import {
  parseCommentHistory,
  parseGetPlaylist,
  parseSearchHistory,
  parseSubscriptions,
  parseWatchHistory,
} from 'parse-yt';
import { Video } from 'parse-yt/src/types';
import { ScrapingResult } from '../../db/types';
import { delay } from '../../utils/time';

// play list of special lists
const LIST_ID_POPULAR = 'PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-';
const LIST_ID_NATIONAL_NEWS_TOP_STORIES = 'PLNjtpXOAJhQJYbpJxMnoLKCUPanyEfv_j';
const LIST_ID_LIKED_VIDEOS = 'LL';

const scrapePlaylist = async (
  playlistId: string,
  getHtml: GetHtmlFunction,
): Promise<Video[]> => {
  const html = await getHtml(
    `https://www.youtube.com/playlist?list=${playlistId}`,
  );
  const { videos } = parseGetPlaylist(html);
  return videos;
};

const scrapePopularVideos = async (
  getHtml: GetHtmlFunction,
  ...rest: number[]
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(LIST_ID_POPULAR, getHtml, ...rest);
  return { result, task: 'YT-popularVideos' };
};

const scrapeNationalNewsTopStories = async (
  getHtml: GetHtmlFunction,
  ...rest: number[]
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(
    LIST_ID_NATIONAL_NEWS_TOP_STORIES,
    getHtml,
    ...rest,
  );
  return { result, task: 'YT-nationalNews' };
};

const scrapeLikedVideos = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(LIST_ID_LIKED_VIDEOS, getHtml);
  return { result, task: 'YT-likedVideos' };
};

const scrapeVideo = async (
  videoId: string,
  getHtml: GetHtmlFunction,
  comments = false,
  timeout = { max: 1000, start: 100, factor: 1.5 },
): Promise<ScrapingResult> => {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const getCurrentHtml = await getHtml(url);

  let curTimeout = timeout.start;
  while (curTimeout < timeout.max) {
    await delay(curTimeout);
    const currentHtml = await getCurrentHtml();
    const result = parseVideoPage(currentHtml, comments);
    console.log(result);
    if (result.errors.length === 0) {
      result.slug = `yt-${result.slug}`;
      return result;
    }
    curTimeout *= timeout.factor;
  }
  throw new Error('parse error');
};

const scrapeWatchedVideos = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const html = await getHtml('https://www.youtube.com/feed/history');
  return { result: parseWatchHistory(html), task: 'YT-watchedHistory' };
};

const scrapeSearchHistory = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const html = await getHtml(
    'https://www.youtube.com/feed/history/search_history',
  );
  return { result: parseSearchHistory(html), task: 'YT-searchHistory' };
};

const scrapeCommentHistory = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const html = await getHtml(
    'https://www.youtube.com/feed/history/comment_history',
  );
  return { result: parseCommentHistory(html), task: 'YT-commentHistory' };
};

const scrapeSubscriptions = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const html = await getHtml('https://www.youtube.com/feed/channels');
  return { result: parseSubscriptions(html), task: 'YT-subscriptions' };
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

    yield [step / maxSteps, dataFromSeed];

    for (const i of [...Array(followVideos).keys()]) {
      let followVideo = null;

      followVideo = await scrapeVideo(
        dataFromSeed.fields.recommendedVideos[i].id,
        getHtml,
        comments,
      );

      followVideo.slug += '-followed';
      followVideo.fields.followId = followChainId;
      step += 1;
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
  scrapeWatchedVideos,
  scrapeLikedVideos,
  scrapeSearchHistory,
  scrapeCommentHistory,
  scrapeSubscriptions,
};

export const experimentScrapers = {
  scrapeSeedVideos,
  scrapeSeedVideosAndFollow,
  scrapePopularVideos,
  scrapeNationalNewsTopStories,
};
