/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { ipcMain } from 'electron';
import path from 'path';
import { URL } from 'url';

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

// Remove existing handlers for a channels before adding a new handler.
// This is very important, since occasionally the mainWindow is referenced in the
// the handler. If the window got destroyed (closed) we must not reference it.
// This caused problems with the scraping handlers before.
export const addMainHandler = (channel: string, fun: any) => {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, fun);
};
