import { ProviderMetaInformation } from '../types';
import { profileScraperSlugToFun } from './scrapers';
import {
  ProfileProcedureConfig,
  ProfileScraper,
  SearchProcedureConfig,
  VideoProcedureConfig,
  YtScrapingConfig,
} from './types';

const emptyVideoProcedureConfig: VideoProcedureConfig = {
  type: 'video',
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
      maxVideos: 2,
      slug: 'yt-playlist-page-popular-videos',
    },
    {
      maxVideos: 2,
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

const defaultConfig: YtScrapingConfig = {
  provider: 'youtube',
  version: 1,
  title: 'youtube default: profile, videos, logout',
  slug: 'yt-default',
  steps: [
    defaultProfileScraper,
    defaultVideoExperimentScraper,
    searchStep,
    logOutExperimentConfig,
    searchStep,
  ],
};

const simpleConfig: YtScrapingConfig = {
  ...defaultConfig,
  title: 'youtube simple: videos',
  slug: 'yt-simple',
  steps: [simpleVideoExperimentScaper],
};

const searchConfig: YtScrapingConfig = {
  ...defaultConfig,
  title: 'youtube search: some queries',
  slug: 'yt-search',
  steps: [searchStep],
};

// fast test, all functions only need to run once

const testConfig: YtScrapingConfig = {
  ...defaultConfig,
  title: 'youtube test: test all involved functions once',
  slug: 'yt-test',
  steps: [
    { type: 'action', slug: 'yt-deactivate-watch-history' },
    {
      ...defaultProfileScraper,
    },
    {
      ...defaultVideoExperimentScraper,
      followVideos: 1,
      seedVideosFixed: ['4Y1lZQsyuSQ'],
      seedVideosDynamic: [
        {
          maxVideos: 1,
          slug: 'yt-playlist-page-popular-videos',
        },
      ],
    },
    { type: 'action', slug: 'yt-activate-watch-history' },
  ],
};

const youtubeMeta: ProviderMetaInformation = {
  startUrl: 'https://www.youtube.com',
  loginUrl: 'https://www.youtube.com/account',
  loginCookie: 'LOGIN_INFO',
};

const allConfigs = [defaultConfig, simpleConfig, searchConfig, testConfig];

export {
  defaultConfig,
  simpleConfig,
  testConfig,
  searchConfig,
  allConfigs,
  youtubeMeta,
};
