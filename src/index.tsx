import * as Sentry from '@sentry/electron';
import React from 'react';
import { render } from 'react-dom';
import App from './App';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}

render(<App />, document.getElementById('root'));
