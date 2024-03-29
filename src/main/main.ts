/* eslint-disable no-new */
/* eslint-disable global-require */
/**
The entrypoint for the main process.
 */

// Do not (!) change the import to: `import Sentry from '@sentry/electron'`
import * as Sentry from "@sentry/electron/main";
import "core-js/stable";
import dns from "dns";
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Notification,
  powerSaveBlocker,
  screen,
  shell,
} from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import path from "path";
import { delay } from "../shared/utils/time";
import registerScrapingHandlers from "./active-scraping";
import registerDbHandlers, { clearData, configStore } from "./db";
import registerDownloadsHandlers, { clearDownloads } from "./downloads";
import registerExportHandlers from "./export";
import { buildMenu } from "./menu";
import registerPassiveScrapingBrowserHandlers from "./passive-scraping/browser-scraping";
import registerGoogleTakeoutYoutubeHandlers from "./providers/google-takeout-youtube";
import registerTiktokDataHandlers from "./providers/tiktok/data";
import registerTiktokScrapingHandlers from "./providers/tiktok/scraping";
import { isLastStatusPending } from "./providers/tiktok/status";
import registerYoutubeHandlers from "./providers/youtube";
import { buildTray } from "./tray";
import { isFromLocalhost, resolveHtmlPath } from "./utils";

const handleProdException = (message: string, stack: string) => {
  if (process.env.NODE_ENV !== "production") {
    log.info("Not showing exception modal when not in prod");
    return;
  }

  log.error(`Exception modal shown with: ${message} ${stack}`);

  const clicked = dialog.showMessageBoxSync({
    title: "Fehler",
    message: "Es ist ein Fehler aufgetreten 😔",
    detail: `${message},${stack}`,
    type: "error",
    buttons: ["Ignorieren", "Fehler melden", "Beenden"],
  });

  if (clicked === 1) {
    shell.openExternal(
      `mailto:support@dataskop.net?subject=Fehler in der DataSkop-App ${
        process.platform
      } ${app.getVersion()}&body=${message},${stack}`,
    );
  }

  if (clicked === 2) {
    app.quit();
  }
};

log.catchErrors({
  showDialog: false,
  onError(error) {
    handleProdException(error.message, error.stack ?? "");
  },
});

ipcMain.handle("show-renderer-error-modal", (event, message, stack) => {
  handleProdException(message, stack);
});

// https://github.com/electron/electron/issues/23756#issuecomment-651287598
app.commandLine.appendSwitch(
  "disable-features",
  "SpareRendererForSitePerProcess,WebRtcHideLocalIpsWithMdns",
);

// https://stackoverflow.com/a/65863174/4028896
if (process.platform === "win32") {
  app.setAppUserModelId("DataSkop");
}

// read .env files for development
require("dotenv").config();

const DEBUG =
  process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}

let mainWindow: BrowserWindow | null = null;

class AppUpdater {
  constructor() {
    log.transports.file.level = DEBUG ? "debug" : "info";
    autoUpdater.logger = log;

    if (process.env.UPDATE_FEED_URL) {
      autoUpdater.setFeedURL(process.env.UPDATE_FEED_URL);
    }

    if (app.getVersion().includes("alpha")) {
      autoUpdater.channel = "alpha";
    }

    autoUpdater.checkForUpdatesAndNotify();
  }
}

// send update-related events to renderer
autoUpdater.on("update-available", () => {
  mainWindow?.webContents.send("update-available");
});
autoUpdater.on("update-not-available", () => {
  mainWindow?.webContents.send("update-check-done");
});
autoUpdater.on("update-downloaded", () => {
  mainWindow?.webContents.send("update-downloaded");
});
autoUpdater.on("error", (error) => {
  log.error(`Error with auto-updater: ${error}`);
  // Proceed even if an error occured
  mainWindow?.webContents.send("update-check-done");
});

// handle update-related events from renderer
ipcMain.handle("update-check-beta", () => {
  autoUpdater.channel = "beta";
  return autoUpdater.checkForUpdatesAndNotify();
});
ipcMain.handle("update-restart-app", () => {
  log.debug("called handle update-restart-app");
  autoUpdater.quitAndInstall();
});

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

if (DEBUG) {
  require("electron-debug")();
}

const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS"];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(log.error);
};

// Monitoring handling

let doingMonitoring = false;

const doMonitoring = async () => {
  if (!isLastStatusPending()) {
    log.info(
      `The current status does not require monitoring. Not doing monitoring.`,
    );
    return;
  }

  if (doingMonitoring) {
    log.info("Some monitoring action has already stared. Do nothing.");
    return;
  }

  log.info("Starting to check for GDRP status.");
  doingMonitoring = true;

  configStore.set("monitoring", true);
  await delay(1000);

  if (mainWindow == null) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    createWindow();
  } else {
    mainWindow.reload();
  }
};

ipcMain.handle("monitoring-done", () => {
  log.info("Monitoring is done. Removing flags and closing main window.");
  configStore.set("monitoring", false);
  doingMonitoring = false;
  // Close window on macOS only, keep it minimized for the rest
  if (mainWindow && process.platform === "darwin") mainWindow.close();
});

// Main function to initialize a window
const createWindow = async () => {
  log.debug(`Creating main window mainWindow=${mainWindow !== null}`);

  // Only launch if the computer is connected to the internet.
  // Resolve always sends a DNS request.
  while (true) {
    try {
      await dns.promises.resolve("datenspende.dataskop.net");
      log.info("Connected to the internet. Let's go!");
      break;
    } catch (e) {
      await delay(1000);
      log.info("Checking network connection...");
    }
  }

  if (DEBUG) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(__dirname, "../../assets");

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const startMinimized = !!(process.env.START_MINIMIZED || doingMonitoring);

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 700,
    icon: getAssetPath("icon.png"),
    skipTaskbar: startMinimized,
    webPreferences: {
      preload:
        process.env.NODE_ENV === "development"
          ? path.join(__dirname, "../../.erb/dll/preload.js")
          : path.join(__dirname, "preload.js"),
      backgroundThrottling: false,
      sandbox: false,
    },
  });

  mainWindow.loadURL(resolveHtmlPath("index.html"));

  // Don't use `ready-to-show` since it fire more often, e.g., it looks like it fires
  // every time the scraping window changes.
  mainWindow.webContents.on("did-finish-load", () => {
    log.info("Main window: did-finish-load fired");

    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (startMinimized) {
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

      // Only check for update after the renderer window was initialized
      new AppUpdater();

      if (
        process.env.NODE_ENV === "development" ||
        !!process.env.PLAYWRIGHT_TESTING
      ) {
        // The update is not checked unless the apps in prod. Thus, manually
        // set the update check as complete.
        mainWindow.webContents.send("update-check-done");
      }
    }
  });

  /*
  Before closing the app, check if the scraping process is still active. If yes,
  then ask for a confirmation. To do so, you have to check the current status
  in the state of the renderer process. So we have to communicate back and forth.
  */

  mainWindow.on("close", (e) => {
    mainWindow?.webContents.send("close-action");
    e.preventDefault();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  buildMenu(mainWindow);

  const createOrBringToFocus = () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      try {
        mainWindow.show();
      } catch (error) {
        // Unclear in which situations mainWindow isn't null but was somehow destroyed.
        // This needs more investigation, the situation happend in prod. :/
        log.error(
          `Error withing 'createOrBringToFocus', creating new window now: ${error}`,
        );
        createWindow();
      }
    }
  };

  buildTray(
    createOrBringToFocus,
    doMonitoring,
    configStore,
    getAssetPath("icon.png"),
  );

  // Open URLs in the user's browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Allow scraping to happend in brackground
  powerSaveBlocker.start("prevent-app-suspension");

  // Register general handlers
  registerScrapingHandlers(mainWindow);
  registerDownloadsHandlers(mainWindow);
  registerExportHandlers(mainWindow);
  registerPassiveScrapingBrowserHandlers();
  registerDbHandlers();

  // Register provider specific handlers
  registerYoutubeHandlers(mainWindow);
  registerTiktokScrapingHandlers(mainWindow);
  registerTiktokDataHandlers(mainWindow);
  registerGoogleTakeoutYoutubeHandlers(mainWindow);
};

/**
 * Controlling main window
 */

ipcMain.handle(
  "close-main-window",
  (
    _e,
    isCurrentlyScraping: boolean,
    cleanupData: boolean,
    reachedEnd: boolean,
  ) => {
    log.debug("called handle close-main-window", mainWindow == null);
    if (mainWindow === null) return;

    if (isCurrentlyScraping) {
      const choice = dialog.showMessageBoxSync(mainWindow, {
        type: "question",
        buttons: ["Ja, beenden", "Abbrechen"],
        defaultId: 1,
        cancelId: 1,
        title: "Bestätigen",
        message: "Willst du DataSkop wirklich beenden? Ein Vorgang läuft noch.",
      });
      if (choice === 1) {
        return;
      }
    }

    // Cleanup after the user donated (or finish the walkthrough)
    if (cleanupData) {
      log.info("Clearing the data before closing the app.");
      clearDownloads();
      clearData();
    }

    if (reachedEnd) {
      app.exit();
    } else {
      mainWindow.destroy();
    }
  },
);

app.on("window-all-closed", () => {
  if (configStore.get("monitoring")) {
    log.warn(
      "Detected faulty value `true` for `monitoring`. Setting to `false` now.",
    );
    // Reset monitoring in case something went wrong (e.g. a crash)
    configStore.set("monitoring", false);
  }

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => createWindow())
  .catch(log.error);

// macOS only
app.on("activate", () => {
  log.debug("Called activate", mainWindow == null);

  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// Expose certain information to the renderer. The keys need to get hard-coded.
ipcMain.handle("get-info", (e) => {
  if (isFromLocalhost(e))
    return {
      version: app.getVersion(),
      isMac: process.platform === "darwin",
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DEBUG_PROD: process.env.DEBUG_PROD,
        PLATFORM_URL: process.env.PLATFORM_URL,
        TRACK_EVENTS: process.env.TRACK_EVENTS,
        SERIOUS_PROTECTION: process.env.SERIOUS_PROTECTION,
        AUTO_SELECT_CAMPAIGN: process.env.AUTO_SELECT_CAMPAIGN,
        PLAYWRIGHT_TESTING: process.env.PLAYWRIGHT_TESTING,
      },
    };
});

// Handle notifications from the renderer
ipcMain.handle("show-notification", (_e, title, body) => {
  log.info(`Notification: ${title}, ${body}`);
  const notification = new Notification({
    title,
    body,
  });
  notification.show();
  notification.on("click", () => {
    log.info(`Clicking on notification, mainWindow=${mainWindow !== null}`);
    // Create window when there is none
    if (mainWindow === null) createWindow();
  });
});

// Restart the app
ipcMain.handle("restart", () => {
  app.relaunch();
  app.exit();
});

// Quit the app
ipcMain.handle("quit", () => {
  app.quit();
});

// You can ignore the steps for squirrel builds because we don't use squirrel
// https://www.electronjs.org/docs/latest/api/app#appsetloginitemsettingssettings-macos-windows

const setOpenAtLogin = (value: boolean) => {
  if (app.getLoginItemSettings().openAtLogin === value) {
    log.info(`Not updating \`openAtLogin\`, the value is already: ${value}`);
    return;
  }

  log.info(`Updating \`openAtLogin\` to: ${value}`);
  app.setLoginItemSettings({
    openAtLogin: value,
  });
};

// run once on init
setOpenAtLogin(configStore.get("openAtLogin"));

configStore.onDidChange("openAtLogin", (newValue) =>
  setOpenAtLogin(!!newValue),
);
