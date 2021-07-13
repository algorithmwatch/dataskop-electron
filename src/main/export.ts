import { BrowserWindow, dialog, ipcMain } from 'electron';
import fetch from 'electron-fetch';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';
import { getThumbnails } from '../providers/youtube/utils';

async function downloadYtImage(ytId, folder) {
  const url = getThumbnails(ytId).default.maxRes;

  const res = await fetch(url);
  if (res == null) throw Error();
  const p = path.join(folder, `${ytId}.jpg`);
  const dest = fs.createWriteStream(p);
  res.body.pipe(dest);

  // const buffer = await response.buffer();
  // writeFile(`./${yt_id}.jpg`, buffer);
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

  ipcMain.handle('save-screenshot', async (_event, filename) => {
    if (mainWindow === null) return;
    console.log('save-screenshot', mainWindow);
    const nativeImage = await mainWindow.webContents.capturePage();
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
    });
    if (canceled || !filePath) return;
    fs.writeFileSync(filePath, nativeImage.toPNG());
  });
}
