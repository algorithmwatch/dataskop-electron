/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import {
  isCommentSpinnerActive,
  parseCommentHistory,
  parseComments,
  parseGetPlaylist,
  parseGetRelated,
  parseGetVideo,
  parseSearchHistory,
  parseSubscriptions,
  parseWatchHistory,
} from '../libs/parse-youtube';
import { Video } from '../libs/parse-youtube/types';

type GetHtmlFunction = (url: string) => Promise<string>;
type GetHtmlLazyFunction = (
  url: string,
  scrollBottom: number,
  doneLoading: (html: string) => boolean
) => Promise<string>;

type ScrapingResult = {
  task: string;
  result: any;
};

const scrapePlaylist = async (
  playlistUrl: string,
  getHtml: GetHtmlFunction
): Promise<Video[]> => {
  const html = await getHtml(playlistUrl);
  const { videos } = parseGetPlaylist(html);
  return videos;
};

// is a special playlist? need to investigate
const scrapePopularVideos = async (
  getHtml: GetHtmlFunction
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(
    'https://www.youtube.com/playlist?list=PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-',
    getHtml
  );
  return { result, task: 'YT-popularVideos' };
};

const scrapeLikedVideos = async (
  getHtml: GetHtmlFunction
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(
    'https://www.youtube.com/playlist?list=LL',
    getHtml
  );
  return { result, task: 'YT-likedVideos' };
};

const isLoadingCommentsDone = (html: string) => !isCommentSpinnerActive(html);

// todo: scroll down and spinner

const scrapeVideo = async (
  videoId: string,
  getHtml: GetHtmlFunction,
  limit?: number | null,
  comments?: false
): Promise<ScrapingResult> => {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const html = await getHtml(url);

  const recommendedVideos = parseGetRelated(html, limit);
  const videoInformation = parseGetVideo(html);
  const commentSection = parseComments(html);
  return {
    result: { recommendedVideos, videoInformation, commentSection },
    task: 'YT-recommendedVideos',
  };
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
  seedVideos: Video[],
  initialStep: number,
  maxSteps: number,
  followVideos: number
) {
  let step = initialStep;

  for (const { id } of seedVideos) {
    const dataFromSeed = await scrapeVideo(id, getHtml);
    step += 1;
    yield [step / maxSteps, dataFromSeed];

    for (const i of [...Array(followVideos).keys()]) {
      const followVideo = await scrapeVideo(
        dataFromSeed.result.recommendedVideos[i].id,
        getHtml
      );
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
  seedVideos: Video[],
  initialStep: number,
  maxSteps: number
) {
  let step = initialStep;
  for (const { id } of seedVideos) {
    const data = await scrapeVideo(id, getHtml);
    step += 1;

    if (step < maxSteps) {
      yield [step / maxSteps, data];
    } else {
      return [1, data];
    }
  }
}

// some background on `yield*`
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield%2A

async function* scrapingYoutubeProcedure(
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
  limitSteps = 5,
  followVideos = 1,
  backgroundFuns = [
    scrapeWatchedVideos,
    scrapeLikedVideos,
    scrapeSearchHistory,
    scrapeCommentHistory,
    scrapeSubscriptions,
  ],
  scrollingBottomForComments?: number
) {
  let step = 0;
  let maxSteps = null;
  const isFollowingVideos = !(followVideos == null || followVideos === 0);

  const seedVideos = await scrapePopularVideos(getHtml);

  // limit number of videos if needed
  maxSteps = seedVideos.result.length;
  if (limitSteps !== null) {
    maxSteps = Math.min(limitSteps, maxSteps);
  }

  // for each seed videos, follow X times the new video
  if (isFollowingVideos) {
    maxSteps *= followVideos + 1;
  }

  // 1 for fetching the seed videos + times for background function
  maxSteps += 1 + backgroundFuns.length;

  step += 1;
  yield [step / maxSteps, seedVideos];

  // eslint-disable-next-line no-restricted-syntax
  for (const fun of backgroundFuns) {
    // eslint-disable-next-line no-await-in-loop
    const data = await fun(getHtml);
    step += 1;
    yield [step / maxSteps, data];
  }

  const getHtmlVideos =
    scrollingBottomForComments === undefined
      ? getHtml
      : (url: string) =>
          getHtmlLazy(url, scrollingBottomForComments, isLoadingCommentsDone);

  if (isFollowingVideos) {
    return yield* scrapeSeedVideosAndFollow(
      getHtmlVideos,
      seedVideos.result,
      step,
      maxSteps,
      followVideos
    );
  }

  return yield* scrapeSeedVideos(
    getHtmlVideos,
    seedVideos.result,
    step,
    maxSteps
  );
}

async function* scrapingYoutubeProcedureSimple(f1, f2) {
  return yield* scrapingYoutubeProcedure(f1, f2, 5, 0, [], 5);
}

const defaultConfig = {
  startUrl: 'https://www.youtube.com',
  loginUrl: 'https://www.youtube.com/account',
  loginCookie: 'LOGIN_INFO',
  scrapingGenerator: scrapingYoutubeProcedure,
};

const simpleConfig = {
  ...defaultConfig,
  scrapingGenerator: scrapingYoutubeProcedureSimple,
};

export { defaultConfig, simpleConfig };
