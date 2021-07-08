import _ from 'lodash';
import React from 'react';
import { Campaign, ScrapingConfig } from '../providers/types';
import { defaultConfig } from '../providers/youtube';

export type ScrapingProgress = {
  isActive: boolean;
  value: number; // progres from 0 to 1
  step: number;
};

type Action =
  | { type: 'set-is-attached'; isAttached: boolean }
  | {
      type: 'set-scraping-config';
      scrapingConfig: ScrapingConfig;
      campaign: Campaign | null;
    }
  | {
      type: 'set-scraping-progress-bar';
      scrapingProgress: ScrapingProgress;
    }
  | { type: 'set-user-logged-in'; isUserLoggedIn: boolean }
  | { type: 'set-scraping-started'; isScrapingStarted: boolean }
  | { type: 'set-scraping-paused'; isScrapingPaused: boolean }
  | { type: 'scraping-has-finished' }
  | { type: 'set-muted'; isMuted: boolean }
  | { type: 'set-fixed-window'; fixedWindow: boolean }
  | { type: 'set-visible-window'; visibleWindow: boolean }
  | { type: 'set-bounds'; bounds: boolean }
  | { type: 'set-scraping-error'; scrapingError: Error | null }
  | { type: 'set-session-id'; sessionId: string }
  | { type: 'reset-scraping' }
  | {
      type: 'scraping-has-started';
      sessionId: string | null;
      stepGenerator: AsyncGenerator | null;
    }
  | { type: 'set-log-html'; logHtml: boolean }
  | { type: 'set-disable-input'; disableInput: boolean };

type Dispatch = (action: Action) => void;
type State = {
  // if the browser manager is attached
  isAttached: boolean;
  // the current selected scraping config
  scrapingConfig: ScrapingConfig;
  // set to the campaign (in the backend)
  campaign: Campaign | null;
  sessionId: string | null;
  scrapingProgress: ScrapingProgress;
  isUserLoggedIn: boolean;
  isScrapingStarted: boolean;
  isScrapingPaused: boolean;
  isScrapingFinished: boolean;
  scrapingError: Error | null;
  // create a generation to be able to hold/resumee a scraping proccess
  stepGenerator: AsyncGenerator | null;
  isMuted: boolean;
  fixedWindow: boolean;
  visibleWindow: boolean;
  bounds: { width: number; height: number; x: number; y: number };
  // store scraped HTML in log file (for debugging)
  logHtml: boolean;
  disableInput: boolean;
};

type ScrapingProviderProps = { children: React.ReactNode };
// started with this guide: https://kentcdodds.com/blog/how-to-use-react-context-effectively

const ScrapingStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const initialState = {
  isAttached: false,
  scrapingConfig: defaultConfig,
  campaign: null,
  sessionId: null,
  scrapingProgress: {
    isActive: false,
    value: 0,
    step: 0,
  },
  isUserLoggedIn: false,
  isScrapingStarted: false,
  isScrapingPaused: false,
  isScrapingFinished: false,
  scrapingError: null,
  stepGenerator: null,
  isMuted: true,
  fixedWindow: false,
  visibleWindow: true,
  bounds: { width: 100, height: 100, x: 100, y: 100 },
  logHtml: false,
  disableInput: false,
};

function scrapingReducer(state: State, action: Action) {
  switch (action.type) {
    case 'set-is-attached': {
      return { ...state, isAttached: action.isAttached };
    }

    case 'set-scraping-config': {
      return {
        ...state,
        scrapingConfig: action.scrapingConfig,
        campaign: action.campaign,
      };
    }

    case 'set-scraping-progress-bar': {
      return { ...state, scrapingProgress: action.scrapingProgress };
    }

    case 'set-user-logged-in': {
      return { ...state, isUserLoggedIn: action.isUserLoggedIn };
    }

    case 'set-scraping-started': {
      return {
        ...state,
        isScrapingStarted: action.isScrapingStarted,
      };
    }

    case 'set-scraping-paused': {
      return { ...state, isScrapingPaused: action.isScrapingPaused };
    }

    case 'set-muted': {
      return { ...state, isMuted: action.isMuted };
    }

    case 'set-fixed-window': {
      return { ...state, fixedWindow: action.fixedWindow };
    }

    case 'set-visible-window': {
      return { ...state, visibleWindow: action.visibleWindow };
    }

    case 'set-bounds': {
      return { ...state, bounds: action.bounds };
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
        isScrapingStarted: true,
        isScrapingFinished: false,
        isScrapingPaused: false,
        scrapingProgress: { isActive: true, value: 0, step: 0 },
      };
    }

    case 'scraping-has-finished': {
      return {
        ...state,
        visibleWindow: false,
        isScrapingFinished: true,
        isScrapingPaused: true,
        isScrapingStarted: false,
        scrapingProgress: {
          isActive: false,
          value: 1,
          step: state.scrapingConfig.steps.length - 1,
        },
      };
    }

    case 'set-session-id': {
      return {
        ...state,
        sessionId: action.sessionId,
      };
    }

    // reset everything besides campaign + scraping config
    case 'reset-scraping': {
      return {
        ...initialState,
        ..._.pick(state, ['sessionid', 'campaign', 'isAttached', 'bounds']),
      };
    }

    case 'set-log-html': {
      return { ...state, logHtml: action.logHtml };
    }

    case 'set-disable-input': {
      return { ...state, disableInput: action.disableInput };
    }

    default: {
      throw new Error(`Unhandled action type: ${action}`);
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
