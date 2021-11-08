import ResultsDetailsPage from './pages/admin/ResultsDetailsPage';
import ResultsPage from './pages/admin/ResultsPage';
import AdvancedScrapingPage from './pages/admin/ScrapingAdvancedPage';
import ScrapingConfigEditorPage from './pages/admin/ScrapingConfigEditorPage';
import SettingsPage from './pages/admin/SettingsPage';
import VisualizationAdvancedPage from './pages/admin/VisualizationAdvancedPage';
import VisualizationExperimentsPage from './pages/admin/VisualizationExperimentsPage';
import StartPage from './pages/StartPage';

const routes = {
  SCRAPING_ADVANCED: { path: '/scraping/advanced', comp: AdvancedScrapingPage },
  SCRAPING_CONFIG_EDITOR: {
    path: '/scraping/editor',
    comp: ScrapingConfigEditorPage,
  },
  RESULTS_DETAILS: { path: '/results/:sessionId', comp: ResultsDetailsPage },
  RESULTS: { path: '/results', comp: ResultsPage },
  VISUALIZATION_ADVANCED: {
    path: '/visualization/advanced/:sessionId',
    comp: VisualizationAdvancedPage,
  },
  VISUALIZATION_EXPERIMENT: {
    path: '/visualization/experiment',
    comp: VisualizationExperimentsPage,
  },
  SETTINGS: {
    path: '/settings',
    comp: SettingsPage,
  },
  START: {
    path: '/start',
    comp: StartPage,
  },
};

export default routes;
