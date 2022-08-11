/**
 * The app's configuration is crontrolled with various parameters. Most of them
 * are not to be changed by the user. There are stored within a context so the
 * configuration can be adapted while the app is running, e.g., by the backend.
 * However, this is currently not implemented.
 *
 * Started with this guide: https://kentcdodds.com/blog/how-to-use-react-context-effectively
 * @module
 */
import * as Sentry from '@sentry/electron/renderer';
import React, { useEffect } from 'react';
import { postEvent } from 'renderer/lib/networking';
import { Campaign } from 'renderer/providers/types';

type Action =
  | {
      type: 'set-config';
      version: string;
      isDebug: boolean;
      showAdvancedMenu: boolean;
      simpleBackendUrl: string;
      platformUrl: string;
      trackEvents: boolean;
      seriousProtection: string;
      userConfig: any;
    }
  | { type: 'show-advanced-menu' }
  | { type: 'set-debug'; isDebug: boolean }
  | { type: 'set-user-config'; newValues: any };
type Dispatch = (action: Action) => void;
type State = {
  version: string;
  isDebug: boolean;
  showAdvancedMenu: boolean;
  simpleBackendUrl: string | null;
  platformUrl: string | null;
  trackEvents: boolean;
  seriousProtection: string | null;
  userConfig: any;
};
type ConfigProviderProps = { children: React.ReactNode };

const ConfigStateContext = React.createContext<
  { state: State; dispatch: Dispatch; sendEvent: any } | undefined
>(undefined);

const configReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set-config': {
      return {
        ...state,
        ...action,
      };
    }

    case 'set-debug': {
      return { ...state, isDebug: action.isDebug };
    }

    case 'show-advanced-menu': {
      return { ...state, showAdvancedMenu: true };
    }

    case 'set-user-config': {
      // sync changes back to disk
      window.electron.ipcRenderer.invoke('db-set-config', action.newValues);
      return {
        ...state,
        userConfig: { ...state.userConfig, ...action.newValues },
      };
    }

    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
};

const ConfigProvider = ({ children }: ConfigProviderProps) => {
  // initial values get overriden with `useEffect` when the component gets mounten
  const [state, dispatch] = React.useReducer(configReducer, {
    version: 'loading...',
    isDebug: false,
    showAdvancedMenu: false,
    simpleBackendUrl: null,
    platformUrl: null,
    trackEvents: false,
    seriousProtection: null,
    userConfig: null,
  });

  useEffect(() => {
    (async () => {
      // in devopment, this returns the electron version instead of the app version.
      const version = await window.electron.ipcRenderer.invoke(
        'get-version-number',
      );

      const userConfig = await window.electron.ipcRenderer.invoke(
        'db-get-config',
      );

      const env = await window.electron.ipcRenderer.invoke('get-env');

      if (!env) {
        window.electron.log.error('Could not get ENV from main. Aborting.');
        return;
      }

      const isDebug =
        env.NODE_ENV === 'development' || env.DEBUG_PROD === 'true';
      const simpleBackendUrl = env.SIMPLE_BACKEND ?? null;
      const platformUrl = env.PLATFORM_URL ?? null;
      const trackEvents = !!env.TRACK_EVENTS;
      const seriousProtection = env.SERIOUS_PROTECTION ?? null;
      const showAdvancedMenu = isDebug;

      if (env.SENTRY_DSN) {
        Sentry.init({
          dsn: env.SENTRY_DSN,
        });
      }

      dispatch({
        type: 'set-config',
        isDebug,
        version,
        simpleBackendUrl,
        platformUrl,
        trackEvents,
        seriousProtection,
        showAdvancedMenu,
        userConfig,
      });
    })();
  }, []);

  // The `message` should be a simple string without any specific information.
  // This information should go into `data` so the events can easily be grouped
  // by `message`.
  const sendEvent = (
    campaign: Campaign | null,
    message: string,
    data: any = {},
  ) => {
    if (state.trackEvents && state.platformUrl !== null) {
      postEvent(
        state.platformUrl,
        state.seriousProtection,
        campaign === null ? -1 : campaign.id,
        message,
        data,
      );
    }
  };

  const value = { state, dispatch, sendEvent };

  return (
    <ConfigStateContext.Provider value={value}>
      {children}
    </ConfigStateContext.Provider>
  );
};

const useConfig = () => {
  const context = React.useContext(ConfigStateContext);

  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }

  return context;
};

export { ConfigProvider, useConfig };
