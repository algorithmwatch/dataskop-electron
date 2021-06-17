/* eslint-disable no-restricted-syntax */
import { ipcRenderer } from 'electron';
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useConfig, useScraping } from '../../contexts';
import {
  addNewSession,
  addScrapingResult,
  setSessionFinishedAt,
} from '../../db';
import { providerToMeta } from '../../providers';
import { createSingleGenerator } from '../../providers/youtube/procedures/setup';
import { postDummyBackend } from '../../utils/networking';
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
  onLogin = null,
  onDone = null,
  disableInput = false,
  autostart = false,
}: {
  onLogin?: null | (() => void);
  onDone?: null | ((arg0: string) => void);
  disableInput?: boolean;
  autostart?: boolean;
}): JSX.Element {
  const {
    state: { version, isDebug },
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
    },
    dispatch,
  } = useScraping();

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

  const cbSlugNav = 'scraping-navigation-happened';

  const checkLoginCb = async () => {
    const loggedIn = await checkForLogIn();
    if (loggedIn) {
      // successfully logged in
      setNavigationCallback(cbSlugNav, true);
      if (onLogin !== null) onLogin();
    }
  };

  // controls for the scraping

  // start scraping when `isScrapingStarted` was set to true
  useEffect(() => {
    const startScraping = async () => {
      if (isDebug) {
        console.log(scrapingConfig);
      }

      // create a uuid every time you hit start scraping
      const sId = uuidv4();

      const gen = createSingleGenerator(
        scrapingConfig,
        makeGetHtml(logHtml),
        getHtmlLazy,
        sId,
      );

      dispatch({
        type: 'scraping-has-started',
        stepGenerator: gen,
        sessionId: sId,
      });

      await addNewSession(sId, scrapingConfig.slug);
    };

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
          scrapingProgress: { isActive: true, label: '', value: newFrac },
        });

        if (!result.success) {
          console.error('parsing error:');
          console.error(result);
        }

        const postedSuccess = await postDummyBackend(
          result,
          version,
          sessionId,
        );
        if (!postedSuccess) console.error('error posting data to backend');

        if (done) {
          // this is the last step of the session. It's important to wait until
          // data is stored on disk. With async, the last data woud not be stored.
          await addScrapingResult(sessionId, step, result);

          setSessionFinishedAt(sessionId);
          dispatch({ type: 'scraping-has-finished' });
          if (onDone !== null) onDone(sessionId);
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

  useEffect(() => {
    const initScraper = async () => {
      await ipcRenderer.invoke('scraping-init-view', {
        muted: isMuted,
        allowInput: !disableInput,
      });
      await goToStart();

      const loggedIn = await checkForLogIn();

      if (!loggedIn) {
        await setNavigationCallback(cbSlugNav);
        ipcRenderer.on(cbSlugNav, checkLoginCb);
      } else {
        if (onLogin !== null) onLogin();

        if (autostart) {
          dispatch({ type: 'set-scraping-started', isScrapingStarted: true });
        }
      }
    };

    const cleanUpScraper = () => {
      ipcRenderer.removeListener(cbSlugNav, checkLoginCb);
      ipcRenderer.invoke('scraping-remove-view');
    };

    initScraper();
    return cleanUpScraper;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ScrapingBrowser />;
}
