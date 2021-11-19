/**
 * The app's configuration is crontrolled with various parameters. Most of them
 * are not to be changed by the user. There are stored within a context so the
 * configuration can be adapted while the app is running, e.g., by the backend.
 * However, this is currently not implemented.
 *
 * @module
 */
import React, { useEffect } from 'react';
import { postEvent } from 'renderer/lib/utils/networking';
import { Campaign } from 'renderer/providers/types';

type Action =
  | { type: 'set-version'; version: string }
  | { type: 'show-advanced-menu' }
  | { type: 'set-debug'; isDebug: boolean };
type Dispatch = (action: Action) => void;
type State = {
  version: string;
  isDebug: boolean;
  showAdvancedMenu: boolean;
  simpleBackendUrl: string | null;
  platformUrl: string | null;
  trackEvents: boolean;
  seriousProtection: string | null;
};
type ConfigProviderProps = { children: React.ReactNode };
// started with this guide: https://kentcdodds.com/blog/how-to-use-react-context-effectively

const ConfigStateContext = React.createContext<
  { state: State; dispatch: Dispatch; sendEvent: any } | undefined
>(undefined);

const configReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set-version': {
      return { ...state, version: action.version };
    }

    case 'set-debug': {
      return { ...state, isDebug: action.isDebug };
    }

    case 'show-advanced-menu': {
      return { ...state, showAdvancedMenu: true };
    }

    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
};

const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const env = JSON.parse(window.electron.procEnv);

  const isDebug = env.NODE_ENV === 'development' || env.DEBUG_PROD === 'true';
  const simpleBackendUrl = env.SIMPLE_BACKEND ?? null;
  const platformUrl = env.PLATFORM_URL ?? null;
  const trackEvents = !!env.TRACK_EVENTS;
  const seriousProtection = env.SERIOUS_PROTECTION ?? null;

  // initial values get overriden with `useEffect` when the component gets mounten
  const [state, dispatch] = React.useReducer(configReducer, {
    version: 'loading...',
    isDebug,
    showAdvancedMenu: isDebug,
    simpleBackendUrl,
    platformUrl,
    trackEvents,
    seriousProtection,
  });

  useEffect(() => {
    const getVersionNumber = async () => {
      // in devopment, this returns the electron version instead of the app version.
      const version = await window.electron.ipcRenderer.invoke(
        'get-version-number',
      );
      dispatch({ type: 'set-version', version });
    };
    getVersionNumber();
  }, []);

  // The `message` should be a simple string without any specific information.
  // This information should go into `data` so the events can easily be grouped
  // by `message`.
  const sendEvent = (
    campaign: Campaign | null,
    message: string,
    data: any = {},
  ) => {
    if (trackEvents && platformUrl !== null) {
      postEvent(
        platformUrl,
        seriousProtection,
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
