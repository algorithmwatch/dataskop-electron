import IntroductionPage from "../pages/020IntroductionPage";
import GTYoutubeImportPage from "../pages/030ImportPage";
import GTYoutubeWaitingPage from "../pages/040WaitingPage";
import VizOnePage from "../pages/050VizOnePage";
import VizTwoPage from "../pages/060VizTwoPage";
import OutroPage from "../pages/070OutroPage";

const tiktokRoutes = [
  { path: "/google-takeout-youtube/intro", comp: IntroductionPage },
  { path: "/google-takeout-youtube/import", comp: GTYoutubeImportPage },
  { path: "/google-takeout-youtube/waiting", comp: GTYoutubeWaitingPage },
  { path: "/google-takeout-youtube/viz_one", comp: VizOnePage },
  { path: "/google-takeout-youtube/viz_two", comp: VizTwoPage },
  { path: "/google-takeout-youtube/outro", comp: OutroPage },
];

export default tiktokRoutes;
