import { ipcRenderer } from 'electron';
import React, { useEffect } from 'react';
import { Campaign } from '../providers/types';
import { postEvent } from '../utils/networking';

type Action =
  | { type: 'set-version'; version: string }
  | { type: 'set-debug'; isDebug: boolean };
type Dispatch = (action: Action) => void;
type State = {
  version: string;
  isDebug: boolean;
  showAdvancedMenu: boolean;
  simpleBackendUrl: string | null;
  platformUrl: string | null;
  trackEvents: boolean;
};
type ConfigProviderProps = { children: React.ReactNode };
// started with this guide: https://kentcdodds.com/blog/how-to-use-react-context-effectively

const ConfigStateContext = React.createContext<
  { state: State; dispatch: Dispatch; sendEvent: any } | undefined
>(undefined);

function configReducer(state: State, action: Action) {
  switch (action.type) {
    case 'set-version': {
      return { ...state, version: action.version };
    }

    case 'set-debug': {
      return { ...state, isDebug: action.isDebug };
    }

    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
}

function ConfigProvider({ children }: ConfigProviderProps) {
  const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

  const simpleBackendUrl = process.env.SIMPLE_BACKEND ?? null;
  const platformUrl = process.env.PLATFORM_URL ?? null;
  const trackEvents = !!process.env.TRACK_EVENTS;

  // initial value gets overriden with `useEffect`
  const [state, dispatch] = React.useReducer(configReducer, {
    version: 'loading...',
    isDebug,
    showAdvancedMenu: true,
    simpleBackendUrl,
    platformUrl,
    trackEvents,
  });

  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context

  useEffect(() => {
    const getVersionNumber = async () => {
      // in devopment, this returns the electron version instead of the app version.
      const version = await ipcRenderer.invoke('get-version-number');
      dispatch({ type: 'set-version', version });
    };
    getVersionNumber();
  }, []);

  function sendEvent(campaign: Campaign | null, message: string, data: any) {
    if (trackEvents && platformUrl !== null) {
      postEvent(
        platformUrl,
        campaign === null ? -1 : campaign.id,
        message,
        data,
      );
    }
  }

  const value = { state, dispatch, sendEvent };

  return (
    <ConfigStateContext.Provider value={value}>
      {children}
    </ConfigStateContext.Provider>
  );
}

function useConfig() {
  const context = React.useContext(ConfigStateContext);

  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }

  return context;
}

export { ConfigProvider, useConfig };
