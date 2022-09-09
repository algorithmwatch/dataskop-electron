/**
 * Control the scraping in the scraping window, based on a JSON-based scraping
 * configuration (loaded remotely).
 *
 * Started with this guide: https://kentcdodds.com/blog/how-to-use-react-context-effectively
 * @module
 */
import _ from "lodash";
import React, { useEffect } from "react";
import { Campaign, DemoData } from "renderer/providers/types";

export type ScrapingProgress = {
  isActive: boolean;
  value: number; // from 0 to 1
  step: number;
};

export type Bounds = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type FilterSteps = (arg0: any) => boolean;

type Action =
  | { type: "set-attached"; attached: boolean; visible: boolean }
  | {
      type: "set-campaign";
      campaign: Campaign | null;
    }
  | {
      type: "set-available-campaigns";
      availableCampaigns: Campaign[];
    }
  | {
      type: "set-scraping-progress-bar";
      scrapingProgress: ScrapingProgress;
    }
  | { type: "set-user-logged-in"; loggedIn: boolean }
  | { type: "start-scraping"; filterSteps?: FilterSteps }
  | { type: "set-scraping-paused"; paused: boolean }
  | { type: "scraping-has-finished" }
  | { type: "set-muted"; muted: boolean }
  | { type: "set-fixed-window"; fixedWindow: boolean }
  | { type: "set-visible-window"; visibleWindow: boolean }
  | { type: "set-bounds"; bounds: Bounds }
  | { type: "set-scraping-error"; scrapingError: Error | null }
  | { type: "set-session-id"; sessionId: string }
  | { type: "reset-scraping" }
  | {
      type: "scraping-has-started";
      sessionId: string | null;
      stepGenerator: AsyncGenerator | null;
    }
  | { type: "set-disable-input"; disableInput: boolean }
  | { type: "set-demo-mode"; demoMode: boolean; demoData: DemoData | null }
  | {
      type: "increment-finished";
    };

type Dispatch = (action: Action) => void;
type State = {
  // if the browser manager is attached
  isAttached: boolean;
  // set to the current selected campaign (fetch from the backend or a local one)
  campaign: Campaign | null;
  availableCampaigns: Campaign[];
  sessionId: string | null;
  scrapingProgress: ScrapingProgress;
  isUserLoggedIn: boolean;
  isScrapingStarted: boolean;
  filterSteps: null | FilterSteps;
  isScrapingPaused: boolean;
  isScrapingFinished: boolean;
  scrapingError: Error | null;
  // create a generation to be able to hold/resumee a scraping proccess
  stepGenerator: AsyncGenerator | null;
  isMuted: boolean;
  fixedWindow: boolean;
  visibleWindow: boolean;
  bounds: Bounds;
  disableInput: boolean;
  demoMode: boolean;
  demoData: DemoData | null;
  startedAt: number | null;
  finishedTasks: number;
};

type ScrapingProviderProps = { children: React.ReactNode };

const ScrapingStateContext = React.createContext<
  { state: State; dispatch: Dispatch; getEtaUntil: any } | undefined
>(undefined);

const initialState: State = {
  isAttached: false,
  campaign: null,
  availableCampaigns: [],
  sessionId: null,
  scrapingProgress: {
    isActive: false,
    value: 0,
    step: 0,
  },
  isUserLoggedIn: false,
  isScrapingStarted: false,
  filterSteps: null,
  isScrapingPaused: false,
  isScrapingFinished: false,
  scrapingError: null,
  stepGenerator: null,
  isMuted: true,
  fixedWindow: false,
  visibleWindow: false,
  bounds: { width: 100, height: 100, x: 100, y: 100 },
  disableInput: false,
  demoMode: false,
  demoData: null,
  startedAt: null,
  finishedTasks: 0,
};

const scrapingReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "set-attached": {
      return {
        ...state,
        isAttached: action.attached,
        visibleWindow: action.visible,
      };
    }

    case "set-campaign": {
      return {
        ...state,
        campaign: action.campaign,
      };
    }

    case "set-available-campaigns": {
      return {
        ...state,
        availableCampaigns: action.availableCampaigns,
      };
    }

    case "set-scraping-progress-bar": {
      return { ...state, scrapingProgress: action.scrapingProgress };
    }

    case "set-user-logged-in": {
      return { ...state, isUserLoggedIn: action.loggedIn };
    }

    case "start-scraping": {
      return {
        ...state,
        isScrapingStarted: true,
        filterSteps: action.filterSteps ? action.filterSteps : null,
      };
    }

    case "set-scraping-paused": {
      return { ...state, isScrapingPaused: action.paused };
    }

    case "set-muted": {
      return { ...state, isMuted: action.muted };
    }

    // Changing this values doesn't work right now. (Guess: The scraping window
    // needs to get refreshed to make it work.)
    case "set-fixed-window": {
      return { ...state, fixedWindow: action.fixedWindow };
    }

    case "set-visible-window": {
      return { ...state, visibleWindow: action.visibleWindow };
    }

    case "set-bounds": {
      return { ...state, bounds: action.bounds };
    }

    case "set-scraping-error": {
      return {
        ...state,
        scrapingError: action.scrapingError,
        isScrapingPaused: true,
      };
    }

    case "scraping-has-started": {
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

    case "scraping-has-finished": {
      return {
        ...state,
        visibleWindow: false,
        isScrapingFinished: true,
        isScrapingPaused: true,
        isScrapingStarted: false,
        filterSteps: null,
        scrapingProgress: {
          isActive: false,
          value: 1,
          step: state.campaign ? state.campaign.config.steps.length - 1 : 0,
        },
      };
    }

    case "set-session-id": {
      return {
        ...state,
        sessionId: action.sessionId,
      };
    }

    // reset everything besides campaign and some other fields
    case "reset-scraping": {
      return {
        ...initialState,
        ..._.pick(state, ["sessionid", "campaign", "isAttached", "bounds"]),
      };
    }

    case "set-disable-input": {
      return { ...state, disableInput: action.disableInput };
    }

    case "set-demo-mode": {
      return { ...state, demoMode: action.demoMode, demoData: action.demoData };
    }

    case "increment-finished": {
      return { ...state, finishedTasks: state.finishedTasks + 1 };
    }

    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
};

const ScrapingProvider = ({ children }: ScrapingProviderProps) => {
  const [state, dispatch] = React.useReducer(scrapingReducer, initialState);

  /**
   * A quick and dirty way to compute an ETA based on the demo data.
   */
  const getEtaUntil = (checkUntilStep = null) => {
    const { startedAt, finishedTasks, demoData } = state;

    if (demoData === null) return null;
    if (startedAt === null) return null;

    const untilIndex = checkUntilStep || demoData.data.results.length - 1;

    const finishedFixed =
      finishedTasks - 1 < demoData.data.results.length
        ? finishedTasks - 1
        : demoData.data.results.length - 1;

    const demoStartedAt = demoData.data.results[0].scrapedAt - 10000; // ~ 10 seconds
    const demoTime = demoData.data.results[finishedFixed].scrapedAt;
    const demoDuration = demoTime - demoStartedAt;
    const demoRemaining =
      demoData.data.results[untilIndex].scrapedAt - demoTime;

    const ourTime = Date.now() - startedAt;

    const etaRemaining = (ourTime / demoDuration) * demoRemaining;

    return etaRemaining;
  };

  const value = { state, dispatch, getEtaUntil };

  // Expose the status of the scraping to the main process to check wheter the
  // can safely be closed.
  useEffect(() => {
    window.electron.ipc.removeAllListeners("close-action");
    window.electron.ipc.on("close-action", () => {
      window.electron.ipc.invoke(
        "close-main-window",
        state.scrapingProgress.isActive,
      );
    });
  }, [state.scrapingProgress.isActive]);

  return (
    <ScrapingStateContext.Provider value={value}>
      {children}
    </ScrapingStateContext.Provider>
  );
};

const useScraping = () => {
  const context = React.useContext(ScrapingStateContext);

  if (context === undefined) {
    throw new Error("useScraping must be used within a ScrapingProvider");
  }

  return context;
};

export { ScrapingProvider, useScraping };
