import ytRoutes from './routes';

const ytDefaultNav = {
  pageIndex: 0,
  pages: [
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
      sectionKey: ytRoutes.INTERFACE_TUTORIAL.path,
    },
    {
      path: ytRoutes.SCRAPING_EXPLANATION.path,
      sectionKey: ytRoutes.SCRAPING_EXPLANATION.path,
    },
    {
      path: ytRoutes.VISUALIZATION_PROFILE.path,
      sectionKey: ytRoutes.VISUALIZATION_PROFILE.path,
    },
    {
      path: ytRoutes.RESEARCH_INFO.path,
      sectionKey: ytRoutes.RESEARCH_INFO.path,
    },
    {
      path: ytRoutes.VISUALIZATION_AUTOPLAYCHAIN.path,
      sectionKey: ytRoutes.VISUALIZATION_AUTOPLAYCHAIN.path,
    },
    {
      path: ytRoutes.VISUALIZATION_NEWS.path,
      sectionKey: ytRoutes.VISUALIZATION_NEWS.path,
    },
    {
      path: ytRoutes.VISUALIZATION_SEARCH.path,
      sectionKey: ytRoutes.VISUALIZATION_SEARCH.path,
    },
    {
      path: ytRoutes.MY_DATA.path,
      sectionKey: ytRoutes.MY_DATA.path,
    },
    {
      path: ytRoutes.QUESTIONNAIRE.path,
      sectionKey: ytRoutes.QUESTIONNAIRE.path,
    },
    {
      path: ytRoutes.DONATION1.path,
      sectionKey: ytRoutes.DONATION1.path,
    },
    {
      path: ytRoutes.DONATION2.path,
      sectionKey: null,
    },
    {
      path: ytRoutes.DONATION_SUCCESS.path,
      sectionKey: ytRoutes.DONATION_SUCCESS.path,
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

const ytEduDemoNav = {
  pageIndex: 0,
  pages: [
    {
      path: ytRoutes.SELECT_DEMO.path,
      sectionKey: null,
    },
    {
      path: ytRoutes.SCRAPING_EXPLANATION.path,
      sectionKey: ytRoutes.SCRAPING_EXPLANATION.path,
    },
    {
      path: ytRoutes.VISUALIZATION_PROFILE.path,
      sectionKey: ytRoutes.VISUALIZATION_PROFILE.path,
    },
    {
      path: ytRoutes.VISUALIZATION_AUTOPLAYCHAIN.path,
      sectionKey: ytRoutes.VISUALIZATION_AUTOPLAYCHAIN.path,
    },
    {
      path: ytRoutes.VISUALIZATION_NEWS.path,
      sectionKey: ytRoutes.VISUALIZATION_NEWS.path,
    },
    {
      path: ytRoutes.VISUALIZATION_SEARCH.path,
      sectionKey: ytRoutes.VISUALIZATION_SEARCH.path,
    },
    {
      path: ytRoutes.MY_DATA.path,
      sectionKey: ytRoutes.MY_DATA.path,
    },
  ],
  sections: {
    [ytRoutes.SCRAPING_EXPLANATION.path]: {
      label: 'Wie funktioniert Scraping?',
    },
    [ytRoutes.VISUALIZATION_PROFILE.path]: { label: 'Mein YouTube-Profil' },
    [ytRoutes.VISUALIZATION_AUTOPLAYCHAIN.path]: { label: 'AutoPlay Viz' },
    [ytRoutes.VISUALIZATION_NEWS.path]: { label: 'News Viz' },
    [ytRoutes.VISUALIZATION_SEARCH.path]: { label: 'Search Viz' },
    [ytRoutes.MY_DATA.path]: { label: 'Meine Daten' },
  },
};

const ytNavigation = {
  'yt-default': ytDefaultNav,
  'yt-education-demo': ytEduDemoNav,
};

export { ytNavigation };
