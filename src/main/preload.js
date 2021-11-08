const { contextBridge, ipcRenderer } = require('electron');

// expose logging to renderer
const log = require('electron-log');
const path = require('path/posix');
const { removeAllListeners } = require('process');
window.log = log.functions;

// export main functions to renderer
// main.ts
const mainChannels = [
  'check-beta-update',
  'get-version-number',
  'get-path-user-data',
  'restart_app',
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
  'save-screenshot',
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
const validCallbackChannels = ['scraping-navigation-happened'];
const validremoveAllChannels = ['update_available', 'update_downloaded'];

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on(channel, func) {
      if (validCallbackChannels.includes(channel)) {
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
      if (validCallbackChannels.includes(channel)) {
        return ipcRenderer.removeListener(channel, ...args);
      }
    },
    removeAllListeners: (channel, ...args) => {
      if (validremoveAllChannels.includes(channel)) {
        return ipcRenderer.removeAllListeners(channel, ...args);
      }
    },
  },
  // Unclear why, but the .env object needs to get deserialized
  procEnv: JSON.stringify(process.env),
});