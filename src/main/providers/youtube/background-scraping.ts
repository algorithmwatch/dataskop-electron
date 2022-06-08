/**
 * Scraping in the background without executing JavaScript.
 */

import { getVideoUrl } from '@algorithmwatch/harke';
import crypto from 'crypto';
import { BrowserWindow, ipcMain, session } from 'electron';
import fetch from 'electron-fetch';
import pLimit from 'p-limit';

let backgroundScrapingWindow: null | BrowserWindow = null;

export default function registerBackgroundScrapingHandlers() {
  ipcMain.handle('scraping-background-init', (_event) => {
    backgroundScrapingWindow = new BrowserWindow({
      show: false,
      width: 1280,
      height: 800,
      webPreferences: {
        session: session.fromPartition('background-scraping'),
        backgroundThrottling: false,
        sandbox: false,
      },
    });
    return backgroundScrapingWindow.loadURL('https://youtube.com');
  });

  ipcMain.handle('scraping-background-get-current-html', async () => {
    const html = await backgroundScrapingWindow?.webContents.executeJavaScript(
      'document.documentElement.outerHTML',
    );
    const hash = crypto.createHash('md5').update(html).digest('hex');

    return { html, hash };
  });

  ipcMain.handle(
    'scraping-background-submit-form',
    async (_event, selector) => {
      await backgroundScrapingWindow?.webContents.executeJavaScript(
        `document.querySelector("${selector}").submit()`,
      );
    },
  );

  ipcMain.handle('scraping-background-close', async (_event) => {
    return backgroundScrapingWindow?.close();
  });

  ipcMain.handle('scraping-background-videos', (_event, videoIds) => {
    async function scrapeMetaInformation(videoId: string) {
      const url = getVideoUrl(videoId);
      const ses = session.fromPartition('background-scraping');
      const res = await fetch(url, { session: ses, useSessionCookies: true });
      const html = await res.text();
      return { html, videoId };
    }

    // scraping 10 in parallel was too much
    const limit = pLimit(5);
    const output = videoIds.map((x) => limit(() => scrapeMetaInformation(x)));
    return Promise.all(output);
  });
}