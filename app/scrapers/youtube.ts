import {
  parseGetPlaylist,
  parseGetRelated,
  parseWatchHistory,
  parseSearchHistory,
  parseCommentHistory,
  parseSubscriptions,
} from '../libs/parse-youtube';
import {
  HistoryComment,
  HistorySearch,
  HistoryVideo,
  Subscription,
  Video,
} from '../libs/parse-youtube/types';

type GetHtmlFunction = (url: string) => string;

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
): Promise<{ items: Video[]; type: string }> => {
  const items = await scrapePlaylist(
    'https://www.youtube.com/playlist?list=PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-',
    getHTML
  );
  return { items, type: 'popularVideos' };
};

const scrapeLikedVideos = async (
  getHTML: GetHtmlFunction
): Promise<{ items: Video[]; type: string }> => {
  const items = await scrapePlaylist(
    'https://www.youtube.com/playlist?list=LL',
    getHTML
  );
  return { items, type: 'linkedVideos' };
};

const scrapeRecommendedVideos = async (
  videoId: string,
  getHTML: GetHtmlFunction
): Promise<{ items: Video[]; type: string }> => {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const html = await getHTML(url);
  const items = parseGetRelated(html, 100);
  return { items, type: 'recommendedVideos' };
};

const scrapeWatchedVideos = async (
  getHTML: GetHtmlFunction
): Promise<{ items: HistoryVideo[]; type: string }> => {
  const html = await getHTML('https://www.youtube.com/feed/history');
  return { items: parseWatchHistory(html), type: 'watchedHistroy' };
};

const scrapeSearchHistory = async (
  getHTML: GetHtmlFunction
): Promise<{ items: HistorySearch[]; type: string }> => {
  const html = await getHTML(
    'https://www.youtube.com/feed/history/search_history'
  );
  return { items: parseSearchHistory(html), type: 'searchHistory' };
};

const scrapeCommentHistory = async (
  getHTML: GetHtmlFunction
): Promise<{ items: HistoryComment[]; type: string }> => {
  const html = await getHTML(
    'https://www.youtube.com/feed/history/comment_history'
  );
  return { items: parseCommentHistory(html), type: 'commentHistory' };
};

const scrapeSubscriptions = async (
  getHTML: GetHtmlFunction
): Promise<{ items: Subscription[]; type: string }> => {
  const html = await getHTML('https://www.youtube.com/feed/channels');
  return { items: parseSubscriptions(html), type: 'subscriptions' };
};

async function* scrapingGenerator(getHTML: GetHtmlFunction, limitSteps = 5) {
  // these functions
  const backgroundFuns = [
    scrapeWatchedVideos,
    scrapeLikedVideos,
    scrapeSearchHistory,
    scrapeCommentHistory,
    scrapeSubscriptions,
  ];

  let step = 0;
  let maxSteps = null;

  const seedVideos = await scrapePopularVideos(getHTML);

  // limit number of videos if needed
  maxSteps = seedVideos.items.length;
  if (limitSteps !== null) {
    maxSteps = Math.min(limitSteps, maxSteps);
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

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const data = await scrapeRecommendedVideos(
      seedVideos.items[step - 1].id,
      getHTML
    );
    step += 1;
    if (step < maxSteps) {
      yield [step / maxSteps, data];
    } else {
      return [step / maxSteps, data];
    }
  }
}

const config = {
  loginUrl: 'https://www.youtube.com/account',
  logingCookie: 'LOGIN_INFO',
  scrapingGenerator,
};

export default config;
