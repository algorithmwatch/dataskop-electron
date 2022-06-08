import ResultsDetailsPage from './pages/admin/ResultsDetailsPage';
import ResultsPage from './pages/admin/ResultsPage';
import AdvancedScrapingPage from './pages/admin/ScrapingAdvancedPage';
import ScrapingConfigEditorPage from './pages/admin/ScrapingConfigEditorPage';
import SettingsPage from './pages/admin/SettingsPage';
import VisualizationAdvancedPage from './pages/admin/VisualizationAdvancedPage';
import SelectCampaignPage from './pages/SelectCampaignPage';
import StartPage from './pages/StartPage';
import { providerRoutes } from './providers';

const routes = {
  ADMIN_SCRAPING_ADVANCED: {
    path: '/admin/scraping/advanced',
    comp: AdvancedScrapingPage,
  },
  ADMIN_SCRAPING_CONFIG_EDITOR: {
    path: '/admin/scraping/editor',
    comp: ScrapingConfigEditorPage,
  },
  ADMIN_RESULTS_DETAILS: {
    path: '/admin/results/:sessionId',
    comp: ResultsDetailsPage,
  },
  // NB: the order of the details page is important!
  ADMIN_RESULTS: { path: '/admin/results', comp: ResultsPage },
  ADMIN_VISUALIZATION_ADVANCED: {
    path: '/admin/visualization/advanced/:sessionId',
    comp: VisualizationAdvancedPage,
  },
  ADMIN_SETTINGS: {
    path: '/admin/settings',
    comp: SettingsPage,
  },
  START: {
    path: '/start',
    comp: StartPage,
  },
  SELECT_CAMPAIGN: {
    path: '/select_campaign',
    comp: SelectCampaignPage,
  },
};

const allRoutes = Object.values(routes).concat(providerRoutes);

export { allRoutes };
export default routes;
