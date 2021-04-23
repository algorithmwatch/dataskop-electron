/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { scrapingYoutubeProcedure } from './procedures';
import { experimentScrapers, profileScrapers } from './scrapers';

const {
  scrapeNationalNewsTopStories,
  scrapePopularVideos,
} = experimentScrapers;

const defaultProcedureConfig = {
  scrollingBottomForComments: 5,
  followVideos: 2,
  seedVideosFixed: ['4Y1lZQsyuSQ', 'yr1YyrolRZY'],
  seedVideosDynamic: [
    {
      maxVideos: 1,
      getVideos: async (getHtml: GetHtmlFunction) =>
        scrapePopularVideos(getHtml),
    },
    {
      maxVideos: 1,
      getVideos: async (getHtml: GetHtmlFunction) =>
        scrapeNationalNewsTopStories(getHtml),
    },
  ],
  profileScrapers: Object.values(profileScrapers),
};

const createProcedure = (config: ProcedureConfig) => (
  x: GetHtmlFunction,
  y: GetHtmlLazyFunction,
) => scrapingYoutubeProcedure(x, y, config);

const defaultConfig = {
  title: 'youtube default config',
  startUrl: 'https://www.youtube.com',
  loginUrl: 'https://www.youtube.com/account',
  loginCookie: 'LOGIN_INFO',
  procedureConfig: defaultProcedureConfig,
  createProcedure,
};

const simpleConfig = {
  ...defaultConfig,
  title: 'youtube simple config',
  procedureConfig: {
    ...defaultProcedureConfig,
    scrollingBottomForComments: 0,
    profileScrapers: [],
    seedVideosDynamic: [],
  },
};

// fast test, all functions only need to run once

const testConfig = {
  ...defaultConfig,
  title: 'youtube test providers',
  procedureConfig: {
    ...defaultProcedureConfig,
    personalScraper: Object.values(profileScrapers).concat([
      scrapePopularVideos,
      scrapeNationalNewsTopStories,
    ]),
    seedVideosDynamic: [],
    seedVideosFixed: ['4Y1lZQsyuSQ'],
  },
};

const allConfigs = [defaultConfig, simpleConfig, testConfig];

export { defaultConfig, simpleConfig, testConfig, allConfigs };
