import fs from 'fs';
import { GetCurrentHtml, GetHtmlFunction } from 'renderer/providers/types';

// commands to communicate with the browser window in the main screen

const extractHtml = async () => {
  return window.electron.ipcRenderer.invoke('scraping-get-current-html');
};

const goToUrl = async (url: string, options = {}): Promise<string> => {
  return window.electron.ipcRenderer.invoke('scraping-load-url', url, options);
};

const clearStorage = () =>
  window.electron.ipcRenderer.invoke('scraping-clear-storage');

const makeGetHtml = (logHtml: boolean): GetHtmlFunction => {
  const getHtml = async (url: string): Promise<GetCurrentHtml> => {
    await goToUrl(url);
    if (logHtml) {
      // FIXME: This branch is not working due to new sandboxing.
      const userFolder = await window.electron.ipcRenderer.invoke(
        'get-path-user-data',
      );
      // on macOS: ~/Library/Application Support/Electron/html
      return async () => {
        const { html, hash } = await extractHtml();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        !fs.existsSync(`${userFolder}/html`) &&
          fs.mkdirSync(`${userFolder}/html`);

        const fn = `${url.replace(/[^a-z0-9]/gi, '')}.html`;
        fs.writeFileSync(`${userFolder}/html/${fn}`, html);

        return { html, hash };
      };
    }
    return extractHtml;
  };
  return getHtml;
};

const getCookies = async (): Promise<Array<unknown>> => {
  return window.electron.ipcRenderer.invoke('scraping-get-cookies');
};

const setNavigationCallback = async (cbSlug: string, remove = false) => {
  return window.electron.ipcRenderer.invoke(
    'scraping-navigation-cb',
    cbSlug,
    remove,
  );
};

const scrollDown = async () => {
  return window.electron.ipcRenderer.invoke('scraping-scroll-down');
};

const clickElement = async (selector: string) => {
  return window.electron.ipcRenderer.invoke('scraping-click-element', selector);
};

const elementExists = async (selector: string) => {
  return window.electron.ipcRenderer.invoke(
    'scraping-element-exists',
    selector,
  );
};

const submitFormScraping = async (selector: string) => {
  return window.electron.ipcRenderer.invoke('scraping-submit-form', selector);
};

export {
  submitFormScraping,
  clearStorage,
  makeGetHtml,
  getCookies,
  setNavigationCallback,
  scrollDown,
  extractHtml,
  goToUrl,
  clickElement,
  elementExists,
};
