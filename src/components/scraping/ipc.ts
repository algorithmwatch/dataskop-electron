import { ipcRenderer } from 'electron';
import fs from 'fs';
import { GetCurrentHtml, GetHtmlFunction } from '../../providers/youtube';

// commands to communicate with the browser window in the main screen

const extractHtml = async () => {
  return ipcRenderer.invoke('scraping-get-current-html');
};

const goToUrl = async (url: string, options = {}): Promise<string> => {
  return ipcRenderer.invoke('scraping-load-url', url, options);
};

const clearStorage = () => ipcRenderer.invoke('scraping-clear-storage');

const makeGetHtml = (logHtml: boolean): GetHtmlFunction => {
  const getHtml = async (url: string): Promise<GetCurrentHtml> => {
    await goToUrl(url);
    if (logHtml) {
      const userFolder = await ipcRenderer.invoke('get-path-user-data');
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
  return ipcRenderer.invoke('scraping-get-cookies');
};

const setNavigationCallback = async (cbSlug: string, remove = false) => {
  return ipcRenderer.invoke('scraping-navigation-cb', cbSlug, remove);
};

const scrollDown = async () => {
  return ipcRenderer.invoke('scraping-scroll-down');
};

const clickElement = async (selector: string) => {
  return ipcRenderer.invoke('scraping-click-element', selector);
};

const elementExists = async (selector: string) => {
  return ipcRenderer.invoke('scraping-element-exists', selector);
};

const submitForm = async (selector: string) => {
  return ipcRenderer.invoke('scraping-submit-form', selector);
};

export {
  submitForm,
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
