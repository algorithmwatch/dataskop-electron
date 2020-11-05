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

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.SCRAPING} component={ScrapingPage} />
        <Route path={routes.VISUALIZATION} component={VisualizationPage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
