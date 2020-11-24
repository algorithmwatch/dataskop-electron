/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';

// Lazily load routes and code split with webpack
const LazyScrapingPage = React.lazy(() =>
  import(/* webpackChunkName: "ScrapingPage" */ './containers/ScrapingPage')
);

const ScrapingPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyScrapingPage {...props} />
  </React.Suspense>
);

const LazyVisualizationPage = React.lazy(() =>
  import(
    /* webpackChunkName: "VisualizationPage" */ './containers/VisualizationPage'
  )
);

const VisualizationPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyVisualizationPage {...props} />
  </React.Suspense>
);

const LazyVisualizationDetailsPage = React.lazy(() =>
  import(
    /* webpackChunkName: "VisualizationDetailsPage" */ './containers/VisualizationDetailsPage'
  )
);

const VisualizationDetailsPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyVisualizationDetailsPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.SCRAPING} component={ScrapingPage} />
        <Route
          path={routes.VISUALIZATION_DETAILS}
          component={VisualizationDetailsPage}
        />
        <Route path={routes.VISUALIZATION} component={VisualizationPage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
