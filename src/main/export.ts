import { BrowserWindow, dialog, ipcMain } from 'electron';
import fetch from 'electron-fetch';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';
// import { getThumbnails } from '../renderer/utils/providers/youtube/utils';

const getThumbnails = (id: string) => {
  /**
   * Returns all thumbnails to given YT video it.
    https://yt-thumb.canbeuseful.com/en
   */

  // the first image is the `default` image.
  const small = [1, 2, 3].map(
    (x) => `https://img.youtube.com/vi/${id}/${x}.jpg`,
  );

  small.unshift(`https://img.youtube.com/vi/${id}/default.jpg`);

  const defaultImage = {
    mq: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
    hq: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    sd: `https://img.youtube.com/vi/${id}/sddefault.jpg`,
    maxRes: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
  };

  return { small, default: defaultImage };
};

async function downloadYtImage(ytId, folder) {
  const url = getThumbnails(ytId).default.maxRes;

  const res = await fetch(url);
  if (res == null) throw Error();
  const p = path.join(folder, `${ytId}.jpg`);
  const dest = fs.createWriteStream(p);
  res.body.pipe(dest);
}

export default function registerExportHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle('results-import', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (canceled) return;

    filePaths.forEach(async (x) => {
      const data = await fs.promises.readFile(x, 'utf8');
      event.sender.send('results-import-data', data);
    });
  });

  ipcMain.handle('results-export', async (_event, data, filename) => {
    if (mainWindow === null) return;
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
    });
    if (canceled || !filePath) return;
    fs.writeFileSync(filePath, data);
  });

  ipcMain.handle(
    'results-export-images',
    async (_event, ytIds: string[], filename) => {
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

  ipcMain.handle('results-save-screenshot', async (_event, rect, filename) => {
    if (mainWindow === null) return;
    const nativeImage = await mainWindow.webContents.capturePage(rect);
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
    });
    if (canceled || !filePath) return;
    fs.writeFileSync(filePath, nativeImage.toPNG());
  });
}
