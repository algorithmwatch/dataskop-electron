/**
  Writing the data to the disk. It's currently not possible to use lowdb
  in the main process because it's a pure ESM module and the current setup
  doesnot support it. This should get changed when it's possible.
 */

import { app, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
// const { JSONFile } = require('lowdb');

export default async function registerDbHandlers() {
  // const { JSONFile } = await import('lowdb');
  // const { JSONFile } = lowdb;

  const userFolder = app.getPath('userData');
  const file = path.join(userFolder, 'db.json');
  // const adapter = new JSONFile<any>(file);

  // ipcMain.handle('db-read', adapter.read);
  // ipcMain.handle('db-write', adapter.write);
  ipcMain.handle('db-write', (_e, data) => {
    return fs.writeFileSync(file, JSON.stringify(data), 'utf-8');
  });
  ipcMain.handle('db-read', () => {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  });
  // ipcMain.handle('db-write', adapter.write);
}
