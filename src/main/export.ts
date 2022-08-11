import archiver from 'archiver';
import { app, BrowserWindow, dialog } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { getNowString } from '../renderer/lib/utils/time';
import { dbFolder } from './db';
import { addMainHandler } from './utils';

const logDir = path.dirname(log.default.transports.file.getFile().path);
const htmlDir = path.join(app.getPath('userData'), 'html');

const dirSize = async (directory: string) => {
  if (!fs.existsSync(directory)) {
    return 0;
  }

  const files = await readdir(directory);
  const stats = files.map((file) => stat(path.join(directory, file)));

  return (await Promise.all(stats)).reduce(
    (accumulator, { size }) => accumulator + size,
    0,
  );
};

export default function registerExportHandlers(mainWindow: BrowserWindow) {
  addMainHandler(
    'results-import',
    async (event: {
      sender: { send: (arg0: string, arg1: string) => void };
    }) => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });
      if (canceled) return;

      filePaths.forEach(async (x) => {
        const data = await fs.promises.readFile(x, 'utf8');
        event.sender.send('results-import-data', data);
      });
    },
  );

  addMainHandler(
    'results-export',
    async (
      _event: any,
      data: string | NodeJS.ArrayBufferView,
      filename: any,
    ) => {
      if (mainWindow === null) return;
      const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: filename,
      });
      if (canceled || !filePath) return;
      fs.writeFileSync(filePath, data);
    },
  );

  addMainHandler(
    'results-save-screenshot',
    async (
      _event: any,
      rect: Electron.Rectangle | undefined,
      filename: any,
    ) => {
      if (mainWindow === null) return;
      const nativeImage = await mainWindow.webContents.capturePage(rect);
      const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: filename,
      });
      if (canceled || !filePath) return;
      fs.writeFileSync(filePath, nativeImage.toPNG());
    },
  );

  addMainHandler('export-debug-archive', async () => {
    const filename = `dataskop-debug-${getNowString()}.zip`;

    if (mainWindow === null) return;
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
    });
    if (canceled || !filePath) return;

    const makeArchive = () =>
      new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(filePath);
        const archive = archiver('zip', {
          zlib: { level: 6 },
        });

        output.on('close', () => {
          log.info('Done creating the zip file for the export.');
          resolve();
        });

        archive.on('warning', (err) => {
          if (err.code === 'ENOENT') {
            // log warning
          } else {
            // throw error
            reject(err);
          }
        });

        archive.on('error', (err) => {
          reject(err);
        });

        archive.pipe(output);
        archive.directory(logDir, 'logs');
        archive.directory(dbFolder, 'databases');

        const htmlLogDir = htmlDir;
        if (fs.existsSync(htmlLogDir)) archive.directory(htmlLogDir, 'html');

        archive.finalize();
      });
    await makeArchive();
  });

  addMainHandler('export-debug-size', async () => {
    return Promise.all([htmlDir, logDir].map(dirSize));
  });

  addMainHandler('export-debug-clean', async () => {
    return [htmlDir, logDir].map((dir) =>
      fs.readdirSync(dir).forEach((f) => fs.rmSync(`${dir}/${f}`)),
    );
  });
}
