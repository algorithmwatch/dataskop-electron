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
  StartPage,
  VisualizationAutoplayChainPage,
  VisualizationNewsPage,
  VisualizationProfilePage,
  VisualizationSearchPage,
} from "../pages";

const ytRoutes = [
  { path: "/youtube/donation-success", comp: DonationSuccessPage },
  { path: "/youtube/donation2", comp: DonationPage2 },
  { path: "/youtube/donation1", comp: DonationPage1 },
  { path: "/youtube/questionnaire", comp: QuestionnairePage },
  { path: "/youtube/my-data", comp: MyDataPage },
  {
    path: "/youtube/visualization/search",
    comp: VisualizationSearchPage,
  },
  {
    path: "/youtube/visualization/news",
    comp: VisualizationNewsPage,
  },
  {
    path: "/youtube/visualization/autoplay-chain",
    comp: VisualizationAutoplayChainPage,
  },
  { path: "/youtube/research-info", comp: ResearchInfoPage },
  {
    path: "/youtube/visualization/profile",
    comp: VisualizationProfilePage,
  },
  {
    path: "/youtube/scraping-explanation",
    comp: ScrapingExplanationPage,
  },
  {
    path: "/youtube/interface-tutorial",
    comp: InterfaceTutorialPage,
  },
  { path: "/youtube/onboarding2", comp: OnboardingPage2 },
  { path: "/youtube/onboarding1", comp: OnboardingPage1 },
  { path: "/youtube/intro", comp: IntroductionPage },
  { path: "/youtube/select-demo", comp: SelectDemoPage },
  { path: "/youtube/start", comp: StartPage },
];

export default ytRoutes;
