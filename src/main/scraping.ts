/**
 * controlling the scraping window
 */

import crypto from 'crypto';
import { BrowserView, BrowserWindow, ipcMain } from 'electron';
import { range } from 'lodash';
import { delay } from '../utils/time';

let scrapingView: BrowserView | null = null;

export default function registerScrapingHandlers(mainWindow: BrowserWindow) {
  // register several handlers for the scraping view

  ipcMain.handle(
    'scraping-init-view',
    (_event, { muted = true, allowInput = true }) => {
      if (scrapingView !== null) {
        mainWindow?.removeBrowserView(scrapingView);

        // .destroy() does indeed exists and is nesseary to fully remove the view.
        // Not calling it will result in errors with event handlers.
        scrapingView?.webContents.destroy();
      }

      const newView = new BrowserView({
        webPreferences: {
          contextIsolation: false,
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

  ipcMain.handle('scraping-clear-storage', () => {
    const view = scrapingView;
    return view?.webContents.session.clearStorageData();
  });

  ipcMain.handle(
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
      // 3) So we set to some recent Firefox user agents.

      // Background:
      // https://stackoverflow.com/a/68231284/4028896
      // https://www.reddit.com/r/kde/comments/e7136e/google_bans_falkon_and_konqueror_browsers/faicv9g/
      // https://www.electronjs.org/releases/stable?version=12&page=3#12.0.0

      let userAgent = '';

      if (process.platform === 'darwin') {
        userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 11.4; rv:89.0) Gecko/20100101 Firefox/89.0';
      }

      if (process.platform === 'win32') {
        userAgent =
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
      }

      if (process.platform === 'linux') {
        userAgent =
          'Mozilla/5.0 (X11; Linux i686; rv:89.0) Gecko/20100101 Firefox/89.0';
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
          console.log(
            'strange error with await + loadUrl, trying to overcome it',
          );
          console.log(error);
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
            console.log(e);
          }

          if (withHtml) {
            const html = await view?.webContents.executeJavaScript(
              'document.documentElement.innerHTML',
            );
            return html;
          }

          return null;
        } catch (error) {
          console.log('strange error, retry...');
          console.log(error);
          delay(1000 * i);
        }
      }

      throw new Error(
        `failed at main/scraping.ts to extract html from given url: ${url}`,
      );
    },
  );

  ipcMain.handle('scraping-get-cookies', async () => {
    const cookies = await scrapingView?.webContents.session.cookies.get({});
    return cookies;
  });

  ipcMain.handle(
    'scraping-navigation-cb',
    async (event, cbSlug, remove = false) => {
      const view = scrapingView;

      // TODO: find a better event?
      const navEvent = 'page-title-updated';
      const cb = () => {
        event.sender.send(cbSlug);
      };

      if (remove) {
        view?.webContents.removeListener(navEvent, cb);
      } else {
        view?.webContents.on(navEvent, cb);
      }
    },
  );

  ipcMain.handle('scraping-get-current-html', async () => {
    const html = await scrapingView?.webContents.executeJavaScript(
      'document.documentElement.innerHTML',
    );
    const hash = crypto.createHash('md5').update(html).digest('hex');

    return { html, hash };
  });

  ipcMain.handle('scraping-scroll-down', async () => {
    await scrapingView?.webContents.executeJavaScript(
      'window.scrollBy(0, 100);',
    );
  });

  ipcMain.handle('scraping-set-muted', async (_event, muted: boolean) => {
    await scrapingView?.webContents.setAudioMuted(muted);
  });

  ipcMain.handle('scraping-remove-view', async () => {
    if (scrapingView === null) return;
    mainWindow?.removeBrowserView(scrapingView);

    // .destroy() does indeed exists and is nesseary to fully remove the view.
    // Not calling it will result in errors with event handlers.
    scrapingView?.webContents.destroy();
    scrapingView = null;
  });

  ipcMain.handle('scraping-set-bounds', async (_event, bounds) => {
    scrapingView?.setBounds(bounds);
  });

  ipcMain.handle('scraping-click-element', async (_event, selector) => {
    await scrapingView?.webContents.executeJavaScript(
      `document.querySelector("${selector}").click()`,
    );
  });

  ipcMain.handle('scraping-submit-form', async (_event, selector) => {
    await scrapingView?.webContents.executeJavaScript(
      `document.querySelector("${selector}").submit()`,
    );
  });

  ipcMain.handle('scraping-element-exists', async (_event, selector) => {
    return scrapingView?.webContents.executeJavaScript(
      `document.querySelector("${selector}") !== null`,
    );
  });
}
