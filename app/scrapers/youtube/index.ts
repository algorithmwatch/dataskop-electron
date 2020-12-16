/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { isCommentSectionClosed, isNotCommentSpinnerActive } from 'parse-yt';
import {
  allIndependentProvider,
  scrapeNationalNewsTopStories,
  scrapePopularVideos,
  scrapeSeedVideos,
  scrapeSeedVideosAndFollow,
} from './providers';

// TODO: load parse yt from remote into invisible browserview
// import { remote } from 'electron';
// const win = new remote.BrowserWindow({ show: false });
// // Load a remote URL
// win.loadURL('https://github.com');

const defaultScrapingConfig = {
  // how often to scroll down for lazy loading
  scrollingBottomForComments: 5,
  // how many videos to follow for each seed video
  followVideos: 1,
  // id of videos that are further processed
  seedFixedVideos: ['4Y1lZQsyuSQ', 'yr1YyrolRZY'],
  // function that provides seed videos, including the approx. amount of videos (for the progress bar)
  seedProvider: [
    {
      approxNumVideos: 5,
      seedFunction: async (getHtml: GetHtmlFunction) =>
        scrapePopularVideos(getHtml, 5),
    },
    {
      approxNumVideos: 5,
      seedFunction: async (getHtml: GetHtmlFunction) =>
        scrapeNationalNewsTopStories(getHtml, 5),
    },
  ],
  // Functions (more specific `generator`) that provides (extracts / scrapes) data independent from other functions.
  independentProvider: allIndependentProvider,
};

/**
 *  some background on `yield*`:
 *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield%2A
 */
async function* scrapingYoutubeProcedure(
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
  scrapingConfig = defaultScrapingConfig
) {
  const {
    followVideos,
    seedProvider,
    independentProvider,
    scrollingBottomForComments,
    seedFixedVideos,
  } = scrapingConfig;

  const isFollowingVideos = !(followVideos == null || followVideos === 0);
  const scrapeComments = !(
    scrollingBottomForComments == null || scrollingBottomForComments === 0
  );

  let step = 0;
  // guess the number of total steps (may get altered later on)
  const approxNumSeedVideos =
    seedProvider.map((x) => x.approxNumVideos).reduce((pv, cv) => pv + cv, 0) +
    seedFixedVideos.length;

  let maxSteps =
    seedProvider.length +
    approxNumSeedVideos * (followVideos + 1) +
    independentProvider.length;

  // 1. block: get seed videos
  let seedVideoIds: string[] = seedFixedVideos;
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
    seedVideoIds = seedVideoIds.concat(
      resultSeedVideos.result.map(({ id }) => id)
    );
  }

  // 2. block: get background information such as history or subscriptions
  for (const fun of independentProvider) {
    const data = await fun(getHtml);
    step += 1;
    yield [step / maxSteps, data];
  }

  // 3. block: get acutal video + video recommendations
  // use lazy loading if comments are required
  const getHtmlVideos = !scrapeComments
    ? getHtml
    : (url: string) =>
        getHtmlLazy(
          url,
          scrollingBottomForComments,
          isNotCommentSpinnerActive,
          isCommentSectionClosed
        );

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
  independentProvider: [],
  seedProvider: [],
};

const simpleConfig = {
  ...defaultConfig,
  title: 'youtube simple config',
  scrapingGenerator: (x1, x2) =>
    scrapingYoutubeProcedure(x1, x2, simpleScrapingConfig),
};

// fast test, all functions only need to run once
const testScrapingConfig = {
  ...defaultScrapingConfig,
  independentProvider: allIndependentProvider.concat([
    scrapePopularVideos,
    scrapeNationalNewsTopStories,
  ]),
  seedProvider: [],
  seedFixedVideos: ['4Y1lZQsyuSQ'],
};

const testConfig = {
  ...defaultConfig,
  title: 'youtube test providers',
  scrapingGenerator: (x1, x2) =>
    scrapingYoutubeProcedure(x1, x2, testScrapingConfig),
};

const allConfig = [defaultConfig, simpleConfig, testConfig];

export { defaultConfig, simpleConfig, testConfig, allConfig };
