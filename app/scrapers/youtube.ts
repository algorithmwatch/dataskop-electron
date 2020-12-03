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
  getHtml: GetHtmlFunction,
  limit?: number
): Promise<Video[]> => {
  const html = await getHtml(playlistUrl);
  const { videos } = parseGetPlaylist(html);
  if (typeof limit !== 'undefined') return videos.slice(0, limit);
  return videos;
};

// is a special playlist? need to investigate
const scrapePopularVideos = async (
  getHtml: GetHtmlFunction,
  limit?: number
): Promise<ScrapingResult> => {
  let result = null;
  if (typeof limit === 'undefined') {
    result = await scrapePlaylist(
      'https://www.youtube.com/playlist?list=PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-',
      getHtml
    );
  } else {
    result = await scrapePlaylist(
      'https://www.youtube.com/playlist?list=PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-',
      getHtml,
      limit
    );
  }
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
  limit: number | null,
  comments: boolean
): Promise<ScrapingResult> => {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const html = await getHtml(url);
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
      const followVideo = await scrapeVideo(
        dataFromSeed.result.recommendedVideos[i].id,
        getHtml,
        null,
        comments
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

// some background on `yield*`
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield%2A

const defaultScrapingConfig = {
  scrollingBottomForComments: 5,
  followVideos: 1,
  seedFixed: ['4Y1lZQsyuSQ', 'yr1YyrolRZY'],
  seedProvider: [
    {
      approxNumVideos: 5,
      seedFunction: async (getHtml: GetHtmlFunction) =>
        scrapePopularVideos(getHtml, 5),
    },
  ],
  backgroundFuns: [
    scrapeWatchedVideos,
    scrapeLikedVideos,
    scrapeSearchHistory,
    scrapeCommentHistory,
    scrapeSubscriptions,
  ],
};

async function* scrapingYoutubeProcedure(
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
  scrapingConfig = defaultScrapingConfig
) {
  const {
    followVideos,
    seedProvider,
    backgroundFuns,
    scrollingBottomForComments,
    seedFixed,
  } = scrapingConfig;

  const isFollowingVideos = !(followVideos == null || followVideos === 0);
  const scrapeComments = !(
    scrollingBottomForComments == null || scrollingBottomForComments === 0
  );

  let step = 0;
  // guess the number of total steps (may get altered later on)
  const approxNumSeedVideos =
    seedProvider.map((x) => x.approxNumVideos).reduce((pv, cv) => pv + cv, 0) +
    seedFixed.length;

  let maxSteps =
    seedProvider.length +
    approxNumSeedVideos * (followVideos + 1) +
    backgroundFuns.length;

  // 1. block: get seed videos
  let seedVideoIds: string[] = seedFixed;
  for (const { seedFunction, approxNumVideos } of seedProvider) {
    const resultSeedVideos = await seedFunction(getHtml);
    const numSeedVideos = resultSeedVideos.result.length;

    // if the projected number of seed videos is not the actual seed values, correct it
    // TODO: is it correct?
    if (approxNumVideos !== numSeedVideos) {
      maxSteps -= (approxNumSeedVideos - numSeedVideos) * (followVideos + 1);
    }

    step += 1;
    yield [step / maxSteps, resultSeedVideos];
    seedVideoIds = seedVideoIds.concat(resultSeedVideos.result);
  }

  // 2. block: get background information such as history or subscriptions
  for (const fun of backgroundFuns) {
    const data = await fun(getHtml);
    step += 1;
    yield [step / maxSteps, data];
  }

  // 3. block: get acutal video + video recommendations
  // use lazy loading if comments are required
  const getHtmlVideos = !scrapeComments
    ? getHtml
    : (url: string) =>
        getHtmlLazy(url, scrollingBottomForComments, isLoadingCommentsDone);

  if (isFollowingVideos) {
    return yield* scrapeSeedVideosAndFollow(
      getHtmlVideos,
      seedVideoIds,
      step,
      maxSteps,
      followVideos,
      scrapeComments
    );
  }

  return yield* scrapeSeedVideos(
    getHtmlVideos,
    seedVideoIds,
    step,
    maxSteps,
    scrapeComments
  );
}

const defaultConfig = {
  title: 'youtube default config',
  startUrl: 'https://www.youtube.com',
  loginUrl: 'https://www.youtube.com/account',
  loginCookie: 'LOGIN_INFO',
  scrapingGenerator: scrapingYoutubeProcedure,
};

const simpleScrapingConfig = {
  ...defaultScrapingConfig,
  backgroundFuns: [],
  seedProvider: [],
};

const simpleConfig = {
  ...defaultConfig,
  title: 'youtube simple config',
  scrapingGenerator: (x1, x2) =>
    scrapingYoutubeProcedure(x1, x2, simpleScrapingConfig),
};

const allConfig = [defaultConfig, simpleConfig];

export { defaultConfig, simpleConfig, allConfig };
