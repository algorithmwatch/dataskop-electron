/* eslint-disable no-restricted-syntax */
import {
  buildSearchUrl,
  parsePlaylistPage,
  ParserResult,
  parseSearchHistory,
  parseSearchResultsVideos,
  parseSubscribedChannels,
  parseVideoPage,
  parseWatchHistory,
} from '@algorithmwatch/harke';
import _, { range } from 'lodash';
import { ScrapingResult } from '../../db/types';
import { delay } from '../../utils/time';
import { lookupOrScrapeVideos } from './html-scrapers';
import {
  GetCurrentHtml,
  GetHtmlFunction,
  ProfileScraper,
  SeedScraper,
  SeedVideo,
} from './types';

// play list of special lists
const LIST_ID_POPULAR = 'PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-';
const LIST_ID_NATIONAL_NEWS_TOP_STORIES = 'PLNjtpXOAJhQJYbpJxMnoLKCUPanyEfv_j';
const LIST_ID_LIKED_VIDEOS = 'LL';

const waitUntilDone = async (
  getCurrentHtml: GetCurrentHtml,
  parseHtml: (html: string) => ParserResult,
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

const trySeveralTimes = async (
  getHtml: GetHtmlFunction,
  url: string,
  parseHtml: (html: string) => ParserResult,
  isDoneCheck: null | ((arg0: ScrapingResult, arg1: number) => boolean) = null,
  timeout = { max: 5000, start: 700, factor: 1.3 },
  slugPrefix = 'yt',
) => {
  let lastRes = null;
  // eslint-disable-next-line no-empty-pattern
  for (const {} of range(3)) {
    try {
      const getCurrentHtml = await getHtml(url);
      const result = await waitUntilDone(
        getCurrentHtml,
        parseHtml,
        isDoneCheck,
        timeout,
        slugPrefix,
      );
      if (result.success) return result;
      lastRes = result;
      await getHtml('https://youtube.com');
      await delay(2000);
    } catch (e) {
      console.error(e);
    }
  }
  if (lastRes === null) throw new Error('too many failed tries');
  return lastRes;
};

const scrapePlaylist = async (
  playlistId: string,
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const url = `https://www.youtube.com/playlist?list=${playlistId}`;
  return trySeveralTimes(getHtml, url, parsePlaylistPage);
};

const scrapePopularVideos = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(LIST_ID_POPULAR, getHtml);
  result.slug += '-popular-videos';
  return result;
};

const scrapeNationalNewsTopStories = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const result = await scrapePlaylist(
    LIST_ID_NATIONAL_NEWS_TOP_STORIES,
    getHtml,
  );
  result.slug += '-national-news-top-stories';
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
  _comments = false,
): Promise<ScrapingResult> => {
  // comments are currently not implemented
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  return trySeveralTimes(
    getHtml,
    url,
    parseVideoPage,
    // at least 10 videos, still pass if timeout is reached
    (x, timeFrac) => timeFrac >= 1 || x.fields.recommendedVideos.length > 10,
  );
};

const scrapeWatchedVideos = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const url = 'https://www.youtube.com/feed/history';
  const results = await trySeveralTimes(getHtml, url, parseWatchHistory);

  // - we need to figure out if a video is private / unlisted
  // - we need to scrape all those videos here because otherwise we need to set
  //   the consent cookie again
  await lookupOrScrapeVideos(_.uniq(results.fields.videos.map(({ id }) => id)));

  await delay(5000);

  return results;
};

const scrapeSearchHistory = async (
  getHtml: GetHtmlFunction,
): Promise<ScrapingResult> => {
  const url = 'https://myactivity.google.com/activitycontrols/youtube';
  return trySeveralTimes(getHtml, url, parseSearchHistory);
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
  const url = 'https://www.youtube.com/feed/channels';
  return trySeveralTimes(getHtml, url, parseSubscribedChannels);
};

const scrapeVideoSearch = async (getHtml: GetHtmlFunction, query: string) => {
  const url = buildSearchUrl(query);

  // hard to parse query from rendered html so pass it to the parser
  return trySeveralTimes(getHtml, url, (html) =>
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
) {
  let step = initialStep;

  for (const { id, creator } of seedVideos) {
    const followChainId = `${id}-${Date.now()}`;
    const dataFromSeed = await scrapeVideo(id, getHtml, comments);
    step += 1;

    dataFromSeed.slug += '-seed-follow';
    // assign an unique ID to extract follow chains
    dataFromSeed.fields.followId = followChainId;
    dataFromSeed.fields.seedCreator = creator;

    // do not follow if there are no recommended videos
    if (dataFromSeed.fields.recommendedVideos.length === 0) {
      // skip over the follow steps
      step += followVideos;

      // reached the end already?
      if (step >= maxSteps) return [1, dataFromSeed];
      break;
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
  seedVideoIds: SeedVideo[],
  initialStep: number,
  maxSteps: number,
  comments: boolean,
) {
  let step = initialStep;
  for (const { id, creator } of seedVideoIds) {
    const data = await scrapeVideo(id, getHtml, comments);

    data.slug += '-seed-no-follow';
    data.fields.seedCreator = creator;

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

export const profileScraperSlugToFun: {
  [key in ProfileScraper]: (arg0: GetHtmlFunction) => Promise<ScrapingResult>;
} = {
  'yt-user-watch-history': scrapeWatchedVideos,
  'yt-playlist-page-liked-videos': scrapeLikedVideos,
  'yt-user-search-history': scrapeSearchHistory,
  // scrapeCommentHistory,
  'yt-user-subscribed-channels': scrapeSubscriptions,
};

export const experimentScrapersSlugToFun: {
  [key in SeedScraper]: (arg0: GetHtmlFunction) => Promise<ScrapingResult>;
} = {
  'yt-playlist-page-popular-videos': scrapePopularVideos,
  'yt-playlist-page-national-news-top-stories': scrapeNationalNewsTopStories,
};

export { scrapeVideoSearch, scrapeSeedVideos, scrapeSeedVideosAndFollow };
