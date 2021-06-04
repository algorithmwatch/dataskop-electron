import { ipcRenderer } from 'electron';
import log from 'electron-log';
import zlib from 'zlib';
import { GetCurrentHtml, GetHtmlFunction } from '../../providers/youtube';

// commands to communicate with the browser window in the main screen

const extractHtml = async () => {
  return ipcRenderer.invoke('scraping-get-current-html');
};

const goToUrl = async (url: string, options = {}): Promise<string> => {
  return ipcRenderer.invoke('scraping-load-url', url, options);
};

const makeGetHtml = (logHtml: boolean): GetHtmlFunction => {
  const getHtml = async (url: string): Promise<GetCurrentHtml> => {
    await goToUrl(url);
    if (logHtml) {
      return async () => {
        const html = await extractHtml();

        const compressed = zlib.deflateSync(html).toString('base64');

        log.info(url, compressed);
        return html;
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

const clickElement = async (selector) => {
  return ipcRenderer.invoke('scraping-click-element', selector);
};

export {
  makeGetHtml,
  getCookies,
  setNavigationCallback,
  scrollDown,
  extractHtml,
  goToUrl,
  clickElement,
};
