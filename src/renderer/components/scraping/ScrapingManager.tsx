/* eslint-disable no-empty-pattern */
/**
 * Manage the whole scraping process: login to account, steping to steps of the
 * scraping process, store data etc.
 *
 * @module
 */
import _, { range } from "lodash";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useConfig, UserConfig, useScraping } from "renderer/contexts";
import { currentDelay } from "renderer/lib/delay";
import { createScrapingGenerator } from "renderer/lib/scraping";
import { providerInfo } from "renderer/providers/info";
import { getStatus } from "renderer/providers/tiktok/lib/status";
import { Campaign } from "renderer/providers/types";
import { delay } from "shared/utils/time";
import { v4 as uuidv4 } from "uuid";
import {
  addNewSession,
  addScrapingResult,
  setSessionFinishedAt,
} from "../../lib/db";
import {
  extractHtml,
  getCookies,
  goToUrl,
  makeGetHtml,
  scrollDown,
  setNavigationCallback,
} from "./ipc";
import ScrapingWindow from "./ScrapingWindow";

const CALLBACK_NAV = "scraping-navigation-happened";

const ScrapingManager = ({
  disableInput = false,
  campaign,
  userConfig,
}: {
  disableInput?: boolean;
  campaign: Campaign;
  userConfig: UserConfig;
}): JSX.Element => {
  const { sendEvent } = useConfig();

  const {
    state: {
      isScrapingPaused,
      isMuted,
      scrapingProgress,
      sessionId,
      isScrapingStarted,
      filterSteps,
      stepGenerator,
      isUserLoggedIn,
      visibleWindow,
    },
    dispatch,
  } = useScraping();

  const history = useHistory();

  const provider = providerInfo[campaign.config.provider];

  const checkForLogIn = async () => {
    const cookies = await getCookies();
    const isLoggedIn = cookies.some(
      (x: any) => x.name === provider.loginCookie,
    );
    dispatch({ type: "set-user-logged-in", loggedIn: isLoggedIn });
    return isLoggedIn;
  };

  const getHtmlLazy = async (
    url: string,
    scrollBottom: number,
    loadingDone: (html: string) => boolean,
    loadingAbort: (html: string) => boolean,
  ): Promise<string> => {
    await goToUrl(url);
    await currentDelay();

    let stopScrolling = false;
    // scroll some large value down
    // to simulate proper scrolling, wait between each time scrolling
    for ({} of range(scrollBottom)) {
      if (stopScrolling) break;
      for ({} of range(5)) {
        await scrollDown();
        await delay(10);
      }

      while (true) {
        const html = await extractHtml();
        // FIXME: not needed to check this every time, find a better way
        if (loadingAbort(html)) {
          stopScrolling = true;
          break;
        }
        if (loadingDone(html)) break;
        else await delay(500);
      }
    }

    const html = await extractHtml();
    return html;
  };

  const resetScraping = async () => {
    dispatch({ type: "reset-scraping" });
    await window.electron.ipc.invoke("scraping-clear-storage");
    return window.electron.ipc.invoke("scraping-remove-view");
  };

  useEffect(() => {
    const checkIfLoggedOut = async () => {
      if (!isUserLoggedIn && isScrapingStarted) {
        const logoutSteps = campaign.config.steps.filter(
          (x) => "doLogout" in x && x.doLogout,
        );
        if (logoutSteps.length === 1) {
          const logoutStepIndex = campaign.config.steps.indexOf(logoutSteps[0]);

          // the step will increment later on, so it's one off
          if (scrapingProgress.step + 1 < logoutStepIndex) {
            sendEvent(campaign, "user was logged out", {
              loggedOutIn: scrapingProgress.step,
              logoutStep: logoutStepIndex,
            });

            await resetScraping();

            dispatch({ type: "user-was-forcefully-logged-out" });

            // go to start after some time
            setTimeout(() => {
              history.push("/");
            }, 2000);
          }
        }
      }
    };
    checkIfLoggedOut();
  }, [isUserLoggedIn]);

  const checkLoginCb = async () => {
    const loggedIn = await checkForLogIn();

    if (loggedIn && provider.disableInputAfterLogin)
      dispatch({ type: "set-disable-input", disableInput: true });

    return loggedIn;
  };

  // start scraping when `isScrapingStarted` was set to true
  useEffect(() => {
    const startScraping = async () => {
      const { config } = campaign;
      // Nasty bug: Don't filter on the orginal config!
      const copyConfig = _.cloneDeep(config);
      if (filterSteps) copyConfig.steps = copyConfig.steps.filter(filterSteps);

      window.electron.log.info("Start data gathering", JSON.stringify(config));

      // create a uuid every time you hit start scraping
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const sessionId = uuidv4();

      // TODO: Make Tiktok agnostic
      const lastStatus = await getStatus();

      const gen = createScrapingGenerator(
        copyConfig,
        provider.deserializeMapping,
        makeGetHtml(userConfig.htmlLogging),
        getHtmlLazy,
        {
          sessionId,
          htmlLogging: userConfig.htmlLogging,
          monitoring: userConfig.monitoring,
          lastStatus,
        },
      );

      dispatch({
        type: "scraping-has-started",
        stepGenerator: gen,
        sessionId,
      });

      await addNewSession(sessionId, campaign);
    };

    if (isScrapingStarted) startScraping();
  }, [isScrapingStarted, filterSteps]);

  // gets triggered when e.g. the progress bar is updated (via `frac`)
  useEffect(() => {
    const runScraperOnce = async () => {
      if (stepGenerator === null) return;
      if (isScrapingPaused) return;

      try {
        const { value, done } = await stepGenerator.next();
        if (value == null || sessionId == null) return;

        const [newFrac, step, result] = value;

        dispatch({
          type: "set-scraping-progress-bar",
          scrapingProgress: { isActive: true, value: newFrac, step },
        });

        if (result === null || !result.success) {
          window.electron.log.info(
            "The data gathering result was marked as unsuccessful. However, we continue.",
            step,
            result,
          );
          sendEvent(campaign, "scraping error", result);
        }

        if (done) {
          // this is the last step of the session. It's important to wait until
          // data is stored on disk. With async, the last data woud not be stored.
          await addScrapingResult(sessionId, step, result);

          setSessionFinishedAt(sessionId);
          dispatch({ type: "scraping-has-finished" });
          window.electron.log.info("Data gathering done");
        } else {
          // Store data w/ async
          addScrapingResult(sessionId, step, result);
        }

        dispatch({ type: "increment-finished" });
      } catch (err) {
        dispatch({ type: "set-scraping-error", scrapingError: err as Error });
        window.electron.log.error(err);
      }
    };
    runScraperOnce();
  }, [scrapingProgress.value, sessionId, isScrapingPaused]);

  // Initialize & clean up

  const initScraper = async (): Promise<void> => {
    window.electron.log.info("Init scraping manager");
    await window.electron.ipc.invoke("scraping-init-view", {
      muted: isMuted,
      allowInput: !disableInput,
      persist: provider.persistScrapingBrowser,
      visibleWindow,
      openDevTools: userConfig.scrapingOpenDevTools,
    });

    await setNavigationCallback(CALLBACK_NAV);
    window.electron.ipc.on(CALLBACK_NAV, checkLoginCb);

    // manually check if a user is logged in to proceed immediately
    if (await checkLoginCb()) {
      return;
    }

    await goToUrl(provider.loginUrl);

    return provider.confirmCookies();
  };

  const cleanUpScraper = () => {
    window.electron.log.info("Clean up scraping manager");
    window.electron.ipc.removeListener(CALLBACK_NAV, checkLoginCb);
    window.electron.ipc.invoke("scraping-remove-view");
  };

  useEffect(() => {
    return cleanUpScraper;
  }, []);

  // I tried hard to make the interactivity changeable but to no avail.
  // You have to set from the component's initialization whether a scraping view
  // is interactive.

  // hotfix to force the scraping browser to reload
  const [forceReload, setForceReload] = useState(0);

  useEffect(() => {
    const reloadScrapingView = async () => {
      await window.electron.ipc.invoke("scraping-remove-view");
      await initScraper();
      setForceReload(forceReload + 1);
    };
    reloadScrapingView();
  }, [disableInput]);

  return <ScrapingWindow forceReload={forceReload} />;
};

export default ScrapingManager;
