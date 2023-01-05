import { GetCurrentHtml, GetHtmlFunction } from "renderer/providers/types";

// commands to communicate with the browser window in the main screen

const extractHtml = (htmlLogging = false) => {
  return window.electron.ipc.invoke("scraping-get-current-html", htmlLogging);
};

const goToUrl = (url: string): Promise<string> => {
  return window.electron.ipc.invoke("scraping-load-url", url);
};

const clearStorage = () => window.electron.ipc.invoke("scraping-clear-storage");

const makeGetHtml = (htmlLogging: boolean): GetHtmlFunction => {
  const getHtml = async (url: string): Promise<GetCurrentHtml> => {
    await goToUrl(url);
    return () => extractHtml(htmlLogging);
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
