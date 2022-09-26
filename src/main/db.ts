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
  defaults: { data: null, lookupsToUploads: [] },
  schema: {
    data: {},
    lookupsToUploads: {
      type: "array",
      items: { type: "string" },
    },
  },
});

const lookupStore = new Store({
  name: "lookup",
  cwd: dbFolder,
});

const configStore = new Store({
  name: "config",
  cwd: dbFolder,
  encryptionKey: "DaTaSk0p",
  defaults: {
    openAtLogin: true,
    monitoring: false,
    monitoringInterval: true,
    debugLogging: false,
    htmlLogging: false,
  },
});

// run once on init
setOpenAtLogin(configStore.get("openAtLogin"));

configStore.onDidChange("openAtLogin", (newValue) =>
  setOpenAtLogin(!!newValue),
);

const addLookups = (lookups: any) => {
  lookupStore.set(lookups);
};

const getLookups = (keys: string[]) => {
  return keys.map((x) => [x, lookupStore.get(x, null)]);
};

const clearLookups = () => lookupStore.reset();

const addLookupsToUpload = (keys: string[]) => {
  const newValues = dataStore.get("lookupsToUploads", []) as string[];
  newValues.push(...keys);
  dataStore.set("lookupsToUploads", newValues);
};

export default async function registerDbHandlers() {
  addMainHandler("db-write", (_e: any, data: any) => {
    dataStore.set("data", data);
  });

  addMainHandler("db-read", () => {
    return dataStore.get("data");
  });

  addMainHandler("db-set-lookups", (_e: any, lookups: any) => {
    return addLookups(lookups);
  });

  addMainHandler("db-get-lookups", (_e: any, keys: string[] | null) => {
    if (keys === null) return lookupStore.store;
    return Object.fromEntries(getLookups(keys));
  });

  addMainHandler("db-clear-lookups", clearLookups);

  addMainHandler("db-set-config", (_e: any, object: any) => {
    return configStore.set(object);
  });

  addMainHandler("db-get-config", (_e: any, key = null) => {
    if (key == null) return configStore.store;
    return configStore.get(key);
  });
}

export { configStore, dbFolder, getLookups, addLookups, addLookupsToUpload };
