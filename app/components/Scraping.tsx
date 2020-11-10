import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import BrowserView from 'react-electron-browser-view';
import routes from '../constants/routes.json';
// import styles from './Home.css';

import Base from './Base';

const scrapingConfigYoutube = {
  loginUrl: 'https://www.youtube.com/account',
  logingCookie: 'LOGIN_INFO',
};

// the react wrapper is buggy, remove it?
// https://github.com/vantezzen/react-electron-browser-view

// the api
// https://www.electronjs.org/docs/api/web-contents

export default function Scraping(): JSX.Element {
  const [curUrl, setCurUrl] = useState(null);
  const [curHtml, setCurHtml] = useState('');
  const [userLoggedIn, setUserLoggedIn] = useState(false);
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
    browser.current.loadURL(scrapingConfigYoutube.loginUrl, {
      userAgent: 'Chrome',
    });
  };

  const clearBrowser = () => {
    browser?.current.view.webContents.session.clearStorageData();
    goToStart();
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
      {!userLoggedIn && <p>Please login before continuing.</p>}
      {userLoggedIn && (
        <button className="button" type="button">
          start scraping
        </button>
      )}

      {/* <h3 className="title is-3">Working on {curUrl}</h3> */}

      <BrowserView
        ref={browser}
        src="about:blank"
        style={{
          height: 500,
        }}
        onDidAttach={() => {
          // can't set custom userAgent with a prop
          setTimeout(goToStart, 100);
        }}
        onUpdateTargetUrl={async () => {
          if (!userLoggedIn) {
            const justLoggedIn = await waitUntilLoggingIn();
            if (!justLoggedIn) return;
          }

          const url = browser?.current.getURL();
          setCurUrl(url);

          browser.current
            .executeJavaScript('document.documentElement.innerHTML')
            .then(setCurHtml)
            .catch((x) => console.error(x));
        }}
      />
    </Base>
  );
}
