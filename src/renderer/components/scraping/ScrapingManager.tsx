/**
 * Manage the whole scraping process: login to account, steping to steps of the
 * scraping process, store data etc.
 *
 * @module
 */
/* eslint-disable no-restricted-syntax */
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useConfig, useModal, useScraping } from 'renderer/contexts';
import { createScrapingGenerator } from 'renderer/lib/scraping';
import { postSimpleBackend } from 'renderer/lib/utils/networking';
import { delay } from 'renderer/lib/utils/time';
import { providerInfo } from 'renderer/providers';
import routes from 'renderer/routes';
import { v4 as uuidv4 } from 'uuid';
import {
  addNewSession,
  addScrapingResult,
  setSessionFinishedAt,
} from '../../lib/db';
import {
  extractHtml,
  getCookies,
  goToUrl,
  makeGetHtml,
  scrollDown,
  setNavigationCallback,
} from './ipc';
import ScrapingWindow from './ScrapingWindow';

export default function ScrapingManager({
  disableInput = false,
}: {
  disableInput?: boolean;
}): JSX.Element {
  const {
    state: { version, isDebug, simpleBackendUrl },
    sendEvent,
  } = useConfig();

  const {
    state: {
      isScrapingPaused,
      isMuted,
      logHtml,
      scrapingProgress,
      sessionId,
      isScrapingStarted,
      stepGenerator,
      campaign,
      isUserLoggedIn,
    },
    dispatch,
  } = useScraping();

  const { dispatch: dispatchModal } = useModal();
  const history = useHistory();

  if (campaign === null) return <div></div>;
  const provider = providerInfo[campaign.config.provider];

  const checkForLogIn = async () => {
    const cookies = await getCookies();
    const isLoggedIn = cookies.some(
      (x: any) => x.name === provider.loginCookie,
    );
    dispatch({ type: 'set-user-logged-in', isUserLoggedIn: isLoggedIn });
    return isLoggedIn;
  };

  const goToStart = () => {
    return goToUrl(provider.loginUrl);
  };

  const getHtmlLazy = async (
    url: string,
    scrollBottom: number,
    loadingDone: (html: string) => boolean,
    loadingAbort: (html: string) => boolean,
  ): Promise<string> => {
    console.log(url);
    await goToUrl(url);
    await delay(2000);

    let stopScrolling = false;
    // scroll some large value down
    // to simulate proper scrolling, wait between each time scrolling
    for (const {} of [...Array(scrollBottom)]) {
      if (stopScrolling) break;
      for (const {} of [...Array(5)]) {
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
    dispatch({ type: 'reset-scraping' });
    await goToUrl(provider.loginUrl, {
      clear: true,
    });
    return window.electron.ipcRenderer.invoke('scraping-remove-view');
  };

  const cbSlugNav = 'scraping-navigation-happened';

  useEffect(() => {
    const checkIfLoggedOut = async () => {
      if (!isUserLoggedIn && isScrapingStarted) {
        const logoutSteps = campaign.config.steps.filter(
          (x) => 'doLogout' in x && x.doLogout,
        );
        if (logoutSteps.length === 1) {
          const logoutStepIndex = campaign.config.steps.indexOf(logoutSteps[0]);

          // the step will increment later on, so it's one off
          if (scrapingProgress.step + 1 < logoutStepIndex) {
            sendEvent(campaign, 'user was logged out', {
              loggedOutIn: scrapingProgress.step,
              logoutStep: logoutStepIndex,
            });

            await resetScraping();

            dispatchModal({
              type: 'set-modal-options',
              options: { isOpen: true, componentName: 'logout' },
            });

            // go to start after some time
            setTimeout(() => {
              history.push(routes.START.path);
            }, 2000);
          }
        }
      }
    };
    checkIfLoggedOut();
  }, [isUserLoggedIn]);

  const checkLoginCb = async () => {
    const loggedIn = await checkForLogIn();
    if (loggedIn) dispatch({ type: 'set-disable-input', disableInput: true });
    else provider.confirmCookie();
  };

  // start scraping when `isScrapingStarted` was set to true
  useEffect(() => {
    const startScraping = async () => {
      if (isDebug) {
        console.log(campaign.config);
      }

      // create a uuid every time you hit start scraping
      const sId = uuidv4();

      const gen = createScrapingGenerator(
        campaign.config,
        provider.deserializeConfigMapping,
        makeGetHtml(logHtml),
        getHtmlLazy,
        sId,
        logHtml,
      );

      dispatch({
        type: 'scraping-has-started',
        stepGenerator: gen,
        sessionId: sId,
      });

      await addNewSession(sId, campaign.config, campaign);
    };

    if (isScrapingStarted) startScraping();
  }, [isScrapingStarted]);

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
          type: 'set-scraping-progress-bar',
          scrapingProgress: { isActive: true, value: newFrac, step },
        });

        if (result === null || !result.success) {
          console.info(
            'The scraping result was marked as unsuccessful. However, we continue.',
          );
          console.info(result);
          sendEvent(campaign, 'scraping error', result);
        }

        if (simpleBackendUrl)
          postSimpleBackend(simpleBackendUrl, result, version, sessionId);

        if (done) {
          // this is the last step of the session. It's important to wait until
          // data is stored on disk. With async, the last data woud not be stored.
          await addScrapingResult(sessionId, step, result);

          setSessionFinishedAt(sessionId);
          dispatch({ type: 'scraping-has-finished' });
        } else {
          // Store data w/ async
          addScrapingResult(sessionId, step, result);
        }

        dispatch({ type: 'increment-finished' });
      } catch (err) {
        dispatch({ type: 'set-scraping-error', scrapingError: err as Error });
        console.error(err);
      }
    };
    runScraperOnce();
  }, [scrapingProgress.value, sessionId, isScrapingPaused]);

  // initialize & cleanup

  const initScraper = async () => {
    await window.electron.ipcRenderer.invoke('scraping-init-view', {
      muted: isMuted,
      allowInput: !disableInput,
      persist: provider.persistScrapingBrowser,
    });
    await goToStart();

    await setNavigationCallback(cbSlugNav);
    window.electron.ipcRenderer.on(cbSlugNav, checkLoginCb);

    // manually check if a user is logged in to proceed immediately
    checkLoginCb();
  };

  const cleanUpScraper = () => {
    window.electron.ipcRenderer.removeListener(cbSlugNav, checkLoginCb);
    window.electron.ipcRenderer.invoke('scraping-remove-view');
  };

  useEffect(() => {
    // initScraper();
    return cleanUpScraper;
  }, []);

  // I tried hard to make the interactivity changeable but to no avail.
  // You have to set from the component's initialization whether a scraping view
  // is interactive.

  // hotfix to force the scraping browser to reload
  const [forceReload, setForceReload] = useState(0);

  useEffect(() => {
    const reloadScrapingView = async () => {
      await window.electron.ipcRenderer.invoke('scraping-remove-view');
      await initScraper();
      setForceReload(forceReload + 1);
    };
    reloadScrapingView();
  }, [disableInput]);

  return <ScrapingWindow forceReload={forceReload} />;
}
