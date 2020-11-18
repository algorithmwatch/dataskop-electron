import {
  parseGetPlaylist,
  parseGetRelated,
  parseWatchHistory,
  parseSearchHistory,
  parseCommentHistory,
  parseSubscriptions,
} from '../libs/parse-youtube';

const scrapePlaylist = async (playlistUrl: string, getHTML: Function) => {
  const html = await getHTML(playlistUrl);
  const { videos } = parseGetPlaylist(html);
  return videos;
};

// is a special playlist? need to investigate
const scrapePopularVideos = (getHTML: Function) => {
  return scrapePlaylist(
    'https://www.youtube.com/playlist?list=PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-',
    getHTML
  );
};

const scrapeLikedVideos = (getHTML: Function) => {
  return scrapePlaylist('https://www.youtube.com/playlist?list=LL', getHTML);
};

const scrapeRecommendedVideos = async (videoId: string, getHTML: Function) => {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const html = await getHTML(url);
  const videos = parseGetRelated(html, 100);
  return videos;
};

const scrapeWatchedVideos = async (getHTML: Function) => {
  const html = await getHTML('https://www.youtube.com/feed/history');
  return parseWatchHistory(html);
};

const scrapeSearchHistory = async (getHTML: Function) => {
  const html = await getHTML(
    'https://www.youtube.com/feed/history/search_history'
  );
  return parseSearchHistory(html);
};

const scrapeCommentHistory = async (getHTML: Function) => {
  const html = await getHTML(
    'https://www.youtube.com/feed/history/comment_history'
  );
  return parseCommentHistory(html);
};

const scrapeSubscriptions = async (getHTML: Function) => {
  const html = await getHTML('https://www.youtube.com/feed/channels');
  return parseSubscriptions(html);
};

async function* scrapingGenerator(getHTML: Function, limitSteps = 5) {
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

  const videos = await scrapePopularVideos(getHTML);

  // limit number of videos if needed
  maxSteps = videos.length;
  if (limitSteps !== null) {
    maxSteps = Math.min(limitSteps, maxSteps);
  }

  // add all fix functions
  maxSteps += 1 + backgroundFuns.length;

  step += 1;
  yield [step / maxSteps, videos];

  // eslint-disable-next-line no-restricted-syntax
  for (const fun of backgroundFuns) {
    // eslint-disable-next-line no-await-in-loop
    const data = await fun(getHTML);
    step += 1;
    yield [step / maxSteps, data];
  }

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const recommendedVideos = await scrapeRecommendedVideos(
      videos[step - 1].id,
      getHTML
    );
    step += 1;
    if (step < maxSteps) {
      yield [step / maxSteps, recommendedVideos];
    } else {
      return [step / maxSteps, recommendedVideos];
    }
  }
}

const config = {
  loginUrl: 'https://www.youtube.com/account',
  logingCookie: 'LOGIN_INFO',
  scrapingGenerator,
};

export default config;
