import StartPage from "../pages/010StartPage";
import SelectDemoPage from "../pages/011SelectDemoPage";
import IntroductionPage from "../pages/020IntroductionPage";
import OnboardingPage1 from "../pages/030OnboardingPage1";
import OnboardingPage2 from "../pages/040OnboardingPage2";
import InterfaceTutorialPage from "../pages/050InterfaceTutorialPage";
import ScrapingExplanationPage from "../pages/060ScrapingExplanationPage";
import VisualizationProfilePage from "../pages/070VisualizationProfilePage";
import ResearchInfoPage from "../pages/080ResearchInfoPage";
import VisualizationAutoplayChainPage from "../pages/090VisualizationAutoplayChainPage";
import VisualizationNewsPage from "../pages/100VisualizationNewsPage";
import VisualizationSearchPage from "../pages/110VisualizationSearchPage";
import MyDataPage from "../pages/120MyDataPage";
import QuestionnairePage from "../pages/130QuestionnairePage";
import DonationPage1 from "../pages/140DonationPage1";
import DonationPage2 from "../pages/150DonationPage2";
import DonationSuccessPage from "../pages/160DonationSuccessPage";

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
