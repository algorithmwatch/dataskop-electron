/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import {
  app,
  BrowserView,
  BrowserWindow,
  ipcMain,
  session,
  shell,
} from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import 'regenerator-runtime/runtime';
import MenuBuilder from './menu';

const DEBUG =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (DEBUG) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (DEBUG) {
    await installExtensions();
  }

  let cspString =
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:1212 https://dataskop.net";

  // needed in debug to install dev tools etc
  if (!DEBUG) cspString = cspString.replace('unsafe-eval', '');

  if (process.env)
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [cspString],
        },
      });
    });

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// controlling the scraping window

let scrapingView: BrowserView | null = null;

const getScrapingView = (): BrowserView => {
  if (scrapingView == null) {
    const newView = new BrowserView();
    mainWindow?.setBrowserView(newView);

    const { width } = mainWindow?.getBounds();

    newView.setBounds({ x: width - 300, y: 0, width: 300, height: 300 });
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
        'document.documentElement.innerHTML'
      );
      return html;
    }

    return null;
  }
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
  }
);

ipcMain.handle('scraping-get-html', async (event) => {
  const view = getScrapingView();
  const html = await view.webContents.executeJavaScript(
    'document.documentElement.innerHTML'
  );
  return html;
});

ipcMain.handle('scraping-scroll-down', async (event) => {
  const view = getScrapingView();
  await view.webContents.executeJavaScript('window.scrollBy(0, 100);');
});

ipcMain.handle('scraping-set-muted', async (event, value) => {
  const { webContents } = getScrapingView();
  await webContents?.setAudioMuted(value);
});
