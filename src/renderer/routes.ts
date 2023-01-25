import ResultsDetailsPage from "./pages/admin/ResultsDetailsPage";
import ResultsPage from "./pages/admin/ResultsPage";
import AdvancedScrapingPage from "./pages/admin/ScrapingAdvancedPage";
import ScrapingConfigEditorPage from "./pages/admin/ScrapingConfigEditorPage";
import SettingsPage from "./pages/admin/SettingsPage";
import VisualizationAdvancedPage from "./pages/admin/VisualizationAdvancedPage";
import ProviderLoginPage from "./pages/ProviderLoginPage";
import ProviderLoginSuccessPage from "./pages/ProviderLoginSuccessPage";
import SelectCampaignPage from "./pages/SelectCampaignPage";
import tiktokRoutes from "./providers/tiktok/lib/routes";
import ytRoutes from "./providers/youtube/lib/routes";

const providerRoutes = ytRoutes.concat(tiktokRoutes);

const routes = [
  {
    path: "/admin/scraping/advanced",
    comp: AdvancedScrapingPage,
  },
  {
    path: "/admin/scraping/editor",
    comp: ScrapingConfigEditorPage,
  },
  {
    path: "/admin/results/:sessionId",
    comp: ResultsDetailsPage,
  },
  // NB: the order of the details page is important!
  { path: "/admin/results", comp: ResultsPage },
  {
    path: "/admin/visualization/advanced/:sessionId",
    comp: VisualizationAdvancedPage,
  },
  {
    path: "/admin/settings",
    comp: SettingsPage,
  },
  {
    path: "/select_campaign/:forceProvider",
    comp: SelectCampaignPage,
  },
  {
    path: "/select_campaign",
    comp: SelectCampaignPage,
  },
  {
    path: "/provider_login",
    comp: ProviderLoginPage,
  },
  {
    path: "/provider_login_success",
    comp: ProviderLoginSuccessPage,
  },
];

const allRoutes = routes.concat(providerRoutes);

export { allRoutes };
export default routes;
