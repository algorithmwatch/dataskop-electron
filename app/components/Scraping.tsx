import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import BrowserView from 'react-electron-browser-view';
import routes from '../constants/routes.json';
// import styles from './Home.css';

import Base from './Base';

// eslint-disable-next-line @typescript-eslint/ban-types
async function* scrapingGenerator(getHTML: Function) {
  let progress = 0;
  const max = 5;

  while (progress < max) {
    // eslint-disable-next-line no-await-in-loop
    const html = await getHTML('https://youtube.com');
    progress += 1;
    yield [progress, max];
  }
  return [progress, max];
}

const scrapingConfigYoutube = {
  loginUrl: 'https://www.youtube.com/account',
  logingCookie: 'LOGIN_INFO',
  scrapingGenerator,
};

// the react wrapper is buggy, remove it?
// https://github.com/vantezzen/react-electron-browser-view

// the api
// https://www.electronjs.org/docs/api/web-contents

export default function Scraping(): JSX.Element {
  const [curUrl, setCurUrl] = useState(null);
  const [curHtml, setCurHtml] = useState('');
  const [scrapingGen, setScrapingGen] = useState<any>(null);
  const [progresFrac, setProgresFrac] = useState(0);

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
      (x: any) => x.name === scrapingConfigYoutube.logingCookie
    );
    setUserLoggedIn(isLoggedIn);
    return isLoggedIn;
  };

  const goToStart = () => {
    // can't set custom userAgent with a prop
    browser.current.loadURL(scrapingConfigYoutube.loginUrl, {
      userAgent: 'Chrome',
    });
  };

  const clearBrowser = () => {
    browser?.current.view.webContents.session.clearStorageData();
    goToStart();
  };

  const getHTML = async (url: string) => {
    await browser?.current.loadURL(url, {
      userAgent: 'Chrome',
    });

    const html = await browser.current.executeJavaScript(
      'document.documentElement.innerHTML'
    );
    return html;
  };

  const doScraping = async () => {
    let gen = null;
    if (scrapingGen === null) {
      gen = scrapingConfigYoutube.scrapingGenerator(getHTML);
      setScrapingGen(gen);
      setIsScrapingStarted(true);
    } else {
      gen = scrapingGen;
    }

    while (!isScrapingFinished) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done } = await gen.next();
      setProgresFrac(value[0] / value[1]);
      if (done) setIsScrapingFinished(true);
    }
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
        <button className="button" type="button" onClick={doScraping}>
          start scraping
        </button>
      )}
      {!isScrapingFinished && isScrapingStarted && !isScrapingPaused && (
        <button className="button" type="button">
          pause scraping
        </button>
      )}
      {!isScrapingFinished && isScrapingStarted && isScrapingPaused && (
        <button className="button" type="button">
          resume scraping
        </button>
      )}
      {isScrapingFinished && (
        <button className="button" type="button">
          go to visualization
        </button>
      )}

      {isScrapingStarted && (
        <progress className="progress" value={progresFrac} max="1">
          {progresFrac}
        </progress>
      )}

      {/* <h3 className="title is-3">Working on {curUrl}</h3> */}

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
            const justLoggedIn = await waitUntilLoggingIn();
            if (!justLoggedIn) return;
          }
        }}
      />
    </Base>
  );
}
