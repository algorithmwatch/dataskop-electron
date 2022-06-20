import { BrowserWindow, dialog, ipcMain } from 'electron';
import fs from 'fs';

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
