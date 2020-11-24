import React, { useEffect, useRef, useState } from 'react';
import BrowserView from 'react-electron-browser-view';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import routes from '../constants/routes.json';
import youtubeConfig from '../scrapers/youtube';
import { addData } from '../utils/db';
import Base from './Base';

// the react wrapper is buggy, remove it?
// https://github.com/vantezzen/react-electron-browser-view

// the api
// https://www.electronjs.org/docs/api/web-contents

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export default function Scraping(): JSX.Element {
  const [scrapingGen, setScrapingGen] = useState<any>(null);
  const [progresFrac, setProgresFrac] = useState(0);
  const [scrapingSession, setScrapingSession] = useState<any>(null);

  const [isUserLoggedIn, setUserLoggedIn] = useState(false);
  const [isScrapingStarted, setIsScrapingStarted] = useState(false);
  const [isScrapingPaused, setIsScrapingPaused] = useState(false);
  const [isScrapingFinished, setIsScrapingFinished] = useState(false);

  const browser = useRef<any>(null);

  const waitUntilLoggingIn = async () => {
    const webContents = browser?.current.view.webContents;
    const cookies = await webContents.session.cookies.get({});
    // complexity is currently not needed, maybe later?
    const isLoggedIn = cookies.some(
      (x: any) => x.name === youtubeConfig.logingCookie
    );
    setUserLoggedIn(isLoggedIn);
    return isLoggedIn;
  };

  const goToStart = () => {
    // can't set custom userAgent with a prop
    browser.current.loadURL(youtubeConfig.loginUrl, {
      userAgent: 'Chrome',
    });
  };

  const clearBrowser = () => {
    browser?.current.view.webContents.session.clearStorageData();
    goToStart();
  };

  const getHTML = async (url: string) => {
    console.log(url);
    await browser?.current.loadURL(url, {
      userAgent: 'Chrome',
    });

    await delay(2000);

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
      addData(scrapingSession, value[1]);
      if (done) setIsScrapingFinished(true);
    };
    runScraperOnce();
  }, [progresFrac, scrapingSession, isScrapingPaused]); // Only re-run the effect if these change

  const startScraping = async () => {
    setIsScrapingStarted(true);
    const gen = youtubeConfig.scrapingGenerator(getHTML);
    setScrapingGen(gen);
    const sId = uuidv4();
    setScrapingSession(sId);
  };

  const pauseScraping = () => {
    setIsScrapingPaused(true);
  };

  const resumeScraping = () => {
    setIsScrapingPaused(false);
  };

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
        Reset Browser
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
          <Link to={routes.VISUALIZATION}> go to visualization</Link>
        </button>
      )}

      {isScrapingStarted && (
        <progress className="progress" value={progresFrac} max="1">
          {progresFrac}
        </progress>
      )}

      <BrowserView
        ref={browser}
        src="about:blank"
        style={{
          height: 500,
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
