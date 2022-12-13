/**
  Writing the data to the disk. It's currently not possible to use lowdb
  in the main process because it's a pure ESM module and the current setup
  doesnot support it. This should get changed when it's possible.
 */

import { app } from "electron";
import log from "electron-log";
import Store from "electron-store";
import _ from "lodash";
import path from "path";
import { setOpenAtLogin } from "./tray";
import { addMainHandler } from "./utils";

const DB_FOLDER = path.join(app.getPath("userData"), "databases");

const dataStore = new Store({
  name: "data",
  cwd: DB_FOLDER,
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
  cwd: DB_FOLDER,
});

// enable debug logging in alpha
const isAlpha = app.getVersion().includes("alpha");

const configStore = new Store({
  name: "config",
  cwd: DB_FOLDER,
  encryptionKey: "DaTaSk0p",
  defaults: {
    openAtLogin: true,
    monitoring: false,
    monitoringInterval: true,
    debugLogging: isAlpha,
    htmlLogging: isAlpha,
  },
});

// run once on init
setOpenAtLogin(configStore.get("openAtLogin"));

configStore.onDidChange("openAtLogin", (newValue) =>
  setOpenAtLogin(!!newValue),
);

const getLookups = (keys?: string[]) => {
  if (keys === undefined) return lookupStore.store;
  return _.pick(lookupStore.store, _.uniq(keys));
};

const addLookups = (lookups: any, addOnlyMissing = false) => {
  if (addOnlyMissing) {
    const keys = Object.keys(lookups);
    const existingKeys = Object.keys(getLookups(keys));
    const missingLookups = _.pick(lookups, _.difference(keys, existingKeys));
    log.info(
      `Only importing ${Object.keys(missingLookups).length} of ${
        keys.length
      } because we only add missing values.`,
    );
    lookupStore.set(missingLookups);
  } else lookupStore.set(lookups);
};

const clearLookups = () => {
  log.info("Clearing `lookups`");
  lookupStore.reset();
};

const clearData = () => {
  log.info("Clearing `data`");
  dataStore.set("data", null);
};

const addLookupsToUpload = (keys: string[]) => {
  const newValues = dataStore.get("lookupsToUploads", []) as string[];
  newValues.push(...keys);
  dataStore.set("lookupsToUploads", newValues);
};

const getAllStati = () => {
  const data = dataStore.get("data");
  const rows = _.get(data, "scrapingResults", []) as {
    fields?: { status?: string };
  }[];
  const statusRows = rows.filter((x) => x.fields && x.fields.status);
  return _.orderBy(statusRows, "scrapedAt");
};

export default async function registerDbHandlers() {
  addMainHandler("db-write", (_e: any, data: any) => {
    dataStore.set("data", data);
  });

  addMainHandler("db-read", () => {
    return dataStore.get("data");
  });

  addMainHandler("db-get-all-stati", getAllStati);

  addMainHandler("db-set-lookups", (_e: any, lookups: any) => {
    return addLookups(lookups);
  });

  addMainHandler("db-get-lookups", (_e: any, keys: string[] | null) => {
    if (keys === null) return getLookups();
    return getLookups(keys);
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

export {
  configStore,
  dataStore,
  DB_FOLDER,
  getLookups,
  addLookups,
  addLookupsToUpload,
  clearData,
  getAllStati,
};
