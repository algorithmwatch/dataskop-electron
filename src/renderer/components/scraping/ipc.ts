import { GetCurrentHtml, GetHtmlFunction } from "renderer/providers/types";

// commands to communicate with the browser window in the main screen

const extractHtml = () => {
  return window.electron.ipc.invoke("scraping-get-current-html");
};

const goToUrl = (url: string, options = {}): Promise<string> => {
  return window.electron.ipc.invoke("scraping-load-url", url, options);
};

const clearStorage = () => window.electron.ipc.invoke("scraping-clear-storage");

const makeGetHtml = (htmlLogging: boolean): GetHtmlFunction => {
  const getHtml = async (url: string): Promise<GetCurrentHtml> => {
    await goToUrl(url);
    if (htmlLogging)
      return () => window.electron.ipc.invoke("scraping-log-html", url);
    return extractHtml;
  };
  return getHtml;
};

const getCookies = (): Promise<Array<unknown>> => {
  return window.electron.ipc.invoke("scraping-get-cookies");
};

const setNavigationCallback = (cbSlug: string, remove = false) => {
  return window.electron.ipc.invoke("scraping-navigation-cb", cbSlug, remove);
};

const scrollDown = () => {
  return window.electron.ipc.invoke("scraping-scroll-down");
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
