const { contextBridge, ipcRenderer } = require('electron');

// expose logging to renderer
const log = require('electron-log');
const path = require('path/posix');

// export main functions to renderer
// main.ts
const mainChannels = [
  'check-beta-update',
  'get-version-number',
  'get-env',
  'get-path-user-data',
  'restart_app',
  'close-main-window',
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
];

// background-scraping.ts
const backgroundScrapingChannels = [
  'scraping-background-init',
  'scraping-background-get-current-html',
  'scraping-background-submit-form',
  'scraping-background-close',
  'scraping-background-videos',
];

// export.ts
const exportChannels = [
  'results-import',
  'results-export',
  'results-export-images',
  'results-save-screenshot',
];

// db.ts
const dbChannels = ['db-read', 'db-write'];

// whitelist certain channels for certain action
const validInvokeChannels = [].concat(
  mainChannels,
  scrapingChannels,
  backgroundScrapingChannels,
  exportChannels,
  dbChannels,
);
const validOnChannels = ['scraping-navigation-happened', 'close-action'];
const validremoveAllChannels = [
  'update_available',
  'update_downloaded',
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
