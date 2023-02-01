import { BrowserView } from "electron";
import log from "electron-log";
import _ from "lodash";

/**
 * Wait until the browser is idle, wait at most 10 seconds
 * see: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
 *
 * @param view
 * @returns
 */
const waitUntilIdle = (view: BrowserView): Promise<void> => {
  return view.webContents.executeJavaScript(
    `new Promise(function(resolve, reject) { requestIdleCallback(() => resolve(true), { timeout: 10000 }) });`,
    true,
  );
};

const extractHtml = async (view: BrowserView): Promise<string> => {
  const html = await view.webContents.executeJavaScript(
    "document.documentElement.outerHTML",
  );
  const numIframes = await view.webContents.executeJavaScript(
    "document.getElementsByTagName('iframe').length",
  );

  const htmlArr = [html];
  for (const i of _.range(numIframes)) {
    try {
      const frameHtml = await view.webContents.executeJavaScript(
        `document.getElementsByTagName('iframe')[${i}].contentWindow.document.body.outerHTML`,
      );
      htmlArr.push(frameHtml);
    } catch (err) {
      log.info(`Could not read the content from the iframe: ${i}`);
    }
  }
  return htmlArr.map((x) => x.replace(/\s\s+/g, " ").trim()).join("\n\n");
};

const elementExists = async (
  view: BrowserView,
  selector: any,
  shadowSelector: null | string = null,
) => {
  try {
    if (shadowSelector === null)
      return await view.webContents.executeJavaScript(
        `document.querySelector("${selector}") !== null`,
      );

    return await view.webContents.executeJavaScript(
      `document.querySelector("${selector}").shadowRoot.querySelector("${shadowSelector}") !== null`,
    );
  } catch (error) {
    log.info(`elementExists error: ${error}`);
    return false;
  }
};

const clickElement = async (
  view: BrowserView,
  selector: string,
  docIndex = 0,
  shadowSelector: null | string = null,
) => {
  try {
    if (shadowSelector !== null)
      return await view.webContents.executeJavaScript(
        `document.querySelector("${selector}").shadowRoot.querySelector("${shadowSelector}").click()`,
      );

    if (docIndex === 0) {
      await view.webContents.executeJavaScript(
        `document.querySelector("${selector}").click()`,
      );
    } else {
      await view.webContents.executeJavaScript(
        `document.getElementsByTagName('iframe')[${
          docIndex - 1
        }].contentWindow.document.querySelector("${selector}").click()`,
      );
    }
  } catch (error) {
    log.info(`clickElement error: ${error}`);
  }
};

export { waitUntilIdle, extractHtml, elementExists, clickElement };
