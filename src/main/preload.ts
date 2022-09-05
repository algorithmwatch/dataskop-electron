import { contextBridge, ipcRenderer } from "electron";
import log from "electron-log";

// export main functions to renderer
// main.ts
const mainChannels = [
  "get-version-number",
  "get-env",
  "close-main-window",
  "update-check-beta",
  "update-restart-app",
  "show-notification",
];

// scraping.ts
const scrapingChannels = [
  "scraping-init-view",
  "scraping-clear-storage",
  "scraping-load-url",
  "scraping-get-cookies",
  "scraping-get-url",
  "scraping-navigation-cb",
  "scraping-get-current-html",
  "scraping-scroll-down",
  "scraping-set-muted",
  "scraping-remove-view",
  "scraping-set-bounds",
  "scraping-click-element",
  "scraping-submit-form",
  "scraping-element-exists",
  "scraping-log-html",
];

// background-scraping.ts
const backgroundScrapingChannels = [
  "scraping-background-init",
  "scraping-background-get-current-html",
  "scraping-background-submit-form",
  "scraping-background-close",
];

// export.ts
const exportChannels = [
  "results-import",
  "results-export",
  "results-save-screenshot",
  "export-debug-archive",
  "export-debug-size",
  "export-debug-clean",
  "import-files",
];

// db.ts
const dbChannels = ["db-read", "db-write", "db-get-config", "db-set-config"];

const youtubeChannels = [
  "youtube-results-export-images",
  "youtube-scraping-background-videos",
];

// whitelist certain channels for certain action
const validInvokeChannels = mainChannels.concat(
  scrapingChannels,
  backgroundScrapingChannels,
  exportChannels,
  dbChannels,
  youtubeChannels,
);
const validOnChannels = [
  "scraping-navigation-happened",
  "scraping-download-started",
  "scraping-download-progress",
  "scraping-download-done",
  "close-action",
  "update-available",
  "update-downloaded",
  "update-error",
];
const validremoveAllChannels = [
  "update-available",
  "update-downloaded",
  "close-action",
];

contextBridge.exposeInMainWorld("electron", {
  log: log.functions,
  ipc: {
    on(channel: string, func: (arg0: any) => void) {
      if (validOnChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (_event, ...args) => func(...args));
      } else {
        log.warn(
          "The channel is not included in the list of valid options: ",
          channel,
        );
      }
    },
    invoke: (channel: string, ...args: any) => {
      if (validInvokeChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      log.warn(
        "The channel is not included in the list of valid options: ",
        channel,
      );
      return null;
    },
    removeListener: (channel: string, ...args: any) => {
      if (validOnChannels.includes(channel)) {
        return ipcRenderer.removeListener(channel, ...args);
      }
      log.warn(
        "The channel is not included in the list of valid options: ",
        channel,
      );
      return null;
    },
    removeAllListeners: (channel: string, ...args: any) => {
      if (validremoveAllChannels.includes(channel)) {
        return ipcRenderer.removeAllListeners(channel, ...args);
      }
      log.warn(
        "The channel is not included in the list of valid options: ",
        channel,
      );
      return null;
    },
  },
});