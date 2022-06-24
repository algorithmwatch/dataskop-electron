/**
  Writing the data to the disk. It's currently not possible to use lowdb
  in the main process because it's a pure ESM module and the current setup
  doesnot support it. This should get changed when it's possible.
 */

import { app, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

export const getDbLocation = () => {
  const userFolder = app.getPath('userData');
  const file = path.join(userFolder, 'db.json');
  return file;
};

export default async function registerDbHandlers() {
  const file = getDbLocation();

  ipcMain.handle('db-write', (_e, data) => {
    return fs.writeFileSync(file, JSON.stringify(data), 'utf-8');
  });

  ipcMain.handle('db-read', () => {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw e;
    }
  });
}
