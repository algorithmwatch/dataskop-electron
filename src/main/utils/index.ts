/* eslint import/prefer-default-export: off */
import { ipcMain } from "electron";
import log from "electron-log";
import path from "path";
import { URL } from "url";

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, "../renderer/", htmlFileName)}`;
}

// Remove existing handlers for a channels before adding a new handler.
// This is very important, since occasionally the mainWindow is referenced in the
// the handler. If the window got destroyed (closed) we must not reference it.
// This caused problems with the scraping handlers before.
export const addMainHandler = (channel: string, fun: any) => {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, fun);
};

export const isFromLocalhost = (event: any) => {
  const parsedUrl = new URL(event.senderFrame.url);
  const fromLocalhost =
    parsedUrl.protocol === "http:" &&
    parsedUrl.hostname === "localhost" &&
    parsedUrl.port === "1212";

  const fromLocalFile = parsedUrl.protocol === "file:";
  const fromLocal = fromLocalhost || fromLocalFile;

  if (!fromLocal) {
    log.warn("Event wasn't sent from local.");
  }
  return fromLocal;
};
