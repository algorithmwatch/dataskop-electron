/**
 * controlling the scraping window
 */

import crypto from 'crypto';
import { app, BrowserView, BrowserWindow } from 'electron';
import fs from 'fs';
import { range } from 'lodash';
import { stripNonAscii } from '../renderer/lib/utils/strings';
import { delay, getNowString } from '../renderer/lib/utils/time';

import log from 'electron-log';
import { addMainHandler } from './util';

let scrapingView: BrowserView | null = null;

export default function registerScrapingHandlers(mainWindow: BrowserWindow) {
  log.debug('called registerScrapingHandlers', mainWindow == null);

  // register several handlers for the scraping view

  addMainHandler(
    'scraping-init-view',
    (_event, { muted = true, allowInput = true }) => {
      log.debug(
        'called scraping-init-view',
        scrapingView == null,
        mainWindow == null,
      );

      if (scrapingView !== null) {
        try {
          mainWindow?.removeBrowserView(scrapingView);
        } catch (error) {
          log.error('Could not remove the scraping view from the main window');
          log.error(error);
        }

        try {
          // .destroy() does indeed exists and is nesseary to fully remove the view.
          // Not calling it will result in errors with event handlers.
          scrapingView?.webContents.destroy();
        } catch (error) {
          log.error('Could not destroy the scraping view');
          log.error(error);
        }
      }

      const newView = new BrowserView({
        webPreferences: {
          partition: 'scraping',
          backgroundThrottling: false,
        },
      });

      mainWindow?.setBrowserView(newView);

      // open the debug console in dev
      // newView.webContents.openDevTools();

      if (muted) newView.webContents?.setAudioMuted(true);

      if (!allowInput) {
        const preventInputCss =
          'html, body { pointer-events: none; height: 100%; overflow-y: hidden;}';

        newView.webContents.on('before-input-event', (event) =>
          event.preventDefault(),
        );
        newView.webContents.insertCSS(preventInputCss);

        // Not sure if this is necessary but better to disable user input asap (before did-finish-load fires)
        newView.webContents.on('did-finish-load', () => {
          newView.webContents.on('before-input-event', (event) =>
            event.preventDefault(),
          );
          newView.webContents.insertCSS(preventInputCss);
        });
      }

      scrapingView = newView;
    },
  );

  addMainHandler('scraping-clear-storage', () => {
    const view = scrapingView;
    return view?.webContents.session.clearStorageData();
  });

  addMainHandler(
    'scraping-load-url',
    async (_event, url: string, { withHtml = false, clear = false }) => {
      const view = scrapingView;

      if (clear) {
        view?.webContents.session.clearStorageData();
      }

      // Choosing a correct user agent is important to make the login with Google.
      // 1) Using the Electron default one will fail.
      // 2) Choosing the user agent of the bundled chrome version will also fail.
      // It seems that Google knows that this is a modified version of the chrome (fingerprinting?)
      // 3) So we set to some recent Firefox user agents. This used to work from mid 2021 to Jan. 2022.
      // 4) Now we use a recent Vivaldi user agent.

      // Background:
      // https://stackoverflow.com/a/68231284/4028896
      // https://www.reddit.com/r/kde/comments/e7136e/google_bans_falkon_and_konqueror_browsers/faicv9g/
      // https://www.electronjs.org/releases/stable?version=12&page=3#12.0.0
      // https://www.whatismybrowser.com/guides/the-latest-user-agent/

      let userAgent = '';

      if (process.platform === 'darwin') {
        userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Vivaldi/4.3';
      }

      if (process.platform === 'win32') {
        userAgent =
          'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Vivaldi/4.3';
      }

      if (process.platform === 'linux') {
        userAgent =
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Vivaldi/4.3';
      }

      // try 5 times and then give up

      // eslint-disable-next-line no-restricted-syntax
      for (const i of range(5)) {
        // await loadUrl(..) causes somethimes strange errors.
        try {
          await view?.webContents.loadURL(url, {
            userAgent,
          });
        } catch (error) {
          log.log('strange error with await + loadUrl, trying to overcome it');
          log.log(error);
          await delay(2000);
        }

        try {
          // wait until the browser is idle, wait at most 10 seconds
          // see: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
          await view?.webContents.executeJavaScript(
            `new Promise(function(resolve, reject) { requestIdleCallback(() => resolve(true), { timeout: 10000 }) });`,
            true,
          );

          // pause videos right after rendering, import to not alter the HTML for the hash check
          try {
            await view?.webContents.executeJavaScript(
              "const awThePlayer = document.querySelector('.html5-video-player'); if(awThePlayer != null) awThePlayer.click();",
            );
          } catch (e) {
            log.log(e);
          }

          if (withHtml) {
            const html = await view?.webContents.executeJavaScript(
              'document.documentElement.outerHTML',
            );
            return html;
          }

          return null;
        } catch (error) {
          log.log('strange error, retry...');
          log.log(error);
          delay(1000 * i);
        }
      }

      throw new Error(
        `failed at main/scraping.ts to extract html from given url: ${url}`,
      );
    },
  );

  addMainHandler('scraping-get-cookies', async () => {
    const cookies = await scrapingView?.webContents.session.cookies.get({});
    return cookies;
  });

  addMainHandler('scraping-get-url', () => scrapingView?.webContents.getURL());

  addMainHandler(
    'scraping-navigation-cb',
    async (event, cbSlug, remove = false) => {
      const view = scrapingView;

      // TODO: find a better event?
      const navEvent = 'page-title-updated';
      const cb = () => {
        mainWindow.webContents.send(cbSlug);
      };

      if (remove) {
        view?.webContents.removeListener(navEvent, cb);
      } else {
        view?.webContents.on(navEvent, cb);
      }
    },
  );

  const _getCurrentHtml = async () => {
    const html = await scrapingView?.webContents.executeJavaScript(
      'document.documentElement.outerHTML',
    );
    const hash = crypto.createHash('md5').update(html).digest('hex');

    return { html, hash };
  };

  addMainHandler('scraping-get-current-html', _getCurrentHtml);

  addMainHandler('scraping-scroll-down', async () => {
    await scrapingView?.webContents.executeJavaScript(
      'window.scrollBy(0, 100);',
    );
  });

  addMainHandler('scraping-set-muted', async (_event, muted: boolean) => {
    await scrapingView?.webContents.setAudioMuted(muted);
  });

  addMainHandler('scraping-remove-view', async () => {
    console;

    if (scrapingView === null) return;

    try {
      mainWindow?.removeBrowserView(scrapingView);
    } catch (error) {
      log.error('Could not remove the scraping view from the main window');
      log.error(error);
    }

    try {
      // .destroy() does indeed exists and is nesseary to fully remove the view.
      // Not calling it will result in errors with event handlers.
      scrapingView?.webContents.destroy();
    } catch (error) {
      log.error('Could not destroy the scraping view');
      log.error(error);
    }

    scrapingView = null;
  });

  addMainHandler('scraping-set-bounds', async (_event, bounds) => {
    scrapingView?.setBounds(bounds);
  });

  addMainHandler('scraping-click-element', async (_event, selector) => {
    await scrapingView?.webContents.executeJavaScript(
      `document.querySelector("${selector}").click()`,
    );
  });

  addMainHandler('scraping-submit-form', async (_event, selector) => {
    await scrapingView?.webContents.executeJavaScript(
      `document.querySelector("${selector}").submit()`,
    );
  });

  addMainHandler('scraping-element-exists', async (_event, selector) => {
    return scrapingView?.webContents.executeJavaScript(
      `document.querySelector("${selector}") !== null`,
    );
  });

  addMainHandler('scraping-log-html', async (_event, url) => {
    const { html, hash } = await _getCurrentHtml();

    // macOS: ~/Library/Application\ Support/Electron/html
    const userFolder = app.getPath('userData');

    !fs.existsSync(`${userFolder}/html`) && fs.mkdirSync(`${userFolder}/html`);

    const fn = `${getNowString()}-${stripNonAscii(url)}-${hash}.html`;
    fs.writeFileSync(`${userFolder}/html/${fn}`, html);
    return { html, hash };
  });
}
