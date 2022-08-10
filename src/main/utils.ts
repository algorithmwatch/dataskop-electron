/* eslint import/prefer-default-export: off */
import dayjs from 'dayjs';
import { ipcMain } from 'electron';
import path from 'path';
import { URL } from 'url';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

// Remove existing handlers for a channels before adding a new handler.
// This is very important, since occasionally the mainWindow is referenced in the
// the handler. If the window got destroyed (closed) we must not reference it.
// This caused problems with the scraping handlers before.
export const addMainHandler = (channel: string, fun: any) => {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, fun);
};

// Duplicate from `renderer` to have a clear seperation.

export const stripNonAscii = (x: string) => x.replace(/[^a-z0-9]/gi, '');

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getNowString = () => dayjs().format('YYYY-MM-DD-HH-mm-ss');
