import _ from 'lodash';
import React from 'react';
import { defaultConfig, ScrapingConfig } from '../providers/youtube';

export type ScrapingProgressBar = {
  isActive: boolean;
  value: number; // progres from 0 to 1
  label: string;
};

type Action =
  | { type: 'set-is-attached'; isAttached: boolean }
  | { type: 'set-log-html'; logHtml: boolean }
  | { type: 'set-scraping-config'; scrapingConfig: ScrapingConfig }
  | {
      type: 'set-scraping-progress-bar';
      scrapingProgress: ScrapingProgressBar;
    }
  | { type: 'set-user-logged-in'; isUserLoggedIn: boolean }
  | { type: 'set-scraping-started'; isScrapingStarted: boolean }
  | { type: 'set-scraping-paused'; isScrapingPaused: boolean }
  | { type: 'set-scraping-finished'; isScrapingFinished: boolean }
  | { type: 'set-muted'; isMuted: boolean }
  | { type: 'set-scraping-error'; scrapingError: Error | null }
  | { type: 'reset-scraping' }
  | {
      type: 'scraping-has-started';
      sessionId: string | null;
      stepGenerator: AsyncGenerator | null;
    };

type Dispatch = (action: Action) => void;
type State = {
  isAttached: boolean;
  logHtml: boolean;
  scrapingConfig: ScrapingConfig;
  scrapingProgress: ScrapingProgressBar;
  sessionId: string | null;
  isUserLoggedIn: boolean;
  isScrapingStarted: boolean;
  isScrapingPaused: boolean;
  isScrapingFinished: boolean;
  isMuted: boolean;
  scrapingError: Error | null;
  // create a generation to be able to hold/resumee a scraping proccess
  stepGenerator: AsyncGenerator | null;
};

type ScrapingProviderProps = { children: React.ReactNode };
// started with this guide: https://kentcdodds.com/blog/how-to-use-react-context-effectively

const ScrapingStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const initialState = {
  isAttached: false,
  logHtml: false,
  scrapingConfig: defaultConfig,
  scrapingProgress: {
    isActive: false,
    value: 0,
    label: '',
  },
  sessionId: null,
  isUserLoggedIn: false,
  isScrapingStarted: false,
  isScrapingPaused: false,
  isScrapingFinished: false,
  isMuted: true,
  scrapingError: null,
  stepGenerator: null,
};

function scrapingReducer(state: State, action: Action) {
  switch (action.type) {
    case 'set-is-attached': {
      return { ...state, isAttached: action.isAttached };
    }

    case 'set-log-html': {
      return { ...state, logHtml: action.logHtml };
    }

    case 'set-scraping-config': {
      return { ...state, scrapingConfig: action.scrapingConfig };
    }

    case 'set-scraping-progress-bar': {
      return { ...state, scrapingProgress: action.scrapingProgress };
    }

    case 'set-user-logged-in': {
      return { ...state, isUserLoggedIn: action.isUserLoggedIn };
    }

    case 'set-scraping-started': {
      return { ...state, isScrapingStarted: action.isScrapingStarted };
    }

    case 'set-scraping-paused': {
      return { ...state, isScrapingPaused: action.isScrapingPaused };
    }

    case 'set-scraping-finished': {
      return { ...state, isScrapingFinished: action.isScrapingFinished };
    }

    case 'set-muted': {
      return { ...state, isMuted: action.isMuted };
    }

    case 'set-scraping-error': {
      return {
        ...state,
        scrapingError: action.scrapingError,
        isScrapingPaused: true,
      };
    }

    case 'scraping-has-started': {
      return {
        ...state,
        sessionId: action.sessionId,
        stepGenerator: action.stepGenerator,
      };
    }

    // only select state that does not re-render the browser window
    case 'reset-scraping': {
      return {
        ...state,
        ..._.pick(initialState, [
          'sessionid',
          'scrapingProgress',
          'isScrapingStarted',
          'isScrapingPaused',
          'isScrapingFinished',
          'scrapingError',
          'stepGenerator',
        ]),
      };
    }

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function ScrapingProvider({ children }: ScrapingProviderProps) {
  // initial value gets overriden with `useEffect`
  const [state, dispatch] = React.useReducer(scrapingReducer, initialState);

  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context

  const value = { state, dispatch };

  return (
    <ScrapingStateContext.Provider value={value}>
      {children}
    </ScrapingStateContext.Provider>
  );
}

function useScraping() {
  const context = React.useContext(ScrapingStateContext);

  if (context === undefined) {
    throw new Error('useScraping must be used within a ScrapingProvider');
  }

  return context;
}

export { ScrapingProvider, useScraping };
