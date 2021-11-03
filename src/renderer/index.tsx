import * as Sentry from '@sentry/electron';
import { render } from 'react-dom';
import App from './App';

// not available when testing w/ jest
if (window.electron) {
  const env = JSON.parse(window.electron.procEnv);
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
    });
  }
}

const eleRoot = document.getElementById('root');
if (eleRoot !== null) render(<App />, eleRoot);
