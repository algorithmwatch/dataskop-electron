/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useConfig } from '../../contexts/config';
import { addData, newSession } from '../../db';
import { postDummyBackend } from '../../utils/networking';
import { splitByWhitespace } from '../../utils/strings';
import { delay } from '../../utils/time';
import ScrapingBrowser from './ScrapingBrowser';

// commands to communicate with the browser window in the main screen

const getCurrentHtml = async () => {
  return ipcRenderer.invoke('scraping-get-current-html');
};

const goToUrl = async (url: string, options = {}): Promise<string> => {
  return ipcRenderer.invoke('scraping-load-url', url, options);
};

const goToUrlHtml = async (url: string): Promise<GetHtmlFunction> => {
  await goToUrl(url);
  return getCurrentHtml;
};

const getCookies = async (): Promise<Array<unknown>> => {
  return ipcRenderer.invoke('scraping-get-cookies');
};

const setNavigationCallback = async (cbSlug: string, remove = false) => {
  return ipcRenderer.invoke('scraping-navigation-cb', cbSlug, remove);
};

const scrollDown = async () => {
  return ipcRenderer.invoke('scraping-scroll-down');
};

const removeScrapingView = async () => {
  return ipcRenderer.invoke('scraping-remove-view');
};

// the actual scraping window

export default function Scraping({
  scrapingConfig,
  onLogin = null,
  onDone = null,
  hideMute = false,
}): JSX.Element {
  const [scrapingGen, setScrapingGen] = useState<any>(null);
  const [progresFrac, setProgresFrac] = useState(0);
  const [sessionId, setSessionId] = useState<any>(null);

  const [isUserLoggedIn, setUserLoggedIn] = useState(false);
  const [isScrapingStarted, setIsScrapingStarted] = useState(false);
  const [isScrapingPaused, setIsScrapingPaused] = useState(false);
  const [isScrapingFinished, setIsScrapingFinished] = useState(false);
  const [scrapingError, setScrapingError] = useState(null);

  const [isMuted, setIsMuted] = useState(true);

  const {
    state: { version, isDebug },
  } = useConfig();

  const checkForLogIn = async () => {
    const cookies = await getCookies();
    // complexity is currently not needed, maybe later?
    const isLoggedIn = cookies.some(
      (x: any) => x.name === scrapingConfig.loginCookie,
    );
    setUserLoggedIn(isLoggedIn);
    return isLoggedIn;
  };

  const goToStart = () => {
    return goToUrl(scrapingConfig.loginUrl);
  };

  const resetBrowser = () => {
    goToUrl(scrapingConfig.loginUrl, { clear: true });
    setUserLoggedIn(false);
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
    for (const x of [...Array(scrollBottom)]) {
      if (stopScrolling) break;
      for (const x of [...Array(5)]) {
        await scrollDown();
        await delay(10);
      }

      while (true) {
        const html = await getCurrentHtml();
        // FIXME: not needed to check this every time, find a better way
        if (loadingAbort(html)) {
          stopScrolling = true;
          break;
        }
        if (loadingDone(html)) break;
        else await delay(500);
      }
    }

    const html = await getCurrentHtml();
    return html;
  };

  const cbSlug = 'scraping-navigation-happened';

  const checkLoginCb = async (event, arg) => {
    const loggedIn = await checkForLogIn();
    if (loggedIn) {
      // successfully logged in
      setNavigationCallback(cbSlug, true);
      if (onLogin !== null) onLogin();
    }
  };

  const cleanUpScraper = () => {
    ipcRenderer.removeListener(cbSlug, checkLoginCb);
    removeScrapingView();
  };

  const initScraper = async () => {
    cleanUpScraper();
    await goToStart();

    const loggedIn = await checkForLogIn();

    if (!loggedIn) {
      await setNavigationCallback(cbSlug);
      ipcRenderer.on(cbSlug, checkLoginCb);
    } else {
      if (onLogin !== null) onLogin();
    }
  };

  const startScraping = async () => {
    if (isDebug) {
      console.log(scrapingConfig.procedureConfig);
    }

    if (typeof scrapingConfig.procedureConfig.seedFixedVideos === 'string')
      scrapingConfig.procedureConfig.seedFixedVideos = splitByWhitespace(
        scrapingConfig.procedureConfig.seedFixedVideos,
      );

    setIsScrapingStarted(true);

    const gen = scrapingConfig.createProcedure(scrapingConfig.procedureConfig)(
      goToUrlHtml,
      getHtmlLazy,
    );
    setScrapingGen(gen);
    const sId = uuidv4();
    setSessionId(sId);
    newSession(sId);
  };

  const pauseScraping = () => {
    setIsScrapingPaused(true);
  };

  const resumeScraping = () => {
    setIsScrapingPaused(false);
  };

  const resetScraping = () => {
    setScrapingGen(null);
    setSessionId(null);
    setProgresFrac(0);

    setIsScrapingPaused(false);
    setIsScrapingStarted(false);
    setIsScrapingFinished(false);
    setScrapingError(null);

    goToUrl(scrapingConfig.loginUrl);
  };

  // gets triggered when e.g. the progress bar is updated (via `frac`)
  useEffect(() => {
    const runScraperOnce = async () => {
      if (scrapingGen === null) return;
      if (isScrapingPaused) return;

      try {
        const { value, done } = await scrapingGen.next();
        if (value == null) return;

        setProgresFrac(value[0]);
        addData(sessionId, value[1]);

        const postedSuccess = await postDummyBackend(
          value[1],
          version,
          sessionId,
        );
        if (!postedSuccess) console.error('error posting data to backend');

        if (done) {
          setIsScrapingFinished(true);
          if (onDone !== null) onDone(sessionId);
        }
      } catch (err) {
        setScrapingError(err);
        console.error(err);
        console.error(err.message);
        console.error(err.stack);
        setIsScrapingPaused(true);
      }
    };
    runScraperOnce();
  }, [scrapingGen, progresFrac, sessionId, isScrapingPaused]);

  // initialize & cleanup
  useEffect(() => {
    initScraper();
    return () => {
      cleanUpScraper();
    };
  }, []);

  return (
    <>
      <ScrapingBrowser isMuted={isMuted} />
      <p style={{ color: 'red' }}>
        {scrapingError !== null &&
          `${scrapingError.name}: ${scrapingError.message}`}
      </p>
      <br />
      {isUserLoggedIn && (
        <>
          <button className="button" type="button" onClick={resetBrowser}>
            reset browser
          </button>
          <button className="button" type="button" onClick={resetScraping}>
            reset scraping
          </button>
          <br />
        </>
      )}
      {!isUserLoggedIn && <p>Please login before continuing.</p>}
      {isUserLoggedIn && !isScrapingStarted && (
        <button className="button" type="button" onClick={startScraping}>
          start scraping
        </button>
      )}
      {!isScrapingFinished && isScrapingStarted && !isScrapingPaused && (
        <button className="button" type="button" onClick={pauseScraping}>
          pause scraping
        </button>
      )}
      {!isScrapingFinished && isScrapingStarted && isScrapingPaused && (
        <button className="button" type="button" onClick={resumeScraping}>
          resume scraping
        </button>
      )}

      {!hideMute && (
        <button
          className="button"
          type="button"
          onClick={() => setIsMuted(!isMuted)}
        >
          is {!isMuted && 'not'} muted
        </button>
      )}
      {isScrapingStarted && (
        <progress className="progress" value={progresFrac} max="1">
          {progresFrac}
        </progress>
      )}
    </>
  );
}
