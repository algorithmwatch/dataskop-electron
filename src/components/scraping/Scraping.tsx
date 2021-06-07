/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ScrapingProgressBar, useConfig } from '../../contexts/config';
import { addNewSession, addScrapingResult } from '../../db';
import { postDummyBackend } from '../../utils/networking';
import { splitByWhitespace } from '../../utils/strings';
import { delay } from '../../utils/time';
import Button from '../Button';
import {
  extractHtml,
  getCookies,
  goToUrl,
  makeGetHtml,
  scrollDown,
  setNavigationCallback,
} from './controls';
import ScrapingBrowser from './ScrapingBrowser';

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

  // create a uuid every time you hit start scraping
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [isUserLoggedIn, setUserLoggedIn] = useState(false);
  const [isScrapingStarted, setIsScrapingStarted] = useState(false);
  const [isScrapingPaused, setIsScrapingPaused] = useState(false);
  const [isScrapingFinished, setIsScrapingFinished] = useState(false);
  const [scrapingError, setScrapingError] = useState<Error | null>(null);

  const [isMuted, setIsMuted] = useState(true);

  const {
    state: { version, isDebug, logHtml, scrapingProgress },
    dispatch,
  } = useConfig();

  const setScrapingProgressBar = (options: ScrapingProgressBar) =>
    dispatch({ type: 'set-scraping-progress-bar', scrapingProgress: options });

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
    setScrapingProgressBar({ isActive: false, label: '', value: 0 });

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
  }, [scrapingGen, scrapingProgress.value, sessionId, isScrapingPaused]);

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
          <progress className="progress" value={scrapingProgress.value} max="1">
            {scrapingProgress.value}
          </progress>
        )}
      </div>
    </>
  );
}
