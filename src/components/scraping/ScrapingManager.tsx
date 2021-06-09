/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { ipcRenderer } from 'electron';
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ScrapingProgressBar, useConfig } from '../../contexts/config';
import { useScraping } from '../../contexts/scraping';
import { addNewSession, addScrapingResult } from '../../db';
import { createSingleGenerator } from '../../providers/youtube/procedures';
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
  fixedWindow = false,
  autostart = false,
}: {
  onLogin?: null | (() => void);
  onDone?: null | ((arg0: string) => void);
  disableInput?: boolean;
  fixedWindow?: boolean;
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

  const setScrapingProgressBar = (options: ScrapingProgressBar) =>
    dispatch({ type: 'set-scraping-progress-bar', scrapingProgress: options });

  const checkForLogIn = async () => {
    const cookies = await getCookies();
    // complexity is currently not needed, maybe later?
    const isLoggedIn = cookies.some(
      (x: any) => x.name === scrapingConfig.loginCookie,
    );
    dispatch({ type: 'set-user-logged-in', isUserLoggedIn: isLoggedIn });
    return isLoggedIn;
  };

  const goToStart = () => {
    return goToUrl(scrapingConfig.loginUrl);
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

  const cbSlug = 'scraping-navigation-happened';

  const checkLoginCb = async () => {
    const loggedIn = await checkForLogIn();
    if (loggedIn) {
      // successfully logged in
      setNavigationCallback(cbSlug, true);
      if (onLogin !== null) onLogin();
    }
  };

  // controls for the scraping

  useEffect(() => {
    const startScraping = async () => {
      if (isDebug) {
        console.log(scrapingConfig);
      }

      const gen = createSingleGenerator(
        scrapingConfig.steps,
        makeGetHtml(logHtml),
        getHtmlLazy,
      );

      dispatch({ type: 'set-step-generator', stepGenerator: gen });

      // create a uuid every time you hit start scraping
      const sId = uuidv4();
      dispatch({ type: 'set-session-id', sessionId: sId });

      addNewSession(sId, scrapingConfig.slug);
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

        const [newFrac, result] = value;

        setScrapingProgressBar({ isActive: true, label: '', value: newFrac });
        addScrapingResult(sessionId, result);

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
          dispatch({ type: 'set-scraping-finished', isScrapingFinished: true });
          setScrapingProgressBar({ isActive: false, label: '', value: 0 });
          if (onDone !== null) onDone(sessionId);
        }
      } catch (err) {
        dispatch({ type: 'set-scraping-error', scrapingError: err });
        console.error(err);
      }
    };
    runScraperOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepGenerator, scrapingProgress.value, sessionId, isScrapingPaused]);

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
        await setNavigationCallback(cbSlug);
        ipcRenderer.on(cbSlug, checkLoginCb);
      } else {
        if (onLogin !== null) onLogin();

        if (autostart) {
          dispatch({ type: 'set-scraping-started', isScrapingStarted: true });
        }
      }
    };

    const cleanUpScraper = () => {
      ipcRenderer.removeListener(cbSlug, checkLoginCb);
      ipcRenderer.invoke('scraping-remove-view');
    };

    initScraper();
    return cleanUpScraper;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ScrapingBrowser isMuted={isMuted} fixedWindow={fixedWindow} />;
}
