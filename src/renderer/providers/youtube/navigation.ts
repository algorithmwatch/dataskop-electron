import ytRoutes from './routes';

const navigationConfig = {
  pageIndex: 0,
  pages: [
    {
      // Can't import the route's path from global `routes.ts`. Mabe a circular
      // dependency?
      path: '/start',
      sectionKey: null,
    },
    {
      path: ytRoutes.INTRODUCTION.path,
      sectionKey: null,
    },
    {
      path: ytRoutes.ONBOARDING_1.path,
      sectionKey: null,
    },
    {
      path: ytRoutes.ONBOARDING_2.path,
      sectionKey: null,
    },
    {
      path: ytRoutes.INTERFACE_TUTORIAL.path,
      sectionKey: ytRoutes.INTERFACE_TUTORIAL,
    },
    {
      path: ytRoutes.SCRAPING_EXPLANATION.path,
      sectionKey: ytRoutes.SCRAPING_EXPLANATION,
    },
    {
      path: ytRoutes.VISUALIZATION_PROFILE.path,
      sectionKey: ytRoutes.VISUALIZATION_PROFILE,
    },
    {
      path: ytRoutes.RESEARCH_INFO.path,
      sectionKey: ytRoutes.RESEARCH_INFO,
    },
    {
      path: ytRoutes.VISUALIZATION_AUTOPLAYCHAIN.path,
      sectionKey: ytRoutes.VISUALIZATION_AUTOPLAYCHAIN,
    },
    {
      path: ytRoutes.VISUALIZATION_NEWS.path,
      sectionKey: ytRoutes.VISUALIZATION_NEWS,
    },
    {
      path: ytRoutes.VISUALIZATION_SEARCH.path,
      sectionKey: ytRoutes.VISUALIZATION_SEARCH,
    },
    {
      path: ytRoutes.MY_DATA.path,
      sectionKey: ytRoutes.MY_DATA,
    },
    {
      path: ytRoutes.QUESTIONNAIRE.path,
      sectionKey: ytRoutes.QUESTIONNAIRE,
    },
    {
      path: ytRoutes.DONATION1.path,
      sectionKey: ytRoutes.DONATION1,
    },
    {
      path: ytRoutes.DONATION2.path,
    },
    {
      path: ytRoutes.DONATION_SUCCESS.path,
      sectionKey: ytRoutes.DONATION_SUCCESS,
    },
  ],
  sections: {
    [ytRoutes.INTERFACE_TUTORIAL.path]: { label: 'Die Benutzeroberfläche' },
    [ytRoutes.SCRAPING_EXPLANATION.path]: {
      label: 'Wie funktioniert Scraping?',
    },
    [ytRoutes.VISUALIZATION_PROFILE.path]: { label: 'Mein YouTube-Profil' },
    [ytRoutes.RESEARCH_INFO.path]: { label: 'Was wir untersuchen' },
    [ytRoutes.VISUALIZATION_AUTOPLAYCHAIN.path]: { label: 'AutoPlay Viz' },
    [ytRoutes.VISUALIZATION_NEWS.path]: { label: 'News Viz' },
    [ytRoutes.VISUALIZATION_SEARCH.path]: { label: 'Search Viz' },
    [ytRoutes.MY_DATA.path]: { label: 'Meine Daten' },
    [ytRoutes.QUESTIONNAIRE.path]: { label: 'Umfrage' },
    [ytRoutes.DONATION1.path]: { label: 'Die Datenspende' },
    [ytRoutes.DONATION_SUCCESS.path]: { label: 'Ende' },
  },
};

export default navigationConfig;
