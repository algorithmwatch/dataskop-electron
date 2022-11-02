import ProviderLoginPage from "renderer/pages/ProviderLoginPage";
import {
  BeforeLoginPage,
  DonationChoicePage,
  DonationUploadPage,
  ImportDataExportPage,
  IntroductionPage,
  NewsletterPage,
  StartPage,
  ThankYouPage,
  TutorialPage,
  VizOnePage,
  VizThreePage,
  VizTwoPage,
  WaitingDonePage,
  WaitingPage,
} from "../pages";

const tiktokRoutes = [
  { path: "/tiktok/start", comp: StartPage },
  { path: "/tiktok/intro", comp: IntroductionPage },
  { path: "/tiktok/tutorial", comp: TutorialPage },
  { path: "/tiktok/before_login", comp: BeforeLoginPage },
  { path: "/tiktok/import_data_export", comp: ImportDataExportPage },
  { path: "/provider_login", comp: ProviderLoginPage },
  { path: "/provider_login_success", comp: ProviderLoginPage },
  { path: "/tiktok/waiting", comp: WaitingPage },
  { path: "/tiktok/waiting_done", comp: WaitingDonePage },
  { path: "/tiktok/viz_one", comp: VizOnePage },
  { path: "/tiktok/viz_two", comp: VizTwoPage },
  { path: "/tiktok/viz_three", comp: VizThreePage },
  { path: "/tiktok/donation_choice", comp: DonationChoicePage },
  { path: "/tiktok/donation_upload", comp: DonationUploadPage },
  { path: "/tiktok/newsletter", comp: NewsletterPage },
  { path: "/tiktok/thank_you", comp: ThankYouPage },
];

export default tiktokRoutes;
