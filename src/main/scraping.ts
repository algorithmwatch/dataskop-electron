/**
 * controlling the scraping window
 */

import { BrowserView, ipcMain } from 'electron';

let scrapingView: BrowserView | null = null;

// function setInteractivity(webContents, isInteractive) {
//   const inputEventHandler = (event, input) => {
//     console.log('y');
//     event.preventDefault();
//   };

//   console.log('x', isInteractive);

//   if (isInteractive) {
//     webContents.removeListener('before-input-event', inputEventHandler);
//   } else {
//     webContents.on('before-input-event', () => console.log('z'));
//   }

//   return webContents;
// }

export default function registerScrapingHandlers(mainWindow) {
  const getScrapingView = (): BrowserView => {
    if (scrapingView == null) {
      const newView = new BrowserView({
        webPreferences: {
          contextIsolation: false,
        },
      });
      mainWindow?.setBrowserView(newView);

      // muted audio is the default
      newView.webContents?.setAudioMuted(true);

      // FIXME: why is is working here but not below?
      // newView.webContents.on('before-input-event', (event) =>
      //   event.preventDefault(),
      // );

      scrapingView = newView;
    }
    return scrapingView;
  };

  ipcMain.handle(
    'scraping-load-url',
    async (event, url: string, { withHtml = false, clear = false }) => {
      const view = getScrapingView();

      if (clear) {
        view.webContents.session.clearStorageData();
      }

      await view.webContents.loadURL(url, {
        userAgent: 'Chrome',
      });

      if (withHtml) {
        const html = await view.webContents.executeJavaScript(
          'document.documentElement.innerHTML',
        );
        return html;
      }

      return null;
    },
  );

  ipcMain.handle('scraping-get-cookies', async (event) => {
    const { webContents } = getScrapingView();
    const cookies = await webContents.session.cookies.get({});
    return cookies;
  });

  ipcMain.handle(
    'scraping-navigation-cb',
    async (event, cbSlug, remove = false) => {
      const view = getScrapingView();

      // TODO: find a better event?
      const navEvent = 'page-title-updated';
      const cb = () => {
        event.sender.send(cbSlug);
      };

      if (remove) {
        view.webContents.removeListener(navEvent, cb);
      } else {
        view.webContents.on(navEvent, cb);
      }
    },
  );

  ipcMain.handle('scraping-get-current-html', async (event) => {
    const view = getScrapingView();
    const html = await view.webContents.executeJavaScript(
      'document.documentElement.innerHTML',
    );
    return html;
  });

  ipcMain.handle('scraping-scroll-down', async (event) => {
    const view = getScrapingView();
    await view.webContents.executeJavaScript('window.scrollBy(0, 100);');
  });

  ipcMain.handle('scraping-set-muted', async (event, muted: boolean) => {
    const { webContents } = getScrapingView();
    await webContents?.setAudioMuted(muted);
  });

  // FIXME: not working!
  // ipcMain.handle(
  //   'scraping-set-interactive',
  //   async (event, isInteractive: boolean) => {
  //     const view = getScrapingView();

  //     console.log('x');
  //     // view.webContents.removeAllListeners('before-input-event');

  //     scrapingView?.webContents.on('before-input-event', (e, input) => {
  //       console.log('test');
  //       e.preventDefault();
  //     });
  //     // mainWindow?.setBrowserView(view);

  //     // setInteractivity(webContents, isInteractive);
  //   },
  // );

  ipcMain.handle('scraping-remove-view', async (event) => {
    const view = getScrapingView();
    mainWindow?.removeBrowserView(view);

    // .destroy() does indeed exists and is nesseary to fully remove the view.
    // Not calling it will result in errors with event handlers.
    view.webContents.destroy();
    scrapingView = null;
  });

  ipcMain.handle('scraping-set-bounds', async (event, bounds) => {
    const view = getScrapingView();
    view?.setBounds(bounds);
  });
}
