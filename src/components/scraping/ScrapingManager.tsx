/* eslint-disable no-restricted-syntax */
import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import routes from '../../constants/routes.json';
import { useConfig, useModal, useScraping } from '../../contexts';
import {
  addNewSession,
  addScrapingResult,
  setSessionFinishedAt,
} from '../../db';
import { providerToMeta } from '../../providers';
import { YtScrapingConfig } from '../../providers/youtube';
import { createSingleGenerator } from '../../providers/youtube/procedures/setup';
import { postSimpleBackend } from '../../utils/networking';
import { delay } from '../../utils/time';
import {
  extractHtml,
  getCookies,
  goToUrl,
  makeGetHtml,
  scrollDown,
  setNavigationCallback,
} from './ipc';
import ScrapingBrowser from './ScrapingWindow';

// the actual scraping window

// I tried hard to make the interactivity changeable but to no avail.
// You have to set from the component's initialization whether a scraping view is interactive.

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
      scrapingConfig,
      stepGenerator,
      campaign,
      isUserLoggedIn,
    },
    dispatch,
  } = useScraping();

  const { dispatch: dispatchModal } = useModal();
  const history = useHistory();

  const checkForLogIn = async () => {
    const cookies = await getCookies();
    // complexity is currently not needed, maybe later?
    const isLoggedIn = cookies.some(
      (x: any) =>
        x.name === providerToMeta[scrapingConfig.provider].loginCookie,
    );
    dispatch({ type: 'set-user-logged-in', isUserLoggedIn: isLoggedIn });
    return isLoggedIn;
  };

  const goToStart = () => {
    return goToUrl(providerToMeta[scrapingConfig.provider].loginUrl);
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
    // eslint-disable-next-line no-empty-pattern
    for (const {} of [...Array(scrollBottom)]) {
      if (stopScrolling) break;
      // eslint-disable-next-line no-empty-pattern
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
    await goToUrl(providerToMeta[scrapingConfig.provider].loginUrl, {
      clear: true,
    });
    return ipcRenderer.invoke('scraping-remove-view');
  };

  const cbSlugNav = 'scraping-navigation-happened';

  useEffect(() => {
    const checkIfLoggedOut = async () => {
      if (!isUserLoggedIn && isScrapingStarted) {
        const logoutSteps = scrapingConfig.steps.filter(
          (x) => 'doLogout' in x && x.doLogout,
        );
        if (logoutSteps.length === 1) {
          const logoutStepIndex = scrapingConfig.steps.indexOf(logoutSteps[0]);
          console.log(scrapingProgress.step, logoutStepIndex);
          // the step will increment later on, so it's one off
          if (scrapingProgress.step + 1 < logoutStepIndex) {
            sendEvent(
              campaign,
              `user was logged out in step ${scrapingProgress.step}, the logout step was ${logoutStepIndex}`,
              {},
            );

            await resetScraping();

            dispatchModal({
              type: 'set-modal-options',
              options: { isOpen: true, componentName: 'logout' },
            });

            // go to start after some time
            setTimeout(() => {
              history.push(routes.START);
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
  };

  // start scraping when `isScrapingStarted` was set to true
  useEffect(() => {
    const startScraping = async () => {
      if (isDebug) {
        console.log(scrapingConfig);
      }

      // create a uuid every time you hit start scraping
      const sId = uuidv4();

      const gen = createSingleGenerator(
        scrapingConfig as YtScrapingConfig,
        makeGetHtml(logHtml),
        getHtmlLazy,
        sId,
      );

      dispatch({
        type: 'scraping-has-started',
        stepGenerator: gen,
        sessionId: sId,
      });

      await addNewSession(sId, scrapingConfig, campaign);
    };

    console.log('x', isScrapingStarted);

    if (isScrapingStarted) startScraping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      } catch (err) {
        dispatch({ type: 'set-scraping-error', scrapingError: err });
        console.error(err);
      }
    };
    runScraperOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrapingProgress.value, sessionId, isScrapingPaused]);

  // initialize & cleanup

  const initScraper = async () => {
    await ipcRenderer.invoke('scraping-init-view', {
      muted: isMuted,
      allowInput: !disableInput,
    });
    await goToStart();

    await setNavigationCallback(cbSlugNav);
    ipcRenderer.on(cbSlugNav, checkLoginCb);

    // manually check if a user is logged in to proceed immediately
    checkLoginCb();
  };

  const cleanUpScraper = () => {
    ipcRenderer.removeListener(cbSlugNav, checkLoginCb);
    ipcRenderer.invoke('scraping-remove-view');
  };

  useEffect(() => {
    // initScraper();
    return cleanUpScraper;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // hotfix to force the scraping browser to reload
  const [forceReload, setForceReload] = useState(0);

  useEffect(() => {
    const reloadScrapingView = async () => {
      await ipcRenderer.invoke('scraping-remove-view');
      await initScraper();
      setForceReload(forceReload + 1);
    };
    reloadScrapingView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableInput]);

  return <ScrapingBrowser forceReload={forceReload} />;
}
