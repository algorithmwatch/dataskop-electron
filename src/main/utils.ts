/* eslint import/prefer-default-export: off */
import dayjs from "dayjs";
import { ipcMain } from "electron";
import fetch from "electron-fetch";
import log from "electron-log";
import fs from "fs";
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

// Duplicate from `renderer` to have a clear seperation.

export const stripNonAscii = (x: string) => x.replace(/[^a-z0-9]/gi, "");

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getNowString = () => dayjs().format("YYYY-MM-DD-HH-mm-ss");

// Files

export const getFileList = (dirName: string): string[] => {
  let files: string[] = [];
  const items = fs.readdirSync(dirName, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...getFileList(`${dirName}/${item.name}`)];
    } else {
      files.push(`${dirName}/${item.name}`);
    }
  }

  return files;
};

// base64

const toBase64 = (str: string) => {
  return Buffer.from(str, "utf-8").toString("base64");
};

// Networking

export const fetchBackend = async (url: string) =>
  (
    await fetch(url, {
      headers: {
        Authorization: `Basic ${toBase64(
          `user:${process.env.SERIOUS_PROTECTION}`,
        )}`,
      },
    })
  ).json();

export const postBackend = (url: string, data: any) => {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${toBase64(
        `user:${process.env.SERIOUS_PROTECTION}`,
      )}`,
    },
    body: JSON.stringify(data),
  });
};
