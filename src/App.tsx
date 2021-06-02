import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.global.css';
import UpdateNotification from './components/UpdateNotification';
import { ConfigProvider } from './contexts/config';
import BaseLayout from './layout/Base';
import routes from './router';

export default function App() {
  return (
    <ConfigProvider>
      <UpdateNotification />
      <Router>
        <BaseLayout>
          <Switch>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                component={route.component}
              />
            ))}
          </Switch>
        </BaseLayout>
      </Router>
    </ConfigProvider>
  );
}
