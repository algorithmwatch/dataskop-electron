import ImportPage from "../../../pages/ImportPage";
import WaitingPage from "../../../pages/WaitingPage";
import StartPage from "../pages/010StartPage";
import IntroductionPage from "../pages/020IntroductionPage";
import TutorialPage from "../pages/030TutorialPage";
import BeforeLoginPage from "../pages/040BeforeLoginPage";
import WaitingDonePage from "../pages/060WaitingDonePage";
import VizOnePage from "../pages/070VizOnePage";
import VizTwoPage from "../pages/080VizTwoPage";
import VizThreePage from "../pages/090VizThreePage";
import DonationChoicePage from "../pages/100DonationChoicePage";
import DonationUploadPage from "../pages/110DonationUploadPage";
import NewsletterPage from "../pages/120NewsletterPage";
import ThankYouPage from "../pages/130ThankYouPage";

const tiktokRoutes = [
  { path: "/tiktok/start", comp: StartPage },
  { path: "/tiktok/intro", comp: IntroductionPage },
  { path: "/tiktok/tutorial", comp: TutorialPage },
  { path: "/tiktok/before_login", comp: BeforeLoginPage },
  { path: "/tiktok/import_data_export", comp: ImportPage },
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
