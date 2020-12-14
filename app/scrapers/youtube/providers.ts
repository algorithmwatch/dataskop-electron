/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import {
  isCommentSectionClosed,
  isCommentSpinnerActive,
  parseCommentHistory,
  parseComments,
  parseGetPlaylist,
  parseGetRelated,
  parseGetVideo,
  parseSearchHistory,
  parseSubscriptions,
  parseWatchHistory,
} from 'parse-yt';
import { Video } from 'parse-yt/src/types';

// play list of special lists
const LIST_ID_POPULAR = 'PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-';
const LIST_ID_NATIONAL_NEWS_TOP_STORIES = 'PLNjtpXOAJhQJYbpJxMnoLKCUPanyEfv_j';
const LIST_ID_LIKED_VIDEOS = 'LL';

const scrapePlaylist = async (
  playlistId: string,
  getHtml: GetHtmlFunction,
  limit?: number
): Promise<Video[]> => {
  const html = await getHtml(
    `https://www.youtube.com/playlist?list=${playlistId}`
  );
  const { videos } = parseGetPlaylist(html);
  if (typeof limit !== 'undefined') return videos.slice(0, limit);
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
    ...rest
  );
  return { result, task: 'YT-nationalNews' };
};

const scrapeLikedVideos = async (
  getHtml: GetHtmlFunction
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(LIST_ID_LIKED_VIDEOS, getHtml);
  return { result, task: 'YT-likedVideos' };
};

const isLoadingCommentsDone = (html: string) =>
  !isCommentSectionClosed(html) && !isCommentSpinnerActive(html);

const scrapeVideo = async (
  videoId: string,
  getHtml: GetHtmlFunction,
  limit: number | null,
  comments: boolean
): Promise<ScrapingResult> => {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const html = await getHtml(url);

  try {
    const recommendedVideos = parseGetRelated(html, limit);
    const videoInformation = parseGetVideo(html);

    const resultObj = {
      result: { recommendedVideos, videoInformation },
      task: 'YT-recommendedVideos',
    };

    if (comments) {
      resultObj.result.commentSection = parseComments(html);
    }

    return resultObj;
  } catch (error) {
    return {
      result: { videoId },
      error: true,
      stack: error.stack,
      task: 'YT-recommendedVideos',
    };
  }
};

const scrapeWatchedVideos = async (
  getHtml: GetHtmlFunction
): Promise<ScrapingResult> => {
  const html = await getHtml('https://www.youtube.com/feed/history');
  return { result: parseWatchHistory(html), task: 'YT-watchedHistory' };
};

const scrapeSearchHistory = async (
  getHtml: GetHtmlFunction
): Promise<ScrapingResult> => {
  const html = await getHtml(
    'https://www.youtube.com/feed/history/search_history'
  );
  return { result: parseSearchHistory(html), task: 'YT-searchHistory' };
};

const scrapeCommentHistory = async (
  getHtml: GetHtmlFunction
): Promise<ScrapingResult> => {
  const html = await getHtml(
    'https://www.youtube.com/feed/history/comment_history'
  );
  return { result: parseCommentHistory(html), task: 'YT-commentHistory' };
};

const scrapeSubscriptions = async (
  getHtml: GetHtmlFunction
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
  comments: boolean
) {
  let step = initialStep;

  for (const id of seedVideoIds) {
    const dataFromSeed = await scrapeVideo(id, getHtml, null, comments);
    step += 1;
    yield [step / maxSteps, dataFromSeed];

    for (const i of [...Array(followVideos).keys()]) {
      let followVideo = null;
      if ('error' in dataFromSeed) {
        followVideo = await scrapeVideo(
          dataFromSeed.result.recommendedVideos[i].id,
          getHtml,
          null,
          comments
        );
      } else {
        // some hack to add trash data, rework error handling
        followVideo = dataFromSeed;
      }

      followVideo.task += '-followed';
      step += 1;
      if (step < maxSteps) {
        yield [step / maxSteps, followVideo];
      } else {
        return [1, followVideo];
      }
    }
  }
}

async function* scrapeSeedVideos(
  getHtml: GetHtmlFunction,
  seedVideoIds: string[],
  initialStep: number,
  maxSteps: number,
  comments: boolean
) {
  let step = initialStep;
  for (const id of seedVideoIds) {
    const data = await scrapeVideo(id, getHtml, null, comments);
    step += 1;

    if (step < maxSteps) {
      yield [step / maxSteps, data];
    } else {
      return [1, data];
    }
  }
}

const allIndependentProvider = [
  scrapeWatchedVideos,
  scrapeLikedVideos,
  scrapeSearchHistory,
  scrapeCommentHistory,
  scrapeSubscriptions,
];

export {
  allIndependentProvider,
  scrapeSeedVideos,
  scrapeSeedVideosAndFollow,
  isLoadingCommentsDone,
  scrapePopularVideos,
  scrapeNationalNewsTopStories,
};
