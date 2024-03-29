/**
 * The app's configuration is crontrolled with various parameters. Most of them
 * are not to be changed by the user. There are stored within a context so the
 * configuration can be adapted while the app is running, e.g., by the backend.
 * However, this is currently not implemented.
 *
 * Started with this guide: https://kentcdodds.com/blog/how-to-use-react-context-effectively
 * @module
 */
import * as Sentry from "@sentry/electron/renderer";
import React, { useEffect } from "react";
import { postEvent } from "renderer/lib/networking";
import { Campaign } from "renderer/providers/types";
import { isNumeric } from "shared/utils/math";

export type UserConfig = {
  htmlLogging: boolean;
  debugLogging: boolean;
  monitoring: boolean;
  monitoringInterval: boolean;
  openAtLogin: boolean;
  scrapingForceOpen: boolean;
  scrapingOpenDevTools: boolean;
};

type Action =
  | {
      type: "set-config";
      version: string;
      isDebug: boolean;
      isDevelopment: boolean;
      showAdvancedMenu: boolean;
      platformUrl: string;
      trackEvents: boolean;
      seriousProtection: string;
      autoSelectCampaign: number | null;
      userConfig: UserConfig;
      isMac: boolean;
      isPlaywrightTesing: boolean;
    }
  | { type: "show-advanced-menu" }
  | { type: "set-debug"; isDebug: boolean }
  | { type: "set-user-config"; newValues: any }
  | { type: "update-check-done" };
type Dispatch = (action: Action) => void;
type State = {
  version: string;
  updateCheckDone: boolean;
  isMac: boolean;
  isPlaywrightTesing: boolean;
  isDebug: boolean;
  isDevelopment: boolean;
  showAdvancedMenu: boolean;
  platformUrl: string | null;
  trackEvents: boolean;
  seriousProtection: string | null;
  autoSelectCampaign: number | null;
  userConfig: null | UserConfig;
};
type ConfigProviderProps = { children: React.ReactNode };

const ConfigStateContext = React.createContext<
  { state: State; dispatch: Dispatch; sendEvent: any } | undefined
>(undefined);

const configReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "set-config": {
      return {
        ...state,
        ...action,
      };
    }

    case "set-debug": {
      return { ...state, isDebug: action.isDebug };
    }

    case "show-advanced-menu": {
      return { ...state, showAdvancedMenu: true };
    }

    case "set-user-config": {
      // sync changes back to disk
      window.electron.ipc.invoke("db-set-config", action.newValues);
      return {
        ...state,
        userConfig: { ...state.userConfig, ...action.newValues },
      };
    }

    case "update-check-done": {
      return {
        ...state,
        updateCheckDone: true,
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
    version: "loading...",
    updateCheckDone: false,
    isMac: false,
    isDebug: false,
    isDevelopment: false,
    showAdvancedMenu: false,
    platformUrl: null,
    trackEvents: false,
    seriousProtection: null,
    autoSelectCampaign: null,
    userConfig: null,
    isPlaywrightTesing: false,
  });

  useEffect(() => {
    (async () => {
      window.electron.ipc.once("update-check-done", () =>
        dispatch({ type: "update-check-done" }),
      );

      const { env, version, isMac } = await window.electron.ipc.invoke(
        "get-info",
      );

      const userConfig = await window.electron.ipc.invoke("db-get-config");

      if (!env) {
        window.electron.log.error("Could not get ENV from main. Aborting.");
        return;
      }

      const isDevelopment = env.NODE_ENV === "development";
      const isDebug = isDevelopment || env.DEBUG_PROD === "true";
      const platformUrl = env.PLATFORM_URL ?? null;
      const trackEvents = !!env.TRACK_EVENTS;
      const seriousProtection = env.SERIOUS_PROTECTION ?? null;
      const autoSelectCampaign = isNumeric(env.AUTO_SELECT_CAMPAIGN)
        ? parseInt(env.AUTO_SELECT_CAMPAIGN, 10)
        : null;
      const showAdvancedMenu = isDebug;

      if (env.SENTRY_DSN) {
        Sentry.init({
          dsn: env.SENTRY_DSN,
        });
      }

      dispatch({
        type: "set-config",
        isDebug,
        isDevelopment,
        version,
        platformUrl,
        trackEvents,
        seriousProtection,
        autoSelectCampaign,
        showAdvancedMenu,
        userConfig,
        isMac,
        isPlaywrightTesing: env.PLAYWRIGHT_TESTING === "true",
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
    throw new Error("useConfig must be used within a ConfigProvider");
  }

  return context;
};

export { ConfigProvider, useConfig };
