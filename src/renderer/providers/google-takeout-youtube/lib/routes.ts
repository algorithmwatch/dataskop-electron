import IntroductionPage from "../pages/020IntroductionPage";
import GTYoutubeImportPage from "../pages/030ImportPage";
import GTYoutubeWaitingPage from "../pages/040WaitingPage";
import VizOnePage from "../pages/050VizOnePage";

const tiktokRoutes = [
  { path: "/google-takeout-youtube/intro", comp: IntroductionPage },
  { path: "/google-takeout-youtube/import", comp: GTYoutubeImportPage },
  { path: "/google-takeout-youtube/waiting", comp: GTYoutubeWaitingPage },
  { path: "/google-takeout-youtube/viz_one", comp: VizOnePage },
];

export default tiktokRoutes;
