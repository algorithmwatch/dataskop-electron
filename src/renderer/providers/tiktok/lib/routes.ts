import ProviderLoginPage from "renderer/pages/ProviderLoginPage";
import UploadDataExportPage from "renderer/providers/tiktok/pages/450UploadDataExportPage";
import {
  BeforeLoginPage,
  IntroductionPage,
  StartPage,
  TutorialPage,
  WaitingPage,
} from "../pages";

const tiktokRoutes = [
  { path: "/tiktok/start", comp: StartPage },
  { path: "/tiktok/intro", comp: IntroductionPage },
  { path: "/tiktok/tutorial", comp: TutorialPage },
  { path: "/tiktok/before_login", comp: BeforeLoginPage },
  { path: "/provider_login", comp: ProviderLoginPage },
  { path: "/provider_login_success", comp: ProviderLoginPage },
  { path: "/tiktok/upload_data_export", comp: UploadDataExportPage },
  { path: "/tiktok/waiting", comp: WaitingPage },
];

export default tiktokRoutes;
