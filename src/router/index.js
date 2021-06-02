import constants from './constants.json';
import StartPage from '../pages/StartPage';
import ExplanationPage from '../pages/ExplanationPage';
// import ScrapingExplanationPage from '../pages/ScrapingExplanationPage';
// import ScrapingProfilePage from './pages/ScrapingProfilePage';
// import ProviderLoginPage from './pages/ScrapingProviderLoginPage';
// import SettingsPage from './pages/SettingsPage';
// import VisualizationAdvancedPage from './pages/VisualizationAdvancedPage';
// import VisualizationExperimentsPage from './pages/VisualizationExperimentsPage';
// import DonationPage from './pages/DonationPage';
// import ResultsDetailsPage from './pages/ResultsDetailsPage';
// import ResultsPage from './pages/ResultsPage';
// import AdvancedScrapingPage from './pages/ScrapingAdvancedPage';
// import VisualizationProfilePage from './pages/VisualizationProfilePage';
// import ScrapingExperimentPage from './pages/ScrapingExperimentPage';

// keep constants and route array separate to be able to use constants without circle dependency

const routes = [
  {
    path: constants.START,
    component: StartPage,
  },
  {
    path: constants.EXPLANATION,
    component: ExplanationPage,
  },
  // {
  //   path: constants.SCRAPING_ADVANCED,
  // },
  // {
  //   path: constants.SCRAPING_PROFILE,
  // },
  // {
  //   path: constants.SCRAPING_EXPERIMENT,
  // },
  // {
  //   path: constants.SCRAPING_EXPLANATION,
  // },
  // {
  //   path: constants.PROVIDER_LOGIN,
  // },
  // {
  //   path: constants.RESULTS,
  // },
  // {
  //   path: constants.RESULTS_DETAILS,
  // },
  // {
  //   path: constants.VISUALIZATION_ADVANCED,
  // },
  // {
  //   path: constants.VISUALIZATION_PROFILE,
  // },
  // {
  //   path: constants.VISUALIZATION_EXPERIMENT,
  // },
  // {
  //   path: constants.DONATION,
  // },
  // {
  //   path: constants.SETTINGS,
  // },
];

export default routes;
