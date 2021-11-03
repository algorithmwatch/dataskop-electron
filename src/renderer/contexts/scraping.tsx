import _ from 'lodash';
import React from 'react';
import { Campaign, ScrapingConfig } from 'renderer/providers/types';
import demoData from '../constants/demo.json';
import { defaultConfig } from '../providers/youtube';

export type ScrapingProgress = {
  isActive: boolean;
  value: number; // progres from 0 to 1
  step: number;
};

export type Bounds = {
  width: number;
  height: number;
  x: number;
  y: number;
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
  | { type: 'set-bounds'; bounds: Bounds }
  | { type: 'set-scraping-error'; scrapingError: Error | null }
  | { type: 'set-session-id'; sessionId: string }
  | { type: 'reset-scraping' }
  | {
      type: 'scraping-has-started';
      sessionId: string | null;
      stepGenerator: AsyncGenerator | null;
    }
  | { type: 'set-log-html'; logHtml: boolean }
  | { type: 'set-disable-input'; disableInput: boolean }
  | { type: 'set-demo-mode'; demoMode: boolean }
  | {
      type: 'increment-finished';
    };

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
  bounds: Bounds;
  // store scraped HTML in log file (for debugging)
  logHtml: boolean;
  disableInput: boolean;
  demoMode: boolean;
  startedAt: number | null;
  finishedTasks: number;
};

type ScrapingProviderProps = { children: React.ReactNode };
// started with this guide: https://kentcdodds.com/blog/how-to-use-react-context-effectively

const ScrapingStateContext = React.createContext<
  { state: State; dispatch: Dispatch; getEtaUntil: any } | undefined
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
  visibleWindow: false,
  bounds: { width: 100, height: 100, x: 100, y: 100 },
  logHtml: false,
  disableInput: false,
  demoMode: false,
  startedAt: null,
  finishedTasks: 0,
};

function scrapingReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set-is-attached': {
      return {
        ...state,
        isAttached: action.isAttached,
        visibleWindow: action.isAttached,
      };
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
        startedAt: Date.now(),
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

    case 'set-demo-mode': {
      return { ...state, demoMode: action.demoMode };
    }

    case 'increment-finished': {
      return { ...state, finishedTasks: state.finishedTasks + 1 };
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

  const getEtaUntil = (checkUntilStep = null) => {
    const { startedAt, finishedTasks } = state;
    if (startedAt === null) return null;

    const untilIndex = checkUntilStep || demoData.results.length - 1;

    const finishedFixed =
      finishedTasks - 1 < demoData.results.length
        ? finishedTasks - 1
        : demoData.results.length - 1;

    const demoStartedAt = demoData.results[0].scrapedAt - 10000; // ~ 10 seconds
    const demoTime = demoData.results[finishedFixed].scrapedAt;
    const demoDuration = demoTime - demoStartedAt;
    const demoRemaining = demoData.results[untilIndex].scrapedAt - demoTime;

    const ourTime = Date.now() - startedAt;

    const etaRemaining = (ourTime / demoDuration) * demoRemaining;

    return etaRemaining;
  };

  const value = { state, dispatch, getEtaUntil };

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
