/**
  Writing the data to the disk. It's currently not possible to use lowdb
  in the main process because it's a pure ESM module and the current setup
  doesnot support it. This should get changed when it's possible.
 */

import { app } from "electron";
import Store from "electron-store";
import path from "path";
import { setOpenAtLogin } from "./tray";
import { addMainHandler } from "./utils";

const userFolder = app.getPath("userData");
const dbFolder = path.join(userFolder, "databases");

const dataStore = new Store({
  name: "data",
  cwd: dbFolder,
  encryptionKey: "DaTaSk0p",
  defaults: { data: null },
});

const configStore = new Store({
  name: "config",
  cwd: dbFolder,
  encryptionKey: "DaTaSk0p",
  defaults: {
    openAtLogin: true,
    monitoring: null,
    debugLogging: false,
    htmlLogging: false,
  },
});

// run once on init
setOpenAtLogin(configStore.get("openAtLogin"));

configStore.onDidChange("openAtLogin", (newValue) =>
  setOpenAtLogin(!!newValue),
);

export default async function registerDbHandlers() {
  addMainHandler("db-write", (_e: any, data: any) => {
    dataStore.set("data", data);
  });

  addMainHandler("db-read", () => {
    return dataStore.get("data");
  });

  addMainHandler("db-set-config", (_e: any, object: any) => {
    return configStore.set(object);
  });

  addMainHandler("db-get-config", (_e: any, key = null) => {
    if (key == null) return configStore.store;
    return configStore.get(key);
  });
}

export { configStore, dbFolder };
