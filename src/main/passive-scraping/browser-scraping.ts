/**
 * Scraping in the background with a browser (executing JavaScript)
 */

import crypto from "crypto";
import { BrowserWindow, session } from "electron";
import { addMainHandler } from "../utils";

let backgroundScrapingWindow: null | BrowserWindow = null;

export default function registerPassiveScrapingBrowserHandlers() {
  addMainHandler("passive-scraping-browser-init", () => {
    backgroundScrapingWindow = new BrowserWindow({
      show: false,
      width: 1280,
      height: 800,
      webPreferences: {
        session: session.fromPartition("background-scraping"),
        backgroundThrottling: false,
        sandbox: false,
      },
    });
    return backgroundScrapingWindow.loadURL("https://google.com");
  });

  addMainHandler("passive-scraping-browser-get-current-html", async () => {
    const html = await backgroundScrapingWindow?.webContents.executeJavaScript(
      "document.documentElement.outerHTML",
    );
    const hash = crypto.createHash("md5").update(html).digest("hex");

    return { html, hash };
  });

  addMainHandler(
    "passive-scraping-browser-submit-form",
    async (_event: any, selector: any) => {
      await backgroundScrapingWindow?.webContents.executeJavaScript(
        `document.querySelector("${selector}").submit()`,
      );
    },
  );

  addMainHandler("passive-scraping-browser-close", async () => {
    return backgroundScrapingWindow?.close();
  });
}
