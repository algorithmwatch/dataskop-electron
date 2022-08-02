const { contextBridge, ipcRenderer } = require('electron');

// expose logging to renderer
const log = require('electron-log');
const path = require('path/posix');

// export main functions to renderer
// main.ts
const mainChannels = [
  'get-version-number',
  'get-env',
  'close-main-window',
  'update-check-beta',
  'update-restart-app',
  'update-available',
  'update-downloaded',
  'update-error',
];

// scraping.ts
const scrapingChannels = [
  'scraping-init-view',
  'scraping-clear-storage',
  'scraping-load-url',
  'scraping-get-cookies',
  'scraping-get-url',
  'scraping-navigation-cb',
  'scraping-get-current-html',
  'scraping-scroll-down',
  'scraping-set-muted',
  'scraping-remove-view',
  'scraping-set-bounds',
  'scraping-click-element',
  'scraping-submit-form',
  'scraping-element-exists',
  'scraping-log-html',
];

// background-scraping.ts
const backgroundScrapingChannels = [
  'scraping-background-init',
  'scraping-background-get-current-html',
  'scraping-background-submit-form',
  'scraping-background-close',
];

// export.ts
const exportChannels = [
  'results-import',
  'results-export',
  'results-save-screenshot',
  'export-debug-archive',
  'export-debug-size',
  'export-debug-clean',
];

// db.ts
const dbChannels = ['db-read', 'db-write'];

const youtubeChannels = [
  'youtube-results-export-images',
  'youtube-scraping-background-videos',
];

// whitelist certain channels for certain action
const validInvokeChannels = [].concat(
  mainChannels,
  scrapingChannels,
  backgroundScrapingChannels,
  exportChannels,
  dbChannels,
  youtubeChannels,
);
const validOnChannels = ['scraping-navigation-happened', 'close-action'];
const validremoveAllChannels = [
  'update-available',
  'update-downloaded',
  'close-action',
];

contextBridge.exposeInMainWorld('electron', {
  log: log.functions,
  ipcRenderer: {
    on(channel, func) {
      if (validOnChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    invoke: (channel, ...args) => {
      if (validInvokeChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
    },
    removeListener: (channel, ...args) => {
      if (validOnChannels.includes(channel)) {
        return ipcRenderer.removeListener(channel, ...args);
      }
    },
    removeAllListeners: (channel, ...args) => {
      if (validremoveAllChannels.includes(channel)) {
        return ipcRenderer.removeAllListeners(channel, ...args);
      }
    },
  },
});
