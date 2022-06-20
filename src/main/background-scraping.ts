/**
 * Scraping in the background without executing JavaScript.
 */

import crypto from 'crypto';
import { BrowserWindow, ipcMain, session } from 'electron';

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
    return backgroundScrapingWindow.loadURL('https://google.com');
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
}
