/**
 * controlling the scraping window
 */

import crypto from "crypto";
import { app, BrowserView, BrowserWindow, session } from "electron";
import log from "electron-log";
import fs from "fs";
import { range } from "lodash";
import path from "path";
import unzipper from "unzipper";
import { postLoadUrlYoutube } from "./providers/youtube";
import { addMainHandler, delay, getNowString, stripNonAscii } from "./utils";

let scrapingView: BrowserView | null = null;

export const postDownloadFileProcessing = async (filePath: string) => {
  let filePathExtracted = "";

  if (filePath.endsWith(".zip")) {
    log.info("Unzipping downloaded file");

    filePathExtracted = filePath.replace(/\.zip$/, "");

    // some delay is needed to prevent a race condition
    await delay(1000);

    fs.createReadStream(filePath).pipe(
      unzipper.Extract({ path: filePathExtracted }),
    );

    // some delay is needed to prevent a race condition
    await delay(1000);
    log.info("Unzipping done. Deleting original file.");
    fs.unlinkSync(filePath);
  }
  return filePathExtracted;
};

export default function registerScrapingHandlers(mainWindow: BrowserWindow) {
  log.debug("called registerScrapingHandlers", mainWindow == null);

  // register several handlers for the scraping view

  addMainHandler(
    "scraping-init-view",
    (
      _eventInit: any,
      { muted = true, allowInput = true, persist = false }: any,
    ) => {
      log.debug(
        "called scraping-init-view",
        scrapingView == null,
        mainWindow == null,
        muted,
        allowInput,
        persist,
      );

      if (scrapingView !== null) {
        try {
          mainWindow?.removeBrowserView(scrapingView);
        } catch (error) {
          log.error("Could not remove the scraping view from the main window");
          log.error(error);
        }

        try {
          // .destroy() does indeed exists and is nesseary to fully remove the view.
          // Not calling it will result in errors with event handlers.
          scrapingView?.webContents.destroy();
        } catch (error) {
          log.error("Could not destroy the scraping view");
          log.error(error);
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

      mainWindow?.setBrowserView(newView);

      // open the debug console in dev
      // newView.webContents.openDevTools();

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
          newView.webContents.on("before-input-event", (event) =>
            event.preventDefault(),
          );
          newView.webContents.insertCSS(preventInputCss);
        });
      }

      // Download items to user data directory
      newView.webContents.session.on(
        "will-download",
        (_eventDownload, item) => {
          // Set the save path, making Electron not to prompt a save dialog.

          const filePath = path.join(
            app.getPath("userData"),
            "downloads",
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
              log.info("Download successfully");

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
    },
  );

  addMainHandler("scraping-clear-storage", async () => {
    log.info("clearing storage for scraping view");
    await session.fromPartition("scraping").clearStorageData();
    return session.fromPartition("persist:scraping").clearStorageData();
  });

  addMainHandler(
    "scraping-load-url",
    async (
      _event: any,
      url: string,
      { withHtml = false, clear = false }: any,
    ) => {
      const view = scrapingView;

      if (view == null) {
        throw new Error("scraping-load-url was called while the view is null");
      }

      if (clear) {
        view.webContents.session.clearStorageData();
      }

      // Choosing a correct user agent is important to make the login with Google.
      // 1) Using the Electron default one will fail.
      // 2) Choosing the user agent of the bundled chrome version will also fail.
      // It seems that Google knows that this is a modified version of the chrome (fingerprinting?)
      // 3) So we set to some recent Firefox user agents. This used to work from mid 2021 to Jan. 2022.
      // 4) Now we use a recent Vivaldi user agent.

      // Background:
      // https://stackoverflow.com/a/68231284/4028896
      // https://www.reddit.com/r/kde/comments/e7136e/google_bans_falkon_and_konqueror_browsers/faicv9g/
      // https://www.electronjs.org/releases/stable?version=12&page=3#12.0.0
      // https://www.whatismybrowser.com/guides/the-latest-user-agent/

      let userAgent = "Mozilla/5.0";
      if (
        process.platform === "darwin" ||
        process.platform === "win32" ||
        process.platform === "linux"
      )
        userAgent = {
          darwin:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Vivaldi/4.3",
          win32:
            "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Vivaldi/4.3",
          linux:
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Vivaldi/4.3",
        }[process.platform];

      // try 5 times and then give up

      // eslint-disable-next-line no-restricted-syntax
      for (const i of range(5)) {
        // await loadUrl(..) causes somethimes strange errors.
        try {
          await view.webContents.loadURL(url, {
            userAgent,
          });
        } catch (error) {
          log.log("There is an error with `.loadError`, retry...", error);
          await delay(2000);
          continue;
        }

        try {
          // wait until the browser is idle, wait at most 10 seconds
          // see: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
          await view.webContents.executeJavaScript(
            `new Promise(function(resolve, reject) { requestIdleCallback(() => resolve(true), { timeout: 10000 }) });`,
            true,
          );

          if (url.includes("youtube")) {
            await postLoadUrlYoutube(view);
          }

          if (withHtml) {
            const html = await view.webContents.executeJavaScript(
              "document.documentElement.outerHTML",
            );
            return html;
          }

          return null;
        } catch (error) {
          log.log("strange error, retry...");
          log.log(error);
          await delay(1000 * i);
        }
      }

      throw new Error(
        `failed at main/scraping.ts to extract html from given url: ${url}`,
      );
    },
  );

  addMainHandler("scraping-get-cookies", async () => {
    const cookies = await scrapingView?.webContents.session.cookies.get({});
    return cookies;
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

  const getCurrentHtml = async () => {
    const html = await scrapingView?.webContents.executeJavaScript(
      "document.documentElement.outerHTML",
    );
    const hash = crypto.createHash("md5").update(html).digest("hex");

    return { html, hash };
  };

  addMainHandler("scraping-get-current-html", getCurrentHtml);

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
      log.error("Could not remove the scraping view from the main window");
      log.error(error);
    }

    try {
      // .destroy() does indeed exists and is nesseary to fully remove the view.
      // Not calling it will result in errors with event handlers.
      scrapingView?.webContents.destroy();
    } catch (error) {
      log.error("Could not destroy the scraping view");
      log.error(error);
    }

    scrapingView = null;
  });

  addMainHandler(
    "scraping-set-bounds",
    async (_event: any, bounds: Electron.Rectangle) => {
      scrapingView?.setBounds(bounds);
    },
  );

  addMainHandler(
    "scraping-click-element",
    async (_event: any, selector: any) => {
      await scrapingView?.webContents.executeJavaScript(
        `document.querySelector("${selector}").click()`,
      );
    },
  );

  addMainHandler("scraping-submit-form", async (_event: any, selector: any) => {
    await scrapingView?.webContents.executeJavaScript(
      `document.querySelector("${selector}").submit()`,
    );
  });

  addMainHandler(
    "scraping-element-exists",
    async (_event: any, selector: any) => {
      return scrapingView?.webContents.executeJavaScript(
        `document.querySelector("${selector}") !== null`,
      );
    },
  );

  addMainHandler("scraping-log-html", async (_event: any, url: string) => {
    const { html, hash } = await getCurrentHtml();

    // macOS: ~/Library/Application\ Support/Electron/html
    const userFolder = app.getPath("userData");
    const userFolderHtml = path.join(userFolder, "html");

    if (!fs.existsSync(userFolderHtml)) fs.mkdirSync(userFolderHtml);

    const fn = `${getNowString()}-${stripNonAscii(url)}-${hash}.html`;
    fs.writeFileSync(path.join(userFolderHtml, fn), html);
    return { html, hash };
  });
}
