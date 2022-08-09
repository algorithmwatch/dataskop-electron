import { GetCurrentHtml, GetHtmlFunction } from 'renderer/providers/types';

// commands to communicate with the browser window in the main screen

const extractHtml = () => {
  return window.electron.ipcRenderer.invoke('scraping-get-current-html');
};

const goToUrl = (url: string, options = {}): Promise<string> => {
  return window.electron.ipcRenderer.invoke('scraping-load-url', url, options);
};

const clearStorage = () =>
  window.electron.ipcRenderer.invoke('scraping-clear-storage');

const makeGetHtml = (logHtml: boolean): GetHtmlFunction => {
  const getHtml = async (url: string): Promise<GetCurrentHtml> => {
    await goToUrl(url);
    if (logHtml)
      return () => window.electron.ipcRenderer.invoke('scraping-log-html', url);
    return extractHtml;
  };
  return getHtml;
};

const getCookies = (): Promise<Array<unknown>> => {
  return window.electron.ipcRenderer.invoke('scraping-get-cookies');
};

const setNavigationCallback = (cbSlug: string, remove = false) => {
  return window.electron.ipcRenderer.invoke(
    'scraping-navigation-cb',
    cbSlug,
    remove,
  );
};

const scrollDown = () => {
  return window.electron.ipcRenderer.invoke('scraping-scroll-down');
};

export {
  clearStorage,
  makeGetHtml,
  getCookies,
  setNavigationCallback,
  scrollDown,
  extractHtml,
  goToUrl,
};
