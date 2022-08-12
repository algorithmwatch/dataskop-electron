import { NavigationState } from 'renderer/contexts/types';

const ytDefaultNav: NavigationState = {
  pageIndex: 0,
  pages: [
    {
      path: '/yt/start',
      sectionKey: null,
    },
    {
      path: '/yt/intro',
      sectionKey: null,
    },
    {
      path: '/yt/onboarding1',
      sectionKey: null,
    },
    {
      path: '/yt/onboarding2',
      sectionKey: null,
    },
    {
      path: '/yt/interface-tutorial',
      sectionKey: '/yt/interface-tutorial',
    },
    {
      path: '/yt/scraping-explanation',
      sectionKey: '/yt/scraping-explanation',
    },
    {
      path: '/yt/visualization/profile',
      sectionKey: '/yt/visualization/profile',
    },
    {
      path: '/yt/research-info',
      sectionKey: '/yt/research-info',
    },
    {
      path: '/yt/visualization/autoplay-chain',
      sectionKey: '/yt/visualization/autoplay-chain',
    },
    {
      path: '/yt/visualization/news',
      sectionKey: '/yt/visualization/news',
    },
    {
      path: '/yt/visualization/search',
      sectionKey: '/yt/visualization/search',
    },
    {
      path: '/yt/my-data',
      sectionKey: '/yt/my-data',
    },
    {
      path: '/yt/questionnaire',
      sectionKey: '/yt/questionnaire',
    },
    {
      path: '/yt/donation1',
      sectionKey: '/yt/donation1',
    },
    {
      path: '/yt/donation2',
      sectionKey: null,
    },
    {
      path: '/yt/donation-success',
      sectionKey: '/yt/donation-success',
    },
  ],
  sections: {
    '/yt/interface-tutorial': { label: 'Die Benutzeroberfläche' },
    '/yt/scraping-explanation': {
      label: 'Wie funktioniert Scraping?',
    },
    '/yt/visualization/profile': { label: 'Mein YouTube-Profil' },
    '/yt/research-info': { label: 'Was wir untersuchen' },
    '/yt/visualization/autoplay-chain': { label: 'AutoPlay Viz' },
    '/yt/visualization/news': { label: 'News Viz' },
    '/yt/visualization/search': { label: 'Search Viz' },
    '/yt/my-data': { label: 'Meine Daten' },
    '/yt/questionnaire': { label: 'Umfrage' },
    '/yt/donation1': { label: 'Die Datenspende' },
    '/yt/donation-success': { label: 'Ende' },
  },
};

const ytEduDemoNav = {
  pageIndex: 0,
  pages: [
    {
      path: '/yt/start',
      sectionKey: null,
    },
    {
      path: '/yt/scraping-explanation',
      sectionKey: '/yt/scraping-explanation',
    },
    {
      path: '/yt/visualization/profile',
      sectionKey: '/yt/visualization/profile',
    },
    {
      path: '/yt/visualization/autoplay-chain',
      sectionKey: '/yt/visualization/autoplay-chain',
    },
    {
      path: '/yt/visualization/news',
      sectionKey: '/yt/visualization/news',
    },
    {
      path: '/yt/visualization/news',
      sectionKey: '/yt/visualization/news',
    },
    {
      path: '/yt/visualization/search',
      sectionKey: '/yt/visualization/search',
    },
  ],
  sections: {
    '/yt/scraping-explanation': {
      label: 'Wie funktioniert Scraping?',
    },
    '/yt/visualization/profile': { label: 'Mein YouTube-Profil' },
    '/yt/visualization/autoplay-chain': { label: 'AutoPlay Viz' },
    '/yt/visualization/news': { label: 'News Viz' },
    '/yt/visualization/search': { label: 'Search Viz' },
    '/yt/visualization/my-data': { label: 'Meine Daten' },
  },
};

const ytNavigation = {
  'yt-default': ytDefaultNav,
  'yt-education-demo': ytEduDemoNav,
};

export { ytNavigation };
