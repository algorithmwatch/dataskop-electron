import { profileScraperSlugToFun } from './scrapers';
import {
  ProfileProcedureConfig,
  ProfileScraper,
  ScrapingConfig,
  SearchProcedureConfig,
  VideoProcedureConfig,
} from './types';

const emptyVideoProcedureConfig: VideoProcedureConfig = {
  type: 'videos',
  scrollingBottomForComments: 0,
  followVideos: 0,
  seedVideosFixed: [],
  seedVideosDynamic: [],
  seedVideosRepeat: [],
  doLogout: false,
};

const defaultVideoExperimentScraper = {
  ...emptyVideoProcedureConfig,
  followVideos: 2,
  seedVideosFixed: ['4Y1lZQsyuSQ', 'yr1YyrolRZY'],
  seedVideosDynamic: [
    {
      maxVideos: 0,
      slug: 'yt-playlist-page-popular-videos',
    },
    {
      maxVideos: 5,
      slug: 'yt-playlist-page-national-news-top-stories',
    },
  ],
};

const simpleVideoExperimentScaper = {
  ...defaultVideoExperimentScraper,
  followVideos: 0,
};

const logOutExperimentConfig = {
  ...simpleVideoExperimentScaper,
  doLogout: true,
  seedVideosFixed: [],
  seedVideosDynamic: [],
  seedVideosRepeat: [
    {
      previousResult: 'yt-playlist-page-national-news-top-stories',
      step: 1,
      maxVideos: 5,
    },
  ],
};

const searchStep: SearchProcedureConfig = {
  type: 'search',
  queries: ['antifa', 'berlin'],
};

const defaultProfileScraper: ProfileProcedureConfig = {
  type: 'profile',
  profileScrapers: Object.keys(profileScraperSlugToFun) as ProfileScraper[],
};

const defaultConfig: ScrapingConfig = {
  title: 'youtube default: profile, videos, logout',
  slug: 'yt-default',
  startUrl: 'https://www.youtube.com',
  loginUrl: 'https://www.youtube.com/account',
  loginCookie: 'LOGIN_INFO',
  steps: [
    defaultProfileScraper,
    defaultVideoExperimentScraper,
    searchStep,
    logOutExperimentConfig,
    searchStep,
  ],
};

const simpleConfig: ScrapingConfig = {
  ...defaultConfig,
  title: 'youtube simple: videos',
  slug: 'yt-simple',
  steps: [simpleVideoExperimentScaper],
};

const searchConfig: ScrapingConfig = {
  ...defaultConfig,
  title: 'youtube search: some queries',
  slug: 'yt-search',
  steps: [searchStep],
};

// fast test, all functions only need to run once

const testConfig: ScrapingConfig = {
  ...defaultConfig,
  title: 'youtube test: test all involved functions once',
  slug: 'yt-test',
  steps: [
    {
      ...defaultProfileScraper,
    },
    {
      ...defaultVideoExperimentScraper,
      seedVideosFixed: ['4Y1lZQsyuSQ'],
    },
  ],
};

const allConfigs = [defaultConfig, simpleConfig, searchConfig, testConfig];

export { defaultConfig, simpleConfig, testConfig, searchConfig, allConfigs };
