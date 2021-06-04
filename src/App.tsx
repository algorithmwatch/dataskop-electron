import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import './App.global.css';
import UpdateNotification from './components/UpdateNotification';
import routes from './constants/routes.json';
import { ConfigProvider } from './contexts/config';
import BaseLayout from './layout/Base';
import DonationPage from './pages/DonationPage';
import ExplanationPage from './pages/ExplanationPage';
import ResultsDetailsPage from './pages/ResultsDetailsPage';
import ResultsPage from './pages/ResultsPage';
import AdvancedScrapingPage from './pages/ScrapingAdvancedPage';
import ScrapingConfigEditorPage from './pages/ScrapingConfigEditorPage';
import ScrapingExperimentPage from './pages/ScrapingExperimentPage';
import ScrapingExplanationPage from './pages/ScrapingExplanationPage';
import ScrapingProfilePage from './pages/ScrapingProfilePage';
import ProviderLoginPage from './pages/ScrapingProviderLoginPage';
import SettingsPage from './pages/SettingsPage';
import StartPage from './pages/StartPage';
import VisualizationAdvancedPage from './pages/VisualizationAdvancedPage';
import VisualizationExperimentsPage from './pages/VisualizationExperimentsPage';
import VisualizationProfilePage from './pages/VisualizationProfilePage';

export default function App() {
  return (
    <ConfigProvider>
      <UpdateNotification />
      <Router>
        <BaseLayout>
          <Switch>
            <Route
              path={routes.SCRAPING_ADVANCED}
              component={AdvancedScrapingPage}
            />
            <Route
              path={routes.SCRAPING_CONFIG_EDITOR}
              component={ScrapingConfigEditorPage}
            />
            <Route
              path={routes.SCRAPING_PROFILE}
              component={ScrapingProfilePage}
            />
            <Route
              path={routes.SCRAPING_EXPERIMENT}
              component={ScrapingExperimentPage}
            />
            <Route
              path={routes.SCRAPING_EXPLANATION}
              component={ScrapingExplanationPage}
            />
            <Route path={routes.PROVIDER_LOGIN} component={ProviderLoginPage} />
            <Route path={routes.DONATION} component={DonationPage} />
            <Route
              path={routes.RESULTS_DETAILS}
              component={ResultsDetailsPage}
            />
            <Route path={routes.RESULTS} component={ResultsPage} />
            <Route path={routes.SETTINGS} component={SettingsPage} />
            <Route
              path={routes.VISUALIZATION_ADVANCED}
              component={VisualizationAdvancedPage}
            />
            <Route
              path={routes.VISUALIZATION_EXPERIMENT}
              component={VisualizationExperimentsPage}
            />
            <Route
              path={routes.VISUALIZATION_PROFILE}
              component={VisualizationProfilePage}
            />
            <Route path={routes.EXPLANATION} component={ExplanationPage} />
            <Route path={routes.START} component={StartPage} />

            <Route path="/">
              <Redirect to={routes.START} />
            </Route>
          </Switch>
        </BaseLayout>
      </Router>
    </ConfigProvider>
  );
}
