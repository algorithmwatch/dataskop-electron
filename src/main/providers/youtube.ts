/**
 * Youtube specific code for main.
 */

import { getThumbnails, getVideoUrl } from '@algorithmwatch/harke';
import { BrowserWindow, dialog, session } from 'electron';
import fetch from 'electron-fetch';
import log from 'electron-log';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';
import { addMainHandler } from '../utils';

export default function registerYoutubeHandlers(mainWindow: BrowserWindow) {
  addMainHandler(
    'youtube-scraping-background-videos',
    (_event: any, videoIds: any[]) => {
      async function scrapeMetaInformation(videoId: string) {
        const url = getVideoUrl(videoId);
        const ses = session.fromPartition('background-scraping');
        const res = await fetch(url, { session: ses, useSessionCookies: true });
        const html = await res.text();
        return { html, videoId };
      }

      // scraping 10 in parallel was too much
      const limit = pLimit(5);
      const output = videoIds.map((x: string) =>
        limit(() => scrapeMetaInformation(x)),
      );
      return Promise.all(output);
    },
  );

  addMainHandler(
    'youtube-results-export-images',
    async (_event: any, ytIds: string[], filename: any) => {
      async function downloadYtImage(ytId: string, folder: string) {
        const url = getThumbnails(ytId).default.maxRes;

        const res = await fetch(url);
        if (res == null) throw Error();
        const p = path.join(folder, `${ytId}.jpg`);
        const dest = fs.createWriteStream(p);
        res.body.pipe(dest);
      }

      if (mainWindow === null) return;
      const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: filename,
      });
      if (canceled || !filePath) return;

      if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

      const limit = pLimit(10);
      const input = ytIds.map((x) => limit(() => downloadYtImage(x, filePath)));
      await Promise.all(input);
    },
  );
}

export const postLoadUrlYoutube = async (
  view: Electron.CrossProcessExports.BrowserView,
) => {
  // pause videos right after rendering, import to not alter the HTML for the hash check
  try {
    await view.webContents.executeJavaScript(
      "const awThePlayer = document.querySelector('.html5-video-player'); if(awThePlayer != null) awThePlayer.click();",
    );
  } catch (e) {
    log.log(e);
  }
};
