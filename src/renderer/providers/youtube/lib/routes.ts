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
  SelectDemoPage,
  VisualizationAutoplayChainPage,
  VisualizationNewsPage,
  VisualizationProfilePage,
  VisualizationSearchPage,
} from '../pages';
import StartPage from '../pages/StartPage';

const ytRoutes = {
  DONATION_SUCCESS: { path: '/yt/donation-success', comp: DonationSuccessPage },
  DONATION2: { path: '/yt/donation2', comp: DonationPage2 },
  DONATION1: { path: '/yt/donation1', comp: DonationPage1 },
  QUESTIONNAIRE: { path: '/yt/questionnaire', comp: QuestionnairePage },
  MY_DATA: { path: '/yt/my-data', comp: MyDataPage },
  VISUALIZATION_SEARCH: {
    path: '/yt/visualization/search',
    comp: VisualizationSearchPage,
  },
  VISUALIZATION_NEWS: {
    path: '/yt/visualization/news',
    comp: VisualizationNewsPage,
  },
  VISUALIZATION_AUTOPLAYCHAIN: {
    path: '/yt/visualization/autoplay-chain',
    comp: VisualizationAutoplayChainPage,
  },
  RESEARCH_INFO: { path: '/yt/research-info', comp: ResearchInfoPage },
  VISUALIZATION_PROFILE: {
    path: '/yt/visualization/profile',
    comp: VisualizationProfilePage,
  },
  SCRAPING_EXPLANATION: {
    path: '/yt/scraping-explanation',
    comp: ScrapingExplanationPage,
  },
  INTERFACE_TUTORIAL: {
    path: '/yt/interface-tutorial',
    comp: InterfaceTutorialPage,
  },
  ONBOARDING_2: { path: '/yt/onboarding2', comp: OnboardingPage2 },
  ONBOARDING_1: { path: '/yt/onboarding1', comp: OnboardingPage1 },
  INTRODUCTION: { path: '/yt/intro', comp: IntroductionPage },
  SELECT_DEMO: { path: '/yt/select-demo', comp: SelectDemoPage },
  START: { path: '/yt/start', comp: StartPage },
};

export default ytRoutes;
