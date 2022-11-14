/**
 * Storing and manging artifacts (e.g. JSON dumps)
 */

import { app, BrowserWindow } from "electron";
import log from "electron-log";
import fs from "fs";
import _ from "lodash";
import path from "path";
import unzipper from "unzipper";
import { addMainHandler, delay, getFileList, getNowString } from "./utils";

export const DOWNLOADS_FOLDER = path.join(app.getPath("userData"), "downloads");

export const postDownloadFileProcessing = async (filePath: string) => {
  let filePathExtracted = "";

  if (filePath.endsWith(".zip")) {
    log.info("Unzipping downloaded file");

    filePathExtracted = filePath.replace(/\.zip$/, "");

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

export default function registerDownloadsHandlers(mainWindow: BrowserWindow) {
  log.debug(
    `Called registerDownloadsHandlers, mainWindow: ${mainWindow !== null}`,
  );

  addMainHandler("downloads-get", (_event: any, picks: string[] = []) =>
    getDownload(picks),
  );

  addMainHandler("downloads-clear", (_event: any) =>
    getFileList(DOWNLOADS_FOLDER).forEach((x) => {
      fs.unlinkSync(x);
      log.info(`Successfully deleted ${x}`);
    }),
  );

  addMainHandler("downloads-import", async (_e: any, paths: string[]) => {
    const dir = path.join(DOWNLOADS_FOLDER, getNowString());

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const dests = [];
    for (const p of paths) {
      const dest = path.join(dir, path.basename(p));

      fs.copyFileSync(p, dest);
      await postDownloadFileProcessing(dest);
      log.info(`Imported ${dest}`);
      dests.push(dest);
    }

    return { success: true, paths: dests };
  });
}
