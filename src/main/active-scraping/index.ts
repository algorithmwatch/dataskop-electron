/**
 * Controlling the scraping window
 */

import crypto from "crypto";
import { app, BrowserView, BrowserWindow, session } from "electron";
import log from "electron-log";
import fs from "fs";
import _ from "lodash";
import path from "path";
import { stripNonAscii } from "../../shared/utils/strings";
import { delay, getNowString } from "../../shared/utils/time";
import { DOWNLOADS_FOLDER, postDownloadFileProcessing } from "../downloads";
import { postloadTiktok } from "../providers/tiktok/data-gathering";
import { postLoadYoutube } from "../providers/youtube/data-gathering";
import { addMainHandler } from "../utils";
import {
  clickElement,
  elementExists,
  extractHtml,
  waitUntilIdle,
} from "./inject";
import { getUserAgent } from "./user-agent";

let scrapingView: BrowserView | null = null;

export const HTML_FOLDER = path.join(app.getPath("userData"), "html");

// Register several handlers for the scraping view
export default function registerScrapingHandlers(mainWindow: BrowserWindow) {
  log.debug(
    `Called registerScrapingHandlers, mainWindow: ${mainWindow !== null}`,
  );

  addMainHandler(
    "scraping-init-view",
    async (
      _eventInit: any,
      {
        muted = true,
        allowInput = true,
        persist = false,
        visibleWindow = false,
        openDevTools = false,
      }: any,
    ) => {
      log.debug(
        `Called scraping-init-view ${JSON.stringify({
          scrapingView: !!scrapingView,
          mainWindow: !!mainWindow,
          muted,
          allowInput,
          persist,
          visibleWindow,
        })}`,
      );

      if (scrapingView !== null) {
        try {
          mainWindow?.removeBrowserView(scrapingView);
        } catch (error) {
          log.error(
            `Could not remove the scraping view from the main window ${error}`,
          );
        }

        try {
          // .destroy() does indeed exists and is nesseary to fully remove the view.
          // Not calling it will result in errors with event handlers.
          scrapingView?.webContents.destroy();
        } catch (error) {
          log.error(
            `Could not remove the scraping view from the main window ${error}`,
          );
        }
      }

      // Don't do string interpolation for partition.
      const partition = persist ? "persist:scraping" : "scraping";
      const newView = new BrowserView({
        webPreferences: {
          partition,
          backgroundThrottling: false,
        },
      });

      /*
      Set some CSP headers to disallow what content can get executed in the scraping window.
      1) 'unsafe-eval' is required to execute custom JavaScript in the scraper
      view. When not allowed it, the browser view ist not using a custom user
      agent (that is required to for scraping).

      2) Allow all HTTPS traffic since platforms rely on various internal services.

      3) Frames and nested frames can ony be loaded from https resources.
      Tiktok was using a nested iframe with a custem uri scheme "bytedate://xxx".
      On windows, this caused a modal that no app was found to open the uri "bytedance".
      */

      session
        .fromPartition(partition)
        .webRequest.onHeadersReceived((details, callback) => {
          callback({
            responseHeaders: {
              ...details.responseHeaders,
              "Content-Security-Policy": [
                "script-src 'self' 'unsafe-eval' 'unsafe-inline' https: ; frame-src 'self' https: ; frame-ancestors 'self' https:",
              ],
            },
          });
        });

      mainWindow?.setBrowserView(newView);

      // Prevent new windows and instead use the scraping window
      newView.webContents.setWindowOpenHandler(({ url }) => {
        log.info(
          `Not opening a new window for ${url} and reusing scraping window instead`,
        );
        newView.webContents.loadURL(url, {
          userAgent: getUserAgent(process.platform),
        });

        return { action: "deny" };
      });

      // Open the debug console in the scraping window
      if (openDevTools) {
        newView.webContents.openDevTools();
      }

      if (muted) newView.webContents?.setAudioMuted(true);

      if (!allowInput) {
        const preventInputCss =
          "html, body { pointer-events: none; height: 100%; overflow-y: hidden;}";

        newView.webContents.on("before-input-event", (event) =>
          event.preventDefault(),
        );
        newView.webContents.insertCSS(preventInputCss);

        // Not sure if this is necessary but better to disable user input asap (before did-finish-load fires)
        newView.webContents.on("did-finish-load", () => {
          newView.webContents.insertCSS(preventInputCss);
        });
      }

      // Download items to user data directory
      newView.webContents.session.on(
        "will-download",
        (_eventDownload, item) => {
          // Set the save path, making Electron not to prompt a save dialog.
          const filePath = path.join(
            DOWNLOADS_FOLDER,
            getNowString(),
            item.getFilename(),
          );
          item.setSavePath(filePath);

          mainWindow.webContents.send("scraping-download-started");

          item.on("updated", (_event, state) => {
            if (state === "interrupted") {
              log.info("Download is interrupted but can be resumed");
            } else if (state === "progressing") {
              if (item.isPaused()) {
                log.info("Download is paused");
              } else {
                log.info(`Received bytes: ${item.getReceivedBytes()}`);
                mainWindow.webContents.send(
                  "scraping-download-progress",
                  item.getReceivedBytes(),
                );
              }
            }
          });

          let filePathExtracted = "";

          item.once("done", async (_event, state) => {
            if (state === "completed") {
              log.info(`Download successfully: ${filePath}`);

              try {
                filePathExtracted = await postDownloadFileProcessing(filePath);
              } catch (error) {
                log.error(error);
                mainWindow.webContents.send(
                  "scraping-download-done",
                  false,
                  "",
                );
              }
            } else {
              log.info(`Download failed: ${state}`);
            }
            mainWindow.webContents.send(
              "scraping-download-done",
              state === "completed",
              filePathExtracted,
            );
          });
        },
      );

      scrapingView = newView;
      log.info("Scraping view was successfully initalized");
    },
  );

  addMainHandler("scraping-clear-storage", async () => {
    log.info("Clearing storage for scraping view");
    await session.fromPartition("scraping").clearStorageData();
    return session.fromPartition("persist:scraping").clearStorageData();
  });

  addMainHandler("scraping-load-url", async (_event: any, url: string) => {
    const view = scrapingView;

    // try 5 times and then give up
    for (const i of _.range(5)) {
      try {
        if (view == null || view.webContents == null) {
          log.warn("Aborting `scraping-load-url` because the view is faulty");
          return false;
        }
        await view.webContents.loadURL(url, {
          userAgent: getUserAgent(process.platform),
        });
      } catch (error) {
        log.log("There is an error with `.loadError`, retry...", error);
        await delay(2000);
        continue;
      }

      try {
        await waitUntilIdle(view);

        if (url.includes("youtube")) {
          await postLoadYoutube(view);
        }

        if (url.includes("tiktok")) {
          await postloadTiktok(view);
        }

        // success
        return true;
      } catch (error) {
        log.log(`strange error, retry...${error}`);
        await delay(1000 * i);
      }
    }

    throw new Error(
      `failed at main/scraping.ts to extract html from given url: ${url}`,
    );
  });

  addMainHandler("scraping-get-cookies", () => {
    return scrapingView?.webContents.session.cookies.get({});
  });

  addMainHandler("scraping-get-url", () => scrapingView?.webContents.getURL());

  addMainHandler(
    "scraping-navigation-cb",
    async (_event: any, cbSlug: string, remove = false) => {
      const view = scrapingView;

      // TODO: find a better event?
      const navEvent = "page-title-updated";
      const cb = () => {
        mainWindow.webContents.send(cbSlug);
      };

      if (remove) {
        view?.webContents.removeListener(navEvent, cb);
      } else {
        view?.webContents.on(navEvent, cb);
      }
    },
  );

  addMainHandler(
    "scraping-get-current-html",
    async (_event: any, htmlLogging = false) => {
      if (scrapingView == null)
        throw new Error("Scraping view is not initialized!");

      await waitUntilIdle(scrapingView);

      const html = await extractHtml(scrapingView);
      const hash = crypto.createHash("md5").update(html).digest("hex");

      if (htmlLogging) {
        if (!fs.existsSync(HTML_FOLDER)) fs.mkdirSync(HTML_FOLDER);
        const url = scrapingView.webContents.getURL();
        const fn = `${getNowString()}-${stripNonAscii(url)}-${hash}.html`;
        fs.writeFileSync(path.join(HTML_FOLDER, fn), html);
      }

      return { html, hash };
    },
  );

  addMainHandler("scraping-scroll-down", async () => {
    await scrapingView?.webContents.executeJavaScript(
      "window.scrollBy(0, 100);",
    );
  });

  addMainHandler("scraping-set-muted", async (_event: any, muted: boolean) => {
    await scrapingView?.webContents.setAudioMuted(muted);
  });

  addMainHandler("scraping-remove-view", async () => {
    if (scrapingView === null) return;

    try {
      mainWindow?.removeBrowserView(scrapingView);
    } catch (error) {
      log.error(
        `Could not remove the scraping view from the main window: ${error}`,
      );
    }

    try {
      // .destroy() does indeed exists and is nesseary to fully remove the view.
      // Not calling it will result in errors with event handlers.
      scrapingView?.webContents.destroy();
    } catch (error) {
      log.error(`Could not destroy the scraping view ${error}`);
    }

    scrapingView = null;
  });

  addMainHandler(
    "scraping-set-bounds",
    async (_event: any, bounds: Electron.Rectangle) => {
      log.info(
        `Set bound of scraping view to ${JSON.stringify(bounds)},  ${
          scrapingView !== null
        }`,
      );

      scrapingView?.setBounds(bounds);
    },
  );

  addMainHandler("scraping-submit-form", async (_event: any, selector: any) => {
    await scrapingView?.webContents.executeJavaScript(
      `document.querySelector("${selector}").submit()`,
    );
  });

  addMainHandler(
    "scraping-element-exists",
    async (
      _event: any,
      selector: string,
      shadowSelector: string | null = null,
    ) => {
      if (scrapingView)
        return elementExists(scrapingView, selector, shadowSelector);
    },
  );

  addMainHandler(
    "scraping-click-element",
    async (
      _event: any,
      selector: any,
      docIndex = 0,
      shadowSelector: null | string = null,
    ) => {
      if (scrapingView)
        return clickElement(scrapingView, selector, docIndex, shadowSelector);
    },
  );
}
