import { Campaign, ProviderInformation } from '../../types';
import { ytNavigation } from './navigation';
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

const btw2021Ids = [
  '4Y1lZQsyuSQ',
  '0WcZ8PwZvGQ',
  'a_NpJU12_LA',
  'kQ_NA1MUbIc',
  '2weZNQ1xmdE',
  '4-vuJeH6TWQ',
];

const videoScraperStep = {
  ...emptyVideoProcedureConfig,
  followVideos: 7,
  seedVideosFixed: btw2021Ids,
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
    'Scholz',
    'Bundestagswahl 2021 wen wählen',
    'Impfpflicht',
    'Benzinpreis',
    'Gendern',
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
  navigation: 'yt-default',
  version: 1,
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

const defaultCampaign: Campaign = {
  id: -1,
  slug: 'yt-default',
  title: 'youtube default: profile, videos, logout',
  description: 'only for development',
  config: defaultConfig,
};

const simpleConfig: YtScrapingConfig = {
  ...defaultConfig,
  steps: [simpleVideoExperimentScaper],
};

const simpleCampaign: Campaign = {
  ...defaultCampaign,
  slug: 'yt-simple',
  title: 'youtube simple: videos',
  config: simpleConfig,
};

const searchConfig: YtScrapingConfig = {
  ...defaultConfig,
  steps: [simpleVideoExperimentScaper, searchStep, logOutVideoScraperStep],
};

const searchCampaign: Campaign = {
  ...defaultCampaign,
  slug: 'yt-search',
  title: 'youtube search: simple video, some queries, log out and again',
  config: searchConfig,
};

// fast test, all functions only need to run once

const testConfig: YtScrapingConfig = {
  ...defaultConfig,
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

const testCampaign: Campaign = {
  ...defaultCampaign,
  slug: 'yt-test',
  title: 'youtube test: test all involved functions once',
  config: testConfig,
};

const youtubeMeta: ProviderInformation = {
  startUrl: 'https://www.youtube.com',
  loginUrl: 'https://www.youtube.com/account',
  loginCookie: 'LOGIN_INFO',
  navigation: ytNavigation,
};

const allCampaigns = [
  defaultCampaign,
  simpleCampaign,
  searchCampaign,
  testCampaign,
];

export {
  defaultCampaign,
  defaultConfig,
  simpleConfig,
  testConfig,
  searchConfig,
  allCampaigns,
  youtubeMeta,
};
