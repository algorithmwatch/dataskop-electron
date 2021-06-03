import DonationPage from '../pages/DonationPage';
import ExplanationPage from '../pages/ExplanationPage';
import ResultsDetailsPage from '../pages/ResultsDetailsPage';
import ResultsPage from '../pages/ResultsPage';
import AdvancedScrapingPage from '../pages/ScrapingAdvancedPage';
import ScrapingExperimentPage from '../pages/ScrapingExperimentPage';
import ScrapingExplanationPage from '../pages/ScrapingExplanationPage';
import ScrapingProfilePage from '../pages/ScrapingProfilePage';
import ProviderLoginPage from '../pages/ScrapingProviderLoginPage';
import SettingsPage from '../pages/SettingsPage';
import StartPage from '../pages/StartPage';
import VisualizationAdvancedPage from '../pages/VisualizationAdvancedPage';
import VisualizationExperimentsPage from '../pages/VisualizationExperimentsPage';
import VisualizationProfilePage from '../pages/VisualizationProfilePage';
import constants from './constants.json';

// keep constants and route array separate to be able to use constants without circle dependency

interface RouteConfigItem {
  path: string;
  component: () => JSX.Element;
  stepIndex?: number;
  isDarkMode?: boolean;
}

export const routes: RouteConfigItem[] = [
  {
    path: constants.SCRAPING_ADVANCED,
    component: AdvancedScrapingPage,
  },
  {
    path: constants.SCRAPING_PROFILE,
    component: ScrapingProfilePage,
  },
  {
    path: constants.SCRAPING_EXPERIMENT,
    component: ScrapingExperimentPage,
  },
  {
    path: constants.SCRAPING_EXPLANATION,
    component: ScrapingExplanationPage,
  },
  {
    path: constants.RESULTS,
    component: ResultsPage,
  },
  {
    path: constants.RESULTS_DETAILS,
    component: ResultsDetailsPage,
  },
  {
    path: constants.VISUALIZATION_ADVANCED,
    component: VisualizationAdvancedPage,
  },
  {
    path: constants.VISUALIZATION_PROFILE,
    component: VisualizationProfilePage,
  },
  {
    path: constants.VISUALIZATION_EXPERIMENT,
    component: VisualizationExperimentsPage,
  },
  {
    path: constants.DONATION,
    component: DonationPage,
  },
  {
    path: constants.SETTINGS,
    component: SettingsPage,
  },
  {
    path: constants.PROVIDER_LOGIN,
    component: ProviderLoginPage,
    stepIndex: 2,
  },
  {
    path: constants.EXPLANATION,
    component: ExplanationPage,
    stepIndex: 1,
  },
  {
    path: constants.START,
    component: StartPage,
    stepIndex: 0,
  },
];

export const getRouteConfigByPath = (wantedPath: string) =>
  routes.find((r) => r.path === wantedPath);
