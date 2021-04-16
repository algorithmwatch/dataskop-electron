import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.global.css';
import UpdateNotification from './components/UpdateNotification';
import routes from './constants/routes.json';
import { ConfigProvider } from './contexts/config';
import ExplanationPage from './pages/ExplanationPage';
import ResultsDetailsPage from './pages/ResultsDetailsPage';
import ResultsPage from './pages/ResultsPage';
import ScrapingPage from './pages/ScrapingAdvancedPage';
import StartPage from './pages/StartPage';
import VisualizationPage from './pages/VisualizationsPage';

export default function App() {
  return (
    <ConfigProvider>
      <UpdateNotification />
      <Router>
        <Switch>
          <Route path={routes.SCRAPING_ADVANCED} component={ScrapingPage} />
          <Route path={routes.RESULTS_DETAILS} component={ResultsDetailsPage} />
          <Route path={routes.RESULTS} component={ResultsPage} />
          <Route
            path={routes.VISUALIZATION_SESSION}
            component={VisualizationPage}
          />
          <Route path={routes.EXPLANATION} component={ExplanationPage} />
          <Route path={routes.START} component={StartPage} />
        </Switch>
      </Router>
    </ConfigProvider>
  );
}
