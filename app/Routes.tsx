/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';

// Lazily load routes and code split with webpack
const LazyLoginPage = React.lazy(() =>
  import(/* webpackChunkName: "LoginPage" */ './containers/LoginPage')
);

const LoginPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyLoginPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.LOGIN} component={LoginPage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
}
