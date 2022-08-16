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
} from "../pages";
import StartPage from "../pages/StartPage";

const ytRoutes = [
  { path: "/yt/donation-success", comp: DonationSuccessPage },
  { path: "/yt/donation2", comp: DonationPage2 },
  { path: "/yt/donation1", comp: DonationPage1 },
  { path: "/yt/questionnaire", comp: QuestionnairePage },
  { path: "/yt/my-data", comp: MyDataPage },
  {
    path: "/yt/visualization/search",
    comp: VisualizationSearchPage,
  },
  {
    path: "/yt/visualization/news",
    comp: VisualizationNewsPage,
  },
  {
    path: "/yt/visualization/autoplay-chain",
    comp: VisualizationAutoplayChainPage,
  },
  { path: "/yt/research-info", comp: ResearchInfoPage },
  {
    path: "/yt/visualization/profile",
    comp: VisualizationProfilePage,
  },
  {
    path: "/yt/scraping-explanation",
    comp: ScrapingExplanationPage,
  },
  {
    path: "/yt/interface-tutorial",
    comp: InterfaceTutorialPage,
  },
  { path: "/yt/onboarding2", comp: OnboardingPage2 },
  { path: "/yt/onboarding1", comp: OnboardingPage1 },
  { path: "/yt/intro", comp: IntroductionPage },
  { path: "/yt/select-demo", comp: SelectDemoPage },
  { path: "/yt/start", comp: StartPage },
];

export default ytRoutes;
