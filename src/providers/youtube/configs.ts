/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { scrapingYoutubeProcedure } from './procedures';
import { experimentScrapers, personalScrapers } from './scrapers';

const {
  scrapeNationalNewsTopStories,
  scrapePopularVideos,
} = experimentScrapers;

const defaultProcedureConfig = {
  scrollingBottomForComments: 5,
  followVideos: 1,
  seedFixedVideos: ['4Y1lZQsyuSQ', 'yr1YyrolRZY'],
  seedCreators: [
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
  personalScrapers: Object.values(personalScrapers),
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
  scrapingGenerator: createProcedure(defaultProcedureConfig),
};

const simpleConfig = {
  ...defaultConfig,
  title: 'youtube simple config',
  scrapingGenerator: createProcedure({
    ...defaultProcedureConfig,
    personalScrapers: [],
    seedCreators: [],
  }),
};

// fast test, all functions only need to run once
const testProcedureConfig = {
  ...defaultProcedureConfig,
  personalScraper: Object.values(personalScrapers).concat([
    scrapePopularVideos,
    scrapeNationalNewsTopStories,
  ]),
  seedCreators: [],
  seedFixedVideos: ['4Y1lZQsyuSQ'],
};

const testConfig = {
  ...defaultConfig,
  title: 'youtube test providers',
  scrapingGenerator: createProcedure(testProcedureConfig),
};

const allConfigs = [defaultConfig, simpleConfig, testConfig];

export { defaultConfig, simpleConfig, testConfig, allConfigs };
