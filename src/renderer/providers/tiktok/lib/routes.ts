import ProviderLoginPage from "renderer/pages/ProviderLoginPage";
import DonationFormPage from "renderer/providers/tiktok/pages/1100DonationFormPage";
import UploadDataExportPage from "renderer/providers/tiktok/pages/450UploadDataExportPage";
import {
  BeforeLoginPage,
  DonationChoicePage,
  IntroductionPage,
  NewsletterChoicePage,
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
  { path: "/provider_login", comp: ProviderLoginPage },
  { path: "/provider_login_success", comp: ProviderLoginPage },
  { path: "/tiktok/upload_data_export", comp: UploadDataExportPage },
  { path: "/tiktok/waiting", comp: WaitingPage },
  { path: "/tiktok/waiting_done", comp: WaitingDonePage },
  { path: "/tiktok/viz_one", comp: VizOnePage },
  { path: "/tiktok/viz_two", comp: VizTwoPage },
  { path: "/tiktok/viz_three", comp: VizThreePage },
  { path: "/tiktok/donation_choice", comp: DonationChoicePage },
  { path: "/tiktok/donation_form", comp: DonationFormPage },
  { path: "/tiktok/newsletter_choice", comp: NewsletterChoicePage },
  { path: "/tiktok/thank_you", comp: ThankYouPage },
];

export default tiktokRoutes;
