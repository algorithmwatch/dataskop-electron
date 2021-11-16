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
} from '../pages';

const ytRoutes = {
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

export default ytRoutes;
