import { createProcedureGenerators } from './procedures';
import { experimentScrapers, profileScrapers } from './scrapers';
import {
  GetHtmlFunction,
  ProfileProcedureConfig,
  ScrapingConfig,
  VideoProcedureConfig,
} from './types';

const { scrapeNationalNewsTopStories, scrapePopularVideos } =
  experimentScrapers;

const emptyVideoProcedureConfig: VideoProcedureConfig = {
  type: 'videos',
  scrollingBottomForComments: 0,
  followVideos: 0,
  seedVideosFixed: [],
  seedVideosDynamic: [],
};

const defaultVideoExperimentScraper = {
  ...emptyVideoProcedureConfig,
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
};

const defaultProfileScraper: ProfileProcedureConfig = {
  type: 'profile',
  profileScrapers: Object.values(profileScrapers),
};

const defaultConfig: ScrapingConfig = {
  title: 'youtube default config',
  slug: 'yt-default',
  startUrl: 'https://www.youtube.com',
  loginUrl: 'https://www.youtube.com/account',
  loginCookie: 'LOGIN_INFO',
  steps: [defaultProfileScraper, defaultVideoExperimentScraper],
  createProcedureGenerators,
};

const simpleConfig: ScrapingConfig = {
  ...defaultConfig,
  title: 'youtube simple config',
  slug: 'yt-simple',
  steps: [defaultVideoExperimentScraper],
};

// fast test, all functions only need to run once

const testConfig: ScrapingConfig = {
  ...defaultConfig,
  title: 'youtube test providers',
  slug: 'yt-test',
  steps: [
    {
      ...defaultProfileScraper,
      profileScrapers: Object.values(profileScrapers).concat([
        scrapePopularVideos,
        scrapeNationalNewsTopStories,
      ]),
    },
    {
      ...defaultVideoExperimentScraper,
      seedVideosDynamic: [],
      seedVideosFixed: ['4Y1lZQsyuSQ'],
    },
  ],
};

const allConfigs = [defaultConfig, simpleConfig, testConfig];

export { defaultConfig, simpleConfig, testConfig, allConfigs };
