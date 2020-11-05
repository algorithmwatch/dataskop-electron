import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
// import styles from './Home.css';

import BrowserView from 'react-electron-browser-view';

import Base from './Base';

export default function Scraping(): JSX.Element {
  const [curUrl, setCurUrl] = useState(null);
  const [curHtml, setCurHtml] = useState('');
  const browser = useRef(null);
  return (
    <Base>
      <h2 className="title is-2">Scraping</h2>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam fugit
        laboriosam suscipit fuga omnis error asperiores minus! In, ratione
        perferendis sequi libero laborum esse soluta, ut rerum placeat
        consectetur deleniti.
      </p>

      <h3 className="title is-3">Working on {curUrl}</h3>

      <p>{curHtml.substring(0, 100)}</p>

      <BrowserView
        ref={browser}
        src="https://www.youtube.com"
        // Using events
        onDidAttach={() => {
          console.log('BrowserView attached');
        }}
        onUpdateTargetUrl={() => {
          const url = browser.current.getURL();
          setCurUrl(url);

          browser.current
            .executeJavaScript('document.documentElement.innerHTML')
            .then(setCurHtml);
        }}
        // Providing styling for the container element
        style={{
          height: 500,
        }}
      />
    </Base>
  );
}
