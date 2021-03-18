import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.global.css';
import routes from './constants/routes.json';
import HomePage from './pages/HomePage';
import ResultsDetailsPage from './pages/ResultsDetailsPage';
import ResultsPage from './pages/ResultsPage';
import ScrapingPage from './pages/ScrapingPage';
import VisualizationPage from './pages/VisualizationSessionPage';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path={routes.SCRAPING} component={ScrapingPage} />
        <Route path={routes.RESULTS_DETAILS} component={ResultsDetailsPage} />
        <Route path={routes.RESULTS} component={ResultsPage} />
        <Route
          path={routes.VISUALIZATION_SESSION}
          component={VisualizationPage}
        />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </Router>
  );
}
