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
import {
  HistoryComment,
  HistorySearch,
  HistoryVideo,
  Subscription,
  Video,
  VideoDetailed,
} from '../libs/parse-youtube/types';

type GetHtmlFunction = (url: string) => Promise<string>;
type GetHtmlLazyFunction = (
  url: string,
  scrollBottom: number,
  doneLoading: (html: string) => boolean
) => Promise<string>;

const scrapePlaylist = async (
  playlistUrl: string,
  getHTML: GetHtmlFunction
): Promise<Video[]> => {
  const html = await getHTML(playlistUrl);
  const { videos } = parseGetPlaylist(html);
  return videos;
};

// is a special playlist? need to investigate
const scrapePopularVideos = async (
  getHTML: GetHtmlFunction
): Promise<{ items: Video[]; task: string }> => {
  const items = await scrapePlaylist(
    'https://www.youtube.com/playlist?list=PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-',
    getHTML
  );
  return { items, task: 'YT-popularVideos' };
};

const scrapeLikedVideos = async (
  getHTML: GetHtmlFunction
): Promise<{ items: Video[]; task: string }> => {
  const items = await scrapePlaylist(
    'https://www.youtube.com/playlist?list=LL',
    getHTML
  );
  return { items, task: 'YT-likedVideos' };
};

const isLoadingCommentsDone = (html: string) => !isCommentSpinnerActive(html);

// todo: scroll down and spinner

const scrapeRecommendedVideos = async (
  videoId: string,
  getHTML: GetHtmlFunction,
  limit?: number | null,
  comments?: false
): Promise<{
  single: VideoDetailed | null;
  items: Video[];
  commentSection: any;
  task: string;
}> => {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const html = await getHTML(url);

  const items = parseGetRelated(html, limit);
  const single = parseGetVideo(html);
  const commentSection = parseComments(html);
  return {
    single,
    items: items ?? [],
    commentSection,
    task: 'YT-recommendedVideos',
  };
};

const scrapeWatchedVideos = async (
  getHTML: GetHtmlFunction
): Promise<{ items: HistoryVideo[]; task: string }> => {
  const html = await getHTML('https://www.youtube.com/feed/history');
  return { items: parseWatchHistory(html), task: 'YT-watchedHistory' };
};

const scrapeSearchHistory = async (
  getHTML: GetHtmlFunction
): Promise<{ items: HistorySearch[]; task: string }> => {
  const html = await getHTML(
    'https://www.youtube.com/feed/history/search_history'
  );
  return { items: parseSearchHistory(html), task: 'YT-searchHistory' };
};

const scrapeCommentHistory = async (
  getHTML: GetHtmlFunction
): Promise<{ items: HistoryComment[]; task: string }> => {
  const html = await getHTML(
    'https://www.youtube.com/feed/history/comment_history'
  );
  return { items: parseCommentHistory(html), task: 'YT-commentHistory' };
};

const scrapeSubscriptions = async (
  getHTML: GetHtmlFunction
): Promise<{ items: Subscription[]; task: string }> => {
  const html = await getHTML('https://www.youtube.com/feed/channels');
  return { items: parseSubscriptions(html), task: 'YT-subscriptions' };
};

async function* scrapeSeedVideosAndFollow(
  getHTML: GetHtmlFunction,
  seedVideos: any,
  initialStep: number,
  maxSteps: number,
  followVideos: number
) {
  let step = initialStep;
  while (true) {
    const data = await scrapeRecommendedVideos(
      seedVideos.items[step - 1].id,
      getHTML
    );
    step += 1;
    yield [step / maxSteps, data];

    // eslint-disable-next-line no-restricted-syntax
    for (const i of [...Array(followVideos).keys()]) {
      const followVideo = await scrapeRecommendedVideos(
        data.items[i].id,
        getHTML
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
  getHTML: GetHtmlFunction,
  seedVideos: any,
  initialStep: number,
  maxSteps: number
) {
  let step = initialStep;
  while (true) {
    const data = await scrapeRecommendedVideos(
      seedVideos.items[step - 1].id,
      getHTML
    );
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
  getHTML: GetHtmlFunction,
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

  const seedVideos = await scrapePopularVideos(getHTML);

  // limit number of videos if needed
  maxSteps = seedVideos.items.length;
  if (limitSteps !== null) {
    maxSteps = Math.min(limitSteps, maxSteps);
  }

  // for each seed videos, follow X times the new video
  if (isFollowingVideos) {
    maxSteps *= followVideos + 1;
  }

  // add all fix functions
  maxSteps += 1 + backgroundFuns.length;

  step += 1;
  yield [step / maxSteps, seedVideos];

  // eslint-disable-next-line no-restricted-syntax
  for (const fun of backgroundFuns) {
    // eslint-disable-next-line no-await-in-loop
    const data = await fun(getHTML);
    step += 1;
    yield [step / maxSteps, data];
  }

  const getHtmlVideos =
    scrollingBottomForComments === undefined
      ? getHTML
      : (url: string) =>
          getHtmlLazy(url, scrollingBottomForComments, isLoadingCommentsDone);

  if (isFollowingVideos) {
    return yield* scrapeSeedVideosAndFollow(
      getHtmlVideos,
      seedVideos,
      step,
      maxSteps,
      followVideos
    );
  }
  return yield* scrapeSeedVideos(getHtmlVideos, seedVideos, step, maxSteps);
}

async function* scrapingYoutubeProcedureSimple(f1, f2) {
  return yield* scrapingYoutubeProcedure(f1, f2, 5, 0, [], 5);
}

const defaultConfig = {
  startUrl: 'https://www.youtube.com',
  loginUrl: 'https://www.youtube.com/account',
  logingCookie: 'LOGIN_INFO',
  scrapingGenerator: scrapingYoutubeProcedure,
};

const simpleConfig = {
  ...defaultConfig,
  scrapingGenerator: scrapingYoutubeProcedureSimple,
};

export { defaultConfig, simpleConfig };
