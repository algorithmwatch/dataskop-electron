/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */

// Do not (!) change the import to: `import Sentry from '@sentry/electron'`
import * as Sentry from '@sentry/electron';
import 'core-js/stable';
import {
  app,
  BrowserWindow,
  ipcMain,
  powerSaveBlocker,
  screen,
  session,
  shell,
} from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import 'regenerator-runtime/runtime';
import { registerExportHandlers, registerScrapingHandlers } from './main';
import MenuBuilder from './main/menu';

const DEBUG =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}

export default class AppUpdater {
  constructor() {
    log.transports.file.level = DEBUG ? 'debug' : 'info';

    if (process.env.UPDATE_FEED_URL) {
      autoUpdater.setFeedURL(process.env.UPDATE_FEED_URL);
    }

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
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (DEBUG) {
    await installExtensions();
  }

  // The 'unsafe-eval' is required to execute custom JavaScript in the scraper view. When not allowed it,
  // the browser view ist not using a custom user agent (that is required to scrape YouTube).
  // `https://ssl.gstatic.com` to allow Google Login to work.

  // HOTFIX: allow all HTTPS traffic because there were issues with google login
  const cspString =
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:1212 https://dataskop.net https://*.dataskop.net https://ssl.gstatic.com https:";

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
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    maxWidth: 1920,
    maxHeight: 1080,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
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
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;
      mainWindow.setBounds({
        width: Math.floor(width * 0.9),
        height: Math.floor(height * 0.9),
      });
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

  // https://stackoverflow.com/a/63174933/4028896
  mainWindow.webContents.on('did-frame-finish-load', async () => {
    if (DEBUG) {
      await installExtensions();
    }
  });

  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });

  // not sure if timeout is actually required
  setTimeout(() => {
    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
  }, 1000);

  // allow scraping to happend in brackground
  powerSaveBlocker.start('prevent-app-suspension');

  // register handlers
  registerScrapingHandlers(mainWindow);
  registerExportHandlers(mainWindow);
};

/**
 * Controlling main window
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

// app.on('before-quit', (event) => {
//   // Not 100% sure if this is needed. There have been some issues with
//   closeDb();
// });

/**
 * Notify UI about new Updates
 */

autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update_downloaded');
});

autoUpdater.on('error', async (_event, error) => {
  mainWindow?.webContents.send('update_error', error);
});

/**
 * comunicate with renderer
 */

ipcMain.handle('get-version-number', () => {
  return app.getVersion();
});

ipcMain.handle('get-path-user-data', () => {
  return app.getPath('userData');
});
