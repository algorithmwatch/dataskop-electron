/* eslint-disable no-await-in-loop */
import React, { useEffect, useRef, useState } from 'react';
import BrowserView from 'react-electron-browser-view';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import routes from '../constants/routes.json';
import { simpleConfig } from '../scrapers/youtube';
import { addData } from '../utils/db';
import Base from './Base';

// the react wrapper is buggy, remove it?
// https://github.com/vantezzen/react-electron-browser-view

// the api
// https://www.electronjs.org/docs/api/web-contents

const youtubeConfig = simpleConfig;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Scraping(): JSX.Element {
  const [scrapingGen, setScrapingGen] = useState<any>(null);
  const [progresFrac, setProgresFrac] = useState(0);
  const [sessionId, setSessionId] = useState<any>(null);

  const [isUserLoggedIn, setUserLoggedIn] = useState(false);
  const [isScrapingStarted, setIsScrapingStarted] = useState(false);
  const [isScrapingPaused, setIsScrapingPaused] = useState(false);
  const [isScrapingFinished, setIsScrapingFinished] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [browserHeight, setBrowserHeight] = useState(500);
  const browser = useRef<any>(null);

  const goToUrl = (url: string) => {
    // can't set custom userAgent with the prop provided by `react-electron-browser-view`
    browser.current.loadURL(url, {
      userAgent: 'Chrome',
    });
  };

  const waitUntilLoggingIn = async () => {
    const webContents = browser?.current.view.webContents;
    const cookies = await webContents.session.cookies.get({});
    // complexity is currently not needed, maybe later?
    const isLoggedIn = cookies.some(
      (x: any) => x.name === youtubeConfig.loginCookie
    );
    setUserLoggedIn(isLoggedIn);
    return isLoggedIn;
  };

  const goToStart = () => {
    goToUrl(youtubeConfig.loginUrl);
  };

  const clearBrowser = () => {
    browser?.current.view.webContents.session.clearStorageData();
    goToStart();
  };

  const getHTML = async (url: string): Promise<string> => {
    console.log(url);
    await goToUrl(url);
    await delay(2000);
    const html = await browser.current.executeJavaScript(
      'document.documentElement.innerHTML'
    );
    return html;
  };

  const getHtmlLazy = async (
    url: string,
    scrollBottom: number,
    loadingDone: (html: string) => boolean
  ): Promise<string> => {
    console.log(url);
    await goToUrl(url);
    await delay(2000);

    //  scroll some large value down
    // eslint-disable-next-line no-restricted-syntax
    for (const x of [...Array(scrollBottom)]) {
      await browser.current.executeJavaScript('window.scrollBy(0, 10000);');
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        await delay(100);
        // eslint-disable-next-line no-await-in-loop
        const html = await browser.current.executeJavaScript(
          'document.documentElement.innerHTML'
        );
        if (loadingDone(html)) break;
      }
    }

    const html = await browser.current.executeJavaScript(
      'document.documentElement.innerHTML'
    );
    return html;
  };

  useEffect(() => {
    const runScraperOnce = async () => {
      if (scrapingGen === null) return;
      if (isScrapingPaused) return;
      // eslint-disable-next-line no-await-in-loop
      const { value, done } = await scrapingGen.next();
      if (value == null) return;
      setProgresFrac(value[0]);
      addData(sessionId, value[1]);
      if (done) setIsScrapingFinished(true);
    };
    runScraperOnce();
  }, [progresFrac, sessionId, isScrapingPaused]); // Only re-run the effect if these change

  const startScraping = async () => {
    setIsScrapingStarted(true);
    const gen = youtubeConfig.scrapingGenerator(getHTML, getHtmlLazy);
    setScrapingGen(gen);
    const sId = uuidv4();
    setSessionId(sId);
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

    goToUrl(youtubeConfig.loginUrl);
  };

  useEffect(() => {
    const updateMutedStatus = async () => {
      const webContents = browser?.current.view.webContents;
      await webContents?.setAudioMuted(isMuted);
    };
    updateMutedStatus();
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
            {' '}
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

      {isScrapingStarted && (
        <progress className="progress" value={progresFrac} max="1">
          {progresFrac}
        </progress>
      )}

      <BrowserView
        ref={browser}
        src="about:blank"
        style={{
          height: browserHeight,
        }}
        onDidAttach={() => {
          setTimeout(goToStart, 100);
        }}
        onUpdateTargetUrl={async () => {
          if (!isUserLoggedIn) {
            await waitUntilLoggingIn();
          }
        }}
      />
    </Base>
  );
}
