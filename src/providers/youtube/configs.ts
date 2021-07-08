import { ProviderMetaInformation } from '../types';
import {
  ActionProcedureConfig,
  ProfileProcedureConfig,
  SearchProcedureConfig,
  VideoProcedureConfig,
  YtScrapingConfig,
} from './types';

const emptyVideoProcedureConfig: VideoProcedureConfig = {
  type: 'video',
  followVideos: 0,
  seedVideosFixed: [],
  seedVideosDynamic: [],
  seedVideosRepeat: [],
  doLogout: false,
};

const lorenzIds = [
  '4Y1lZQsyuSQ',
  'WWwy4cYRFls',
  '3z0gnXgK8Do',
  'PNjG22Gbo6U',
  'tNc5QEtV3po',
  'F0JWsW6N_uw',
  '1mVyK48rLjg',
  '16u_2GvAJcE',
];

const videoScraperStep = {
  ...emptyVideoProcedureConfig,
  followVideos: 7,
  seedVideosFixed: lorenzIds,
};

const videoScraperNewsStep = {
  ...emptyVideoProcedureConfig,
  seedVideosDynamic: [
    {
      maxVideos: 5,
      slug: 'yt-playlist-page-national-news-top-stories',
    },
  ],
};

const simpleVideoExperimentScaper = {
  ...videoScraperStep,
  followVideos: 0,
};

const logOutVideoScraperStep = {
  ...simpleVideoExperimentScaper,
  doLogout: true,
  seedVideosFixed: [],
  seedVideosDynamic: [],
  seedVideosRepeat: [
    {
      previousResult: 'yt-playlist-page-national-news-top-stories',
      step: null,
    },
  ],
};

const searchStep: SearchProcedureConfig = {
  type: 'search',
  queries: [
    'Baerbock',
    'Laschet',
    'Bundeswehr Afghanistan',
    'Hitzewelle Kanada',
    'Corona Delta',
  ],
};

const profileScraperStep: ProfileProcedureConfig = {
  type: 'profile',
  profileScrapers: [
    'yt-user-watch-history',
    'yt-playlist-page-liked-videos',
    'yt-user-subscribed-channels',
  ],
};

const deactivateWatchHistoryStep: ActionProcedureConfig = {
  type: 'action',
  slug: 'yt-deactivate-watch-history',
};

const activateWatchHistoryStep: ActionProcedureConfig = {
  type: 'action',
  slug: 'yt-activate-watch-history',
};

const defaultConfig: YtScrapingConfig = {
  provider: 'youtube',
  version: 1,
  title: 'youtube default: profile, videos, logout',
  slug: 'yt-default',
  steps: [
    deactivateWatchHistoryStep,
    profileScraperStep,
    videoScraperStep,
    videoScraperNewsStep,
    searchStep,
    activateWatchHistoryStep,
    logOutVideoScraperStep,
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
  title: 'youtube search: simple video, some queries, log out and again',
  slug: 'yt-search',
  steps: [simpleVideoExperimentScaper, searchStep, logOutVideoScraperStep],
};

// fast test, all functions only need to run once

const testConfig: YtScrapingConfig = {
  ...defaultConfig,
  title: 'youtube test: test all involved functions once',
  slug: 'yt-test',
  steps: [
    deactivateWatchHistoryStep,
    profileScraperStep,
    {
      ...videoScraperStep,
      followVideos: 1,
      seedVideosFixed: ['4Y1lZQsyuSQ'],
      seedVideosDynamic: [
        {
          maxVideos: 1,
          slug: 'yt-playlist-page-popular-videos',
        },
      ],
    },
    activateWatchHistoryStep,
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
