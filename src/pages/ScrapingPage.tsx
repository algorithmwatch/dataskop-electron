/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import routes from '../constants/routes.json';
import Base from '../layouts/Base';
import { allConfig as ytConfigs } from '../scrapers/youtube';
import { addData, newSession } from '../utils/db';
import { delay } from '../utils/time';

// commands to communicate with the browser window in the main screen

const goToUrl = async (url: string, options = {}): Promise<string> => {
  return ipcRenderer.invoke('scraping-load-url', url, options);
};

const goToUrlHtml = async (url: string): Promise<string> => {
  return goToUrl(url, { withHtml: true });
};

const getCookies = async (): Promise<Array<unknown>> => {
  return ipcRenderer.invoke('scraping-get-cookies');
};

const setNavigationCallback = async (cbSlug: string, remove = false) => {
  return ipcRenderer.invoke('scraping-navigation-cb', cbSlug, remove);
};

const getHtml = async () => {
  return ipcRenderer.invoke('scraping-get-html');
};

const scrollDown = async () => {
  return ipcRenderer.invoke('scraping-scroll-down');
};

const setMutedStatus = async (isMuted: boolean) => {
  return ipcRenderer.invoke('scraping-set-muted', isMuted);
};

const removeScrapingView = async () => {
  return ipcRenderer.invoke('scraping-remove-view');
};

// the actual scraping window

export default function ScrapingPage(): JSX.Element {
  const [scrapingconfig, setScrapingConfig] = useState<any>(ytConfigs[0]);
  const [scrapingGen, setScrapingGen] = useState<any>(null);
  const [progresFrac, setProgresFrac] = useState(0);
  const [sessionId, setSessionId] = useState<any>(null);

  const [isUserLoggedIn, setUserLoggedIn] = useState(false);
  const [isScrapingStarted, setIsScrapingStarted] = useState(false);
  const [isScrapingPaused, setIsScrapingPaused] = useState(false);
  const [isScrapingFinished, setIsScrapingFinished] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [browserHeight, setBrowserHeight] = useState(500);

  const checkForLogIn = async () => {
    const cookies = await getCookies();
    // complexity is currently not needed, maybe later?
    const isLoggedIn = cookies.some(
      (x: any) => x.name === scrapingconfig.loginCookie
    );
    setUserLoggedIn(isLoggedIn);
    return isLoggedIn;
  };

  const goToStart = () => {
    return goToUrl(scrapingconfig.loginUrl);
  };

  const clearBrowser = () => {
    goToUrl(scrapingconfig.loginUrl, { clear: true });
  };

  const getHtmlLazy = async (
    url: string,
    scrollBottom: number,
    loadingDone: (html: string) => boolean,
    loadingAbort: (html: string) => boolean
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
        const html = await getHtml();
        // FIXME: not needed to check this every time, find a better way
        if (loadingAbort(html)) {
          stopScrolling = true;
          break;
        }
        if (loadingDone(html)) break;
        else await delay(500);
      }
    }

    const html = await getHtml();
    return html;
  };

  const cbSlug = 'scraping-navigation-happened';

  const checkLoginCb = async (event, arg) => {
    const loggedIn = await checkForLogIn();
    if (loggedIn) {
      setNavigationCallback(cbSlug, true);
    }
  };

  const cleanUpScraper = () => {
    ipcRenderer.removeListener(cbSlug, checkLoginCb);
    removeScrapingView();
  };

  const initScraper = async () => {
    cleanUpScraper();
    await goToStart();

    await setNavigationCallback(cbSlug);
    ipcRenderer.on(cbSlug, checkLoginCb);
  };

  const startScraping = async () => {
    setIsScrapingStarted(true);
    const gen = scrapingconfig.scrapingGenerator(goToUrlHtml, getHtmlLazy);
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

    goToUrl(scrapingconfig.loginUrl);
  };

  // gets triggered when e.g. the progress bar is updated (via `frac`)
  useEffect(() => {
    const runScraperOnce = async () => {
      if (scrapingGen === null) return;
      if (isScrapingPaused) return;
      const { value, done } = await scrapingGen.next();
      if (value == null) return;
      setProgresFrac(value[0]);
      addData(sessionId, value[1]);
      if (done) setIsScrapingFinished(true);
    };
    runScraperOnce();
  }, [scrapingGen, progresFrac, sessionId, isScrapingPaused]); // Only re-run the effect if these change

  useEffect(() => {
    // mount
    initScraper();
    return () => {
      // unmount
      cleanUpScraper();
    };
  }, []);

  useEffect(() => {
    setMutedStatus(isMuted);
  }, [isMuted]);

  return (
    <Base>
      <h2 className="title is-2">Scraping</h2>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam fugit
        laboriosam suscipit fuga omnis error asperiores minus! In, ratione
        perferendis sequi libero laborum esse soluta, ut rerum placeat
        consectetur deleniti.
      </p>
      <br />
      <button className="button" type="button" onClick={clearBrowser}>
        reset browser
      </button>
      <button className="button" type="button" onClick={resetScraping}>
        reset scraping
      </button>
      <br />
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
      {isScrapingFinished && (
        <button className="button" type="button">
          <Link
            to={routes.VISUALIZATION_DETAILS.replace(':sessionId', sessionId)}
          >
            go to visualization
          </Link>
        </button>
      )}

      {isMuted && (
        <button
          className="button"
          type="button"
          onClick={() => setIsMuted(false)}
        >
          is muted
        </button>
      )}

      {!isMuted && (
        <button
          className="button"
          type="button"
          onClick={() => setIsMuted(true)}
        >
          is not muted
        </button>
      )}

      <input
        value={browserHeight}
        onChange={(event) => setBrowserHeight(parseInt(event.target.value, 10))}
      />

      <div className="dropdown is-hoverable is-up">
        <div className="dropdown-trigger">
          <button
            type="button"
            className="button"
            aria-haspopup="true"
            aria-controls="dropdown-menu"
          >
            <span>{scrapingconfig.title}</span>
            <span className="icon is-small">
              <i className="fas fa-angle-up" aria-hidden="true" />
            </span>
          </button>
        </div>
        <div className="dropdown-menu" id="dropdown-menu" role="menu">
          <div className="dropdown-content">
            {ytConfigs.map((x) => (
              <button
                key={x.title}
                className="dropdown-item"
                type="button"
                onClick={() => setScrapingConfig(x)}
              >
                {x.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isScrapingStarted && (
        <progress className="progress" value={progresFrac} max="1">
          {progresFrac}
        </progress>
      )}
    </Base>
  );
}
