import { ipcRenderer } from 'electron';
import React, { useEffect } from 'react';

type Action =
  | { type: 'set-version'; version: string }
  | { type: 'set-debug'; isDebug: boolean };
type Dispatch = (action: Action) => void;
type State = {
  version: string;
  isDebug: boolean;
  showAdvancedMenu: boolean;
};
type ConfigProviderProps = { children: React.ReactNode };
// started with this guide: https://kentcdodds.com/blog/how-to-use-react-context-effectively

const ConfigStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
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

  // initial value gets overriden with `useEffect`
  const [state, dispatch] = React.useReducer(configReducer, {
    version: 'loading...',
    isDebug,
    showAdvancedMenu: true,
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

  const value = { state, dispatch };

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
