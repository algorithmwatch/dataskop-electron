/**
 * Tiktok specific code for main.
 */

import fs from "fs";

import {
  getLookupId,
  getWatchedVideos,
  isEligibleToDonate,
  redactTiktokDump,
} from "@algorithmwatch/schaufel-wrangle";
import { app, BrowserWindow, dialog } from "electron";
import log from "electron-log";
import { getNowString } from "../../../shared/utils/time";
import { dataStore, getLookups } from "../../db";
import { getDownload } from "../../downloads";
import { addMainHandler } from "../../utils";
import { postBackend } from "../../utils/networking";

/**
 * Get data from the disk
 */
const getData = async (redact: boolean, allLookups: boolean) => {
  const dump = await getDownload();

  if (redact) redactTiktokDump(dump);

  const data = dataStore.store;

  const lookups = allLookups
    ? // Only extract videos that are part of the dump
      getLookups(getWatchedVideos(dump).map(getLookupId))
    : // Upload only a subset of lookups (only the one we just scraped)
      getLookups(data.lookupsToUploads as string[]);

  return { sessions: data.data, lookups, dump, version: app.getVersion() };
};

export default function registerTiktokDataHandlers(mainWindow: BrowserWindow) {
  addMainHandler(
    "tiktok-data-upload",
    async (_event: any, email: string, campaign: number): Promise<any> => {
      const url = `${process.env.PLATFORM_URL}/api/donations/`;
      const data = {
        unauthorized_email: email,
        campaign,
        results: await getData(true, false),
      };

      const res = await postBackend(url, data);

      if (!res.ok) {
        log.warn(`Couldn't upload data: ${res.status}`);
      }

      return res.ok;
    },
  );

  addMainHandler("tiktok-data-export", async (_event: any) => {
    if (mainWindow === null) return;

    const data = await getData(false, true);
    const defaultPath = `dataskop-tiktok-${getNowString()}.json`;

    if (process.env.PLAYWRIGHT_TESTING === "true") {
      fs.writeFileSync(defaultPath, JSON.stringify(data));
      return;
    }

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath,
    });
    if (canceled || !filePath) return;

    fs.writeFileSync(filePath, JSON.stringify(data));
  });

  addMainHandler("tiktok-eligible-to-donate", async (_event: any) => {
    const dump = await getDownload();
    return isEligibleToDonate(dump);
  });
}
