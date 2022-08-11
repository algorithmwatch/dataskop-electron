/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */

// Do not (!) change the import to: `import Sentry from '@sentry/electron'`
import * as Sentry from '@sentry/electron/main';
import 'core-js/stable';
import {
  app,
  BrowserWindow,
  dialog,
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
import registerBackgroundScrapingHandlers from './background-scraping';
import registerDbHandlers from './db';
import registerExportHandlers from './export';
import { buildMenu } from './menu';
import registerYoutubeHanderls from './providers/youtube';
import registerScrapingHandlers from './scraping';
import { buildTray } from './tray';
import { resolveHtmlPath } from './utils';

// read .env files for development
require('dotenv').config();

const DEBUG =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}

let mainWindow: BrowserWindow | null = null;

class AppUpdater {
  constructor() {
    log.transports.file.level = DEBUG ? 'debug' : 'info';

    if (process.env.UPDATE_FEED_URL) {
      autoUpdater.setFeedURL(process.env.UPDATE_FEED_URL);
    }

    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// send update-related events to renderer
autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update-available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update-downloaded');
});
autoUpdater.on('error', async (_event, error) => {
  mainWindow?.webContents.send('update-error', error);
});

// handle update-related events from renderer
ipcMain.handle('update-check-beta', () => {
  autoUpdater.channel = 'beta';
  return autoUpdater.checkForUpdatesAndNotify();
});
ipcMain.handle('update-restart-app', () => {
  log.debug('called handle update-restart-app');
  autoUpdater.quitAndInstall();
});

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
    .catch(log.error);
};

const handleTrayClick = (name) => {
  if (mainWindow == null) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    createWindow();
  } else {
    mainWindow.focus();
  }
};

const createWindow = async (monitoring = false) => {
  log.debug('called createWindow', mainWindow == null);

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
    : path.join(__dirname, '../../assets');

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
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      backgroundThrottling: false,
      sandbox: false,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED || monitoring) {
      mainWindow.minimize();
    } else {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;
      mainWindow.setBounds({
        width: Math.floor(width * 0.9),
        height: Math.floor(height * 0.9),
        x: Math.floor(width * 0.05),
        y: Math.floor(height * 0.05),
      });
      mainWindow.show();
    }
  });

  /*
  Before closing the app, check if the scraping process is still active. If yes,
  then ask for a confirmation. To do so, you have to check the current status
  in the state of the renderer process. So we have to communicate back and forth.
  */

  mainWindow.on('close', (e) => {
    mainWindow?.webContents.send('close-action');
    e.preventDefault();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  buildMenu(mainWindow);
  buildTray(handleTrayClick, getAssetPath('icon.png'));

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Wait a second until checkin for new update to let the app initialize.
  setTimeout(() => {
    // eslint-disable-next-line no-new
    new AppUpdater();
  }, 1000);

  // Allow scraping to happend in brackground
  powerSaveBlocker.start('prevent-app-suspension');

  // Register general handlers
  registerScrapingHandlers(mainWindow);
  registerExportHandlers(mainWindow);
  registerBackgroundScrapingHandlers();
  registerDbHandlers();

  // Register provider specific handlers
  registerYoutubeHanderls(mainWindow);
};

/**
 * Controlling main window
 */

ipcMain.handle('close-main-window', (_e, isCurrentlyScraping: boolean) => {
  log.debug('called handle close-main-window', mainWindow == null);
  if (mainWindow === null) return;

  if (isCurrentlyScraping) {
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Ja, beenden', 'Abbrechen'],
      defaultId: 1,
      cancelId: 1,
      title: 'Bestätigen',
      message:
        'Willst du DataSkop wirklich beenden? Der Scraping-Vorgang läuft noch.',
    });
    if (choice === 1) {
      return;
    }
  }
  mainWindow.destroy();
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => createWindow())
  .catch(log.error);

// macOS only
app.on('activate', () => {
  log.debug('called activate', mainWindow == null);

  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// Expose certain information to the renderer

ipcMain.handle('get-version-number', () => {
  return app.getVersion();
});

ipcMain.handle('get-env', () => {
  // Expose configs done via .env to the renderer. The keys have to explicitly
  // specified as follows (right now).
  return {
    NODE_ENV: process.env.NODE_ENV,
    DEBUG_PROD: process.env.DEBUG_PROD,
    PLATFORM_URL: process.env.PLATFORM_URL,
    TRACK_EVENTS: process.env.TRACK_EVENTS,
    SERIOUS_PROTECTION: process.env.SERIOUS_PROTECTION,
  };
});
