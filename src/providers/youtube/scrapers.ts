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
import log from 'electron-log';
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
  timeout: number,
  times: number,
  slugPrefix = 'yt',
) => {
  const curTimeout = timeout;

  // set to some dummy value to please TypeScript
  let prevResult = {
    success: false,
    fields: {},
    errors: [],
    slug: '',
  } as ScrapingResult;

  let prevHash = null;

  // in last round, return parsing result anyhow

  for (const i of range(times)) {
    const lastRound = i === times - 1;
    await delay(curTimeout);
    const { html, hash } = await getCurrentHtml();

    // parse + check if the hash of the HTML is identical
    // OR 2/3 of times passed and in last round
    const checkAnyhow = Math.floor((times * 2) / 3) === i || lastRound;

    if (prevHash === null || (prevHash !== hash && !checkAnyhow)) {
      prevHash = hash;
      // eslint-disable-next-line no-continue
      continue;
    } else {
      prevHash = hash;
    }

    // cast to slightly different `ScrapingResult`
    const result: ScrapingResult = {
      success: false,
      ...parseHtml(html),
    };
    // always prepend the provider's slug
    result.slug = `${slugPrefix}-${result.slug}`;

    if (
      result.errors.length === 0 &&
      (isDoneCheck === null || isDoneCheck(result, i / (times - 1)))
    ) {
      // mark as success
      result.success = true;
      return result;
    }
    prevResult = result;
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
  enableLogging = false,
  timeout = 1000,
  slugPrefix = 'yt',
) => {
  let lastRes = {
    success: false,
    fields: {},
    errors: [],
    slug: '',
  } as ScrapingResult;

  const allErros = [];
  // eslint-disable-next-line no-empty-pattern
  for (const i of range(3)) {
    try {
      if (enableLogging) log.info(`fetch ${url}, try: ${i}`);
      const getCurrentHtml = await getHtml(url);
      // wait after loading since the rendering is still happening
      await delay(timeout);
      const result = await waitUntilDone(
        getCurrentHtml,
        parseHtml,
        isDoneCheck,
        timeout,
        8 + i * 4,
        slugPrefix,
      );
      if (result !== null && result.success) return result;

      lastRes = result;
    } catch (e) {
      if (enableLogging) log.error(JSON.stringify(e));
      console.error(e);
      allErros.push(e);
    }
  }
  if (!lastRes.success) {
    if (enableLogging)
      log.error(
        `Too many failed tries to extract html: ${JSON.stringify(allErros)}`,
      );
    lastRes.errors.push({
      message: `Too many failed tries to extract html: ${JSON.stringify(
        allErros,
      )}`,
      field: 'general error',
    });
  }
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
  enableLogging = false,
): Promise<ScrapingResult> => {
  // comments are currently not implemented
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  return trySeveralTimes(
    getHtml,
    url,
    parseVideoPage,
    // at least 10 videos, still pass if timeout is reached
    (x, timeFrac) => {
      if (enableLogging) log.info('not done yet', JSON.stringify(x));
      return x.fields.recommendedVideos.length > 10;
    },
    enableLogging,
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
  enableLogging: boolean,
) {
  let step = initialStep;

  for (const { id, creator } of seedVideos) {
    if (enableLogging) log.info(`do seed video: ${id}`);
    const followChainId = `${id}-${Date.now()}`;
    const dataFromSeed = await scrapeVideo(id, getHtml, comments);
    step += 1;

    dataFromSeed.slug += '-seed-follow';
    // assign an unique ID to extract follow chains
    dataFromSeed.fields.followId = followChainId;
    dataFromSeed.fields.seedCreator = creator;

    if (enableLogging)
      log.info(
        `got the following number of seed videos: ${dataFromSeed.fields.recommendedVideos.length}`,
      );
    // do not follow if there are no recommended videos
    if (dataFromSeed.fields.recommendedVideos.length === 0) {
      // skip over the follow steps
      step += followVideos;

      // since we skip over some data, we may have reached the end already
      if (step >= maxSteps) {
        log.info('reached early end');
        return [1, dataFromSeed];
      }

      log.info('skipping over following videos');
      // we have to continue because we should not try to get the following videos.
      // thus we yield here already
      yield [step / maxSteps, dataFromSeed];
      // eslint-disable-next-line no-continue
      continue;
    }

    yield [step / maxSteps, dataFromSeed];

    let toScrapeId = dataFromSeed.fields.recommendedVideos[0].id;

    // using `for (const .. of ..)` to work with `await`
    // eslint-disable-next-line no-empty-pattern
    for (const {} of [...Array(followVideos).keys()]) {
      let followVideo = null;

      followVideo = await scrapeVideo(
        toScrapeId,
        getHtml,
        comments,
        enableLogging,
      );

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

  const errMessage = `reached end of scrapeSeedVideosAndFollow with, initialStep: ${initialStep}, maxSteps: ${maxSteps},  followVideos: ${followVideos}, seedVideos: ${JSON.stringify(
    seedVideos,
  )}`;

  // Should never be reached.
  return [
    1,
    {
      success: false,
      fields: {},
      errors: [{ message: errMessage, field: 'general error' }],
    },
  ];
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

  const errMessage = `reached end of scapeSeedVideos with, initialStep: ${initialStep}, maxSteps: ${maxSteps}, seedVideoIds: ${JSON.stringify(
    seedVideoIds,
  )}`;

  // Should never be reached.
  return [
    1,
    {
      success: false,
      fields: {},
      errors: [{ message: errMessage, field: 'general error' }],
    },
  ];
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
