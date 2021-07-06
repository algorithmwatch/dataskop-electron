/**
 * controlling the scraping window
 */

import { BrowserView, BrowserWindow, ipcMain } from 'electron';

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
        },
      });

      mainWindow?.setBrowserView(newView);

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
    view?.webContents.session.clearStorageData();
  });

  ipcMain.handle(
    'scraping-load-url',
    async (_event, url: string, { withHtml = false, clear = false }) => {
      const view = scrapingView;

      if (clear) {
        view?.webContents.session.clearStorageData();
      }

      await view?.webContents.loadURL(url, {
        // userAgent: 'Chrome',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.69 Safari/537.36',
      });

      // wait until the browser is idle, wait at most 10 seconds
      // see: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
      await view?.webContents.executeJavaScript(
        `new Promise(function(resolve, reject) { requestIdleCallback(() => resolve(true), { timeout: 10000 }) });`,
        true,
      );

      if (withHtml) {
        const html = await view?.webContents.executeJavaScript(
          'document.documentElement.innerHTML',
        );
        return html;
      }

      return null;
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
    return html;
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
