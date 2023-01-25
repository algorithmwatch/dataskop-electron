/**
 * Storing and manging artifacts (e.g. JSON dumps)
 */

import { app, BrowserWindow } from "electron";
import log from "electron-log";
import fs from "fs";
import _ from "lodash";
import path from "path";
import unzipper from "unzipper";
import { addLookups } from "./db";
import {
  addMainHandler,
  delay,
  getFileList,
  getNowString,
  readJson,
  writeJson,
} from "./utils";

export const DOWNLOADS_FOLDER = path.join(app.getPath("userData"), "downloads");

/**
 * Handle import of a JSON file that was created via a DataSkop export
 * @param filePath
 */
const handleImportDataSkop = (filePath: string) => {
  if (filePath.endsWith(".json")) {
    const data = readJson(filePath);
    if ("lookups" in data) {
      log.info(`Importing ${Object.keys(data.lookups).length} lookups`);
      addLookups(data.lookups, true);
    }

    if ("dump" in data) {
      // overide exising file to only contain the dump
      log.info("Remove `lookups` etc. from import of DataSkop export");
      writeJson(filePath, data.dump);
    }
  }
};

export const postDownloadFileProcessing = async (filePath: string) => {
  let filePathExtracted = filePath;

  // TikTok started to export files like this _somenime.zip_.
  // So try to extract the file even if the .zip is somewhere in the filename.
  // Also remove all underscores in the extraced file

  if (filePath.includes(".zip")) {
    log.info("Unzipping downloaded file");

    filePathExtracted = filePath.replaceAll("_", "").replace(/\.zip$/, "");

    // some delay is needed to prevent a race condition
    await delay(1000);

    fs.createReadStream(filePath).pipe(
      unzipper.Extract({ path: filePathExtracted }),
    );

    // some delay is needed to prevent a race condition
    await delay(1000);
    log.info("Unzipping done. Deleting original file.");
    fs.unlinkSync(filePath);
  }

  handleImportDataSkop(filePathExtracted);

  return filePathExtracted;
};

export const getDownload = async (picks: string[] = []) => {
  const allJsons = getFileList(DOWNLOADS_FOLDER).filter(
    (x) => path.extname(x) === ".json",
  );

  if (allJsons.length) {
    allJsons.sort();
    const chosenJson = _.last(allJsons);
    log.info(`Returning the last file: ${chosenJson}`);
    if (!chosenJson) return;

    const data = JSON.parse(fs.readFileSync(chosenJson, "utf-8"));

    if (picks.length) return _.pick(data, picks);
    return data;
  }
  return null;
};

export const clearDownloads = () => {
  getFileList(DOWNLOADS_FOLDER).forEach((x) => {
    fs.unlinkSync(x);
    log.info(`Successfully deleted ${x}`);
  });
};

export default function registerDownloadsHandlers(mainWindow: BrowserWindow) {
  log.debug(
    `Called registerDownloadsHandlers, mainWindow: ${mainWindow !== null}`,
  );

  addMainHandler("downloads-get", (_event: any, picks: string[] = []) =>
    getDownload(picks),
  );

  addMainHandler("downloads-clear", (_event: any) => clearDownloads());

  addMainHandler("downloads-import", async (_e: any, paths: string[]) => {
    log.info(`Importing ${paths.length} file(s)`);
    const dir = path.join(DOWNLOADS_FOLDER, getNowString());

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const dests = [];
    for (const p of paths) {
      if (p.length === 0) {
        log.warn("Path is empty. Aborting import.");
        return { success: false };
      }

      const dest = path.join(dir, path.basename(p));

      fs.copyFileSync(p, dest);
      const resultingDest = await postDownloadFileProcessing(dest);
      log.info(`Imported ${dest}`);
      dests.push(dest);
      if (dest !== resultingDest) dests.push(resultingDest);
    }

    return { success: true, paths: dests };
  });
}
