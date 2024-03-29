import { contextBridge, ipcRenderer } from "electron";
import log from "electron-log";

// export main functions to renderer
// main.ts
const mainChannels = [
  "show-renderer-error-modal",
  "get-info",
  "close-main-window",
  "update-check-beta",
  "update-restart-app",
  "show-notification",
  "restart",
  "quit",
];

const monitoringChannels = ["monitoring-done"];

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
];

const downloadsChannels = [
  "downloads-get",
  "downloads-clear",
  "downloads-import",
];

// background-scraping.ts
const backgroundScrapingChannels = [
  "passive-scraping-browser-init",
  "passive-scraping-browser-get-current-html",
  "passive-scraping-browser-submit-form",
  "passive-scraping-browser-close",
];

// export.ts
const exportChannels = [
  "results-import",
  "results-export",
  "export-screenshot",
  "export-debug-archive",
  "export-file-infos",
  "export-remove-debug-files",
  "export-remove-all-files",
];

// db.ts
const dbChannels = [
  "db-read",
  "db-write",
  "db-get-config",
  "db-set-config",
  "db-get-lookups",
  "db-set-lookups",
  "db-clear-lookups",
  "db-get-all-stati",
];

const youtubeChannels = [
  "youtube-results-export-images",
  "youtube-passive-scraping-browser-videos",
  "google-takout-youtube-scrape-watched-videos",
  "google-takout-youtube-use-data",
  "google-takout-youtube-data-export",
];

const tiktokChannels = [
  "tiktok-scrape-videos",
  "tiktok-scrape-author-avatars",
  "tiktok-data-upload",
  "tiktok-data-export",
  "tiktok-eligible-to-donate",
];

// whitelist certain channels for certain action
const validInvokeChannels = mainChannels.concat(
  monitoringChannels,
  scrapingChannels,
  downloadsChannels,
  backgroundScrapingChannels,
  exportChannels,
  dbChannels,
  youtubeChannels,
  tiktokChannels,
);
const validOnChannels = [
  "scraping-navigation-happened",
  "scraping-download-started",
  "scraping-download-progress",
  "scraping-download-done",
  "close-action",
  "update-available",
  "update-downloaded",
  "update-check-done",
  "set-progress",
];
const validremoveAllChannels = ["close-action"];

contextBridge.exposeInMainWorld("electron", {
  log: log.scope("renderer"),
  ipc: {
    on(channel: string, func: (arg0: any) => void) {
      if (validOnChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (_event, ...args) => func(...args));
      } else {
        log.warn(
          `The channel is not included in the list of valid options: ${channel}`,
        );
      }
    },
    once(channel: string, func: (arg0: any) => void) {
      if (validOnChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (_event, ...args) => func(...args));
      } else {
        log.warn(
          `The channel is not included in the list of valid options: ${channel}`,
        );
      }
    },
    invoke: (channel: string, ...args: any) => {
      if (validInvokeChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      log.warn(
        `The channel is not included in the list of valid options: ${channel}`,
      );
      return null;
    },
    removeListener: (channel: string, ...args: any) => {
      if (validOnChannels.includes(channel)) {
        return ipcRenderer.removeListener(channel, ...args);
      }
      log.warn(
        `The channel is not included in the list of valid options: ${channel}`,
      );
      return null;
    },
    removeAllListeners: (channel: string, ...args: any) => {
      if (validremoveAllChannels.includes(channel)) {
        return ipcRenderer.removeAllListeners(channel, ...args);
      }
      log.warn(
        `The channel is not included in the list of valid options: ${channel}`,
      );
      return null;
    },
  },
});
