import { BrowserView } from "electron";
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
    const frameHtml = await view.webContents.executeJavaScript(
      `document.getElementsByTagName('iframe')[${i}].contentWindow.document.body.outerHTML`,
    );
    htmlArr.push(frameHtml);
  }
  return htmlArr.map((x) => x.replace(/\s\s+/g, " ").trim()).join("\n\n");
};

const elementExists = async (view: BrowserView, selector: any) => {
  return view.webContents.executeJavaScript(
    `document.querySelector("${selector}") !== null`,
  );
};

const clickElement = async (
  view: BrowserView,
  selector: string,
  docIndex = 0,
) => {
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
};

export { waitUntilIdle, extractHtml, elementExists, clickElement };
