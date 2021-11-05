import globalRoutes from 'renderer/constants/routes.json';
import {
  DonationPage1,
  DonationPage2,
  DonationSuccessPage,
  InterfaceTutorialPage,
  IntroductionPage,
  MyDataPage,
  OnboardingPage1,
  OnboardingPage2,
  QuestionnairePage,
  ResearchInfoPage,
  ScrapingExplanationPage,
  VisualizationAutoplayChainPage,
  VisualizationNewsPage,
  VisualizationProfilePage,
  VisualizationSearchPage,
} from './pages';

const routes = {
  DONATION_SUCCESS: { path: '/donation-success', comp: DonationSuccessPage },
  DONATION2: { path: '/donation2', comp: DonationPage2 },
  DONATION1: { path: '/donation1', comp: DonationPage1 },
  QUESTIONNAIRE: { path: '/questionnaire', comp: QuestionnairePage },
  MY_DATA: { path: '/my-data', comp: MyDataPage },
  VISUALIZATION_SEARCH: {
    path: '/visualization/search',
    comp: VisualizationSearchPage,
  },
  VISUALIZATION_NEWS: {
    path: '/visualization/news',
    comp: VisualizationNewsPage,
  },
  VISUALIZATION_AUTOPLAYCHAIN: {
    path: '/visualization/autoplay-chain',
    comp: VisualizationAutoplayChainPage,
  },
  RESEARCH_INFO: { path: '/research-info', comp: ResearchInfoPage },
  VISUALIZATION_PROFILE: {
    path: '/visualization/profile',
    comp: VisualizationProfilePage,
  },
  SCRAPING_EXPLANATION: {
    path: '/scraping-explanation',
    comp: ScrapingExplanationPage,
  },
  INTERFACE_TUTORIAL: {
    path: '/interface-tutorial',
    comp: InterfaceTutorialPage,
  },
  ONBOARDING_2: { path: '/onboarding2', comp: OnboardingPage2 },
  ONBOARDING_1: { path: '/onboarding1', comp: OnboardingPage1 },
  INTRODUCTION: { path: '/intro', comp: IntroductionPage },
};

const navigationConfig = {
  pageIndex: 0,
  pages: [
    {
      path: globalRoutes.START,
      sectionKey: null,
    },
    {
      path: routes.INTRODUCTION.path,
      sectionKey: null,
    },
    {
      path: routes.ONBOARDING_1.path,
      sectionKey: null,
    },
    {
      path: routes.ONBOARDING_2.path,
      sectionKey: null,
    },
    {
      path: routes.INTERFACE_TUTORIAL.path,
      sectionKey: routes.INTERFACE_TUTORIAL,
    },
    {
      path: routes.SCRAPING_EXPLANATION.path,
      sectionKey: routes.SCRAPING_EXPLANATION,
    },
    {
      path: routes.VISUALIZATION_PROFILE.path,
      sectionKey: routes.VISUALIZATION_PROFILE,
    },
    {
      path: routes.RESEARCH_INFO.path,
      sectionKey: routes.RESEARCH_INFO,
    },
    {
      path: routes.VISUALIZATION_AUTOPLAYCHAIN.path,
      sectionKey: routes.VISUALIZATION_AUTOPLAYCHAIN,
    },
    {
      path: routes.VISUALIZATION_NEWS.path,
      sectionKey: routes.VISUALIZATION_NEWS,
    },
    {
      path: routes.VISUALIZATION_SEARCH.path,
      sectionKey: routes.VISUALIZATION_SEARCH,
    },
    {
      path: routes.MY_DATA.path,
      sectionKey: routes.MY_DATA,
    },
    {
      path: routes.QUESTIONNAIRE.path,
      sectionKey: routes.QUESTIONNAIRE,
    },
    {
      path: routes.DONATION1.path,
      sectionKey: routes.DONATION1,
    },
    {
      path: routes.DONATION2.path,
    },
    {
      path: routes.DONATION_SUCCESS.path,
      sectionKey: routes.DONATION_SUCCESS,
    },
  ],
  sections: {
    [routes.INTERFACE_TUTORIAL.path]: { label: 'Die Benutzeroberfläche' },
    [routes.SCRAPING_EXPLANATION.path]: { label: 'Wie funktioniert Scraping?' },
    [routes.VISUALIZATION_PROFILE.path]: { label: 'Mein YouTube-Profil' },
    [routes.RESEARCH_INFO.path]: { label: 'Was wir untersuchen' },
    [routes.VISUALIZATION_AUTOPLAYCHAIN.path]: { label: 'AutoPlay Viz' },
    [routes.VISUALIZATION_NEWS.path]: { label: 'News Viz' },
    [routes.VISUALIZATION_SEARCH.path]: { label: 'Search Viz' },
    [routes.MY_DATA.path]: { label: 'Meine Daten' },
    [routes.QUESTIONNAIRE.path]: { label: 'Umfrage' },
    [routes.DONATION1.path]: { label: 'Die Datenspende' },
    [routes.DONATION_SUCCESS.path]: { label: 'Ende' },
  },
};

export default routes;
export { navigationConfig };
