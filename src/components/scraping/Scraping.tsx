/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import zlib from 'zlib';
import { useConfig } from '../../contexts/config';
import { addNewSession, addScrapingResult } from '../../db';
import { GetHtmlFunction } from '../../providers/youtube';
import { postDummyBackend } from '../../utils/networking';
import { splitByWhitespace } from '../../utils/strings';
import { delay } from '../../utils/time';
import Button from '../Button';
import ScrapingBrowser from './ScrapingBrowser';

// commands to communicate with the browser window in the main screen

const extractHtml = async () => {
  return ipcRenderer.invoke('scraping-get-current-html');
};

const goToUrl = async (url: string, options = {}): Promise<string> => {
  return ipcRenderer.invoke('scraping-load-url', url, options);
};

const makeGetHtml = (
  logHtml: boolean,
): ((url: string) => Promise<GetHtmlFunction>) => {
  const getHtml = async (url: string): Promise<GetHtmlFunction> => {
    await goToUrl(url);
    if (logHtml) {
      return async () => {
        const html = await extractHtml();

        const compressed = zlib.deflateSync(html).toString('base64');

        log.info(url, compressed);
        return html;
      };
    }
    return extractHtml;
  };
  return getHtml;
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

// the actual scraping window

// I tried hard to make the interactivity changeable but to no avail.
// You have to set from the component's initialization whether a scraping view is interactive.

export default function Scraping({
  scrapingConfig,
  onLogin = null,
  onDone = null,
  hideControls = false,
  disableInput = false,
  fixedWindow = false,
  autostart = false,
}: {
  scrapingConfig: any;
  onLogin?: null | (() => void);
  onDone?: null | ((arg0: string) => void);
  hideControls?: boolean;
  disableInput?: boolean;
  fixedWindow?: boolean;
  autostart?: boolean;
}): JSX.Element {
  // create a generation to be able to hold/resumee a scraping proccess
  const [scrapingGen, setScrapingGen] = useState<Generator | null>(null);

  // store the progres from 0 to 1. See below how a change in `progresFrac` triggers a next scraping step w/ `useEffect`
  const [progresFrac, setProgresFrac] = useState(0);

  // create a uuid every time you hit start scraping
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [isUserLoggedIn, setUserLoggedIn] = useState(false);
  const [isScrapingStarted, setIsScrapingStarted] = useState(false);
  const [isScrapingPaused, setIsScrapingPaused] = useState(false);
  const [isScrapingFinished, setIsScrapingFinished] = useState(false);
  const [scrapingError, setScrapingError] = useState<Error | null>(null);

  const [isMuted, setIsMuted] = useState(true);

  const {
    state: { version, isDebug, logHtml },
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

  const checkLoginCb = async (event, arg) => {
    const loggedIn = await checkForLogIn();
    if (loggedIn) {
      // successfully logged in
      setNavigationCallback(cbSlug, true);
      if (onLogin !== null) onLogin();
    }
  };

  // controls for the scraping

  const startScraping = async () => {
    if (isDebug) {
      console.log(scrapingConfig.procedureConfig);
    }

    if (typeof scrapingConfig.procedureConfig.seedVideosFixed === 'string')
      scrapingConfig.procedureConfig.seedVideosFixed = splitByWhitespace(
        scrapingConfig.procedureConfig.seedVideosFixed,
      );

    setIsScrapingStarted(true);

    const gen = scrapingConfig.createProcedure(scrapingConfig.procedureConfig)(
      makeGetHtml(logHtml),
      getHtmlLazy,
    );
    setScrapingGen(gen);
    const sId = uuidv4();
    setSessionId(sId);
    addNewSession(sId, scrapingConfig.slug);
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

    goToStart();
  };

  // gets triggered when e.g. the progress bar is updated (via `frac`)
  useEffect(() => {
    const runScraperOnce = async () => {
      if (scrapingGen === null) return;
      if (isScrapingPaused) return;

      try {
        const { value, done } = await scrapingGen.next();
        if (value == null || sessionId == null) return;

        const [newFrac, result] = value;

        setProgresFrac(newFrac);
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
          setIsScrapingFinished(true);
          if (onDone !== null) onDone(sessionId);
        }
      } catch (err) {
        setScrapingError(err);
        console.error(err);
        setIsScrapingPaused(true);
      }
    };
    runScraperOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrapingGen, progresFrac, sessionId, isScrapingPaused]);

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

        if (autostart) startScraping();
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

  return (
    <>
      <ScrapingBrowser isMuted={isMuted} fixedWindow={fixedWindow} />
      <div>
        <p style={{ color: 'red' }}>
          {scrapingError !== null &&
            `${scrapingError.name}: ${scrapingError.message}`}
        </p>
        <br />
        <div className={hideControls ? 'invisible' : ''}>
          {isUserLoggedIn && (
            <>
              <Button onClick={resetBrowser}>reset browser</Button>
              <Button onClick={resetScraping}>reset scraping</Button>
              <br />
            </>
          )}
          {!isUserLoggedIn && <p>Please login before continuing.</p>}
          {isUserLoggedIn && !isScrapingStarted && (
            <Button onClick={startScraping}>start scraping</Button>
          )}
          {!isScrapingFinished && isScrapingStarted && !isScrapingPaused && (
            <Button onClick={pauseScraping}>pause scraping</Button>
          )}
          {!isScrapingFinished && isScrapingStarted && isScrapingPaused && (
            <Button onClick={resumeScraping}>resume scraping</Button>
          )}

          <Button onClick={() => setIsMuted(!isMuted)}>
            is {!isMuted && 'not'} muted
          </Button>
        </div>
        {isScrapingStarted && (
          <progress className="progress" value={progresFrac} max="1">
            {progresFrac}
          </progress>
        )}
      </div>
    </>
  );
}
