import { scrapingYoutubeProcedure } from './procedures';
import { experimentScrapers, profileScrapers } from './scrapers';
import {
  GetHtmlFunction,
  GetHtmlLazyFunction,
  ProcedureConfig,
  ScrapingConfig,
} from './types';

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

const defaultConfig: ScrapingConfig = {
  title: 'youtube default config',
  slug: 'yt-default',
  startUrl: 'https://www.youtube.com',
  loginUrl: 'https://www.youtube.com/account',
  loginCookie: 'LOGIN_INFO',
  procedureConfig: defaultProcedureConfig,
  createProcedure,
};

const simpleConfig: ScrapingConfig = {
  ...defaultConfig,
  title: 'youtube simple config',
  slug: 'yt-simple',
  procedureConfig: {
    ...defaultProcedureConfig,
    scrollingBottomForComments: 0,
    profileScrapers: [],
    seedVideosDynamic: [],
  },
};

// fast test, all functions only need to run once

const testConfig: ScrapingConfig = {
  ...defaultConfig,
  title: 'youtube test providers',
  slug: 'yt-test',
  procedureConfig: {
    ...defaultProcedureConfig,
    personalScraper: Object.values(profileScrapers).concat([
      scrapePopularVideos,
      scrapeNationalNewsTopStories,
    ]),
    seedVideosDynamic: [],
    seedVideosFixed: ['4Y1lZQsyuSQ'],
  } as ProcedureConfig,
};

const allConfigs = [defaultConfig, simpleConfig, testConfig];

export { defaultConfig, simpleConfig, testConfig, allConfigs };
