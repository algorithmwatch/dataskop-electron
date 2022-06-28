/**
 * Scraping in the background without executing JavaScript.
 */

import { getThumbnails, getVideoUrl } from '@algorithmwatch/harke';
import { BrowserWindow, dialog, session } from 'electron';
import fetch from 'electron-fetch';
import pLimit from 'p-limit';
import path from 'path';

import fs from 'fs';
import { addMainHandler } from '../util';

export default function registerYoutubeHandlers(mainWindow: BrowserWindow) {
  addMainHandler('youtube-scraping-background-videos', (_event, videoIds) => {
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

  addMainHandler(
    'youtube-results-export-images',
    async (_event, ytIds: string[], filename) => {
      async function downloadYtImage(ytId, folder) {
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
      console.log(ytIds);
      const input = ytIds.map((x) => limit(() => downloadYtImage(x, filePath)));
      await Promise.all(input);
    },
  );
}
