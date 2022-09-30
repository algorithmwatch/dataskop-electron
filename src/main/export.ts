import archiver from "archiver";
import { BrowserWindow, dialog } from "electron";
import log from "electron-log";
import fs from "fs";
import { readdir, stat } from "fs/promises";
import path from "path";
import { getNowString } from "../renderer/lib/utils/time";
import { DB_FOLDER } from "./db";
import {
  DOWNLOADS_FOLDER,
  HTML_FOLDER,
  postDownloadFileProcessing,
} from "./scraping";
import { addMainHandler } from "./utils";

const LOG_FOLDER = path.dirname(log.default.transports.file.getFile().path);

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
    "results-import",
    async (event: {
      sender: { send: (arg0: string, arg1: string) => void };
    }) => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (canceled) return;

      filePaths.forEach(async (x) => {
        const data = await fs.promises.readFile(x, "utf8");
        event.sender.send("results-import-data", data);
      });
    },
  );

  addMainHandler(
    "results-export",
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
    "results-save-screenshot",
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

  addMainHandler("export-debug-archive", async () => {
    const filename = `dataskop-debug-${getNowString()}.zip`;

    if (mainWindow === null) return;
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
    });
    if (canceled || !filePath) return;

    const makeArchive = () =>
      new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(filePath);
        const archive = archiver("zip", {
          zlib: { level: 6 },
        });

        output.on("close", () => {
          log.info("Done creating the zip file for the export.");
          resolve();
        });

        archive.on("warning", (err) => {
          if (err.code === "ENOENT") {
            // log warning
          } else {
            // throw error
            reject(err);
          }
        });

        archive.on("error", (err) => {
          reject(err);
        });

        archive.pipe(output);
        archive.directory(LOG_FOLDER, "logs");
        archive.directory(DB_FOLDER, "databases");

        if (fs.existsSync(HTML_FOLDER)) archive.directory(HTML_FOLDER, "html");

        archive.finalize();
      });
    await makeArchive();
  });

  addMainHandler("export-debug-size", async () => {
    return Promise.all([HTML_FOLDER, LOG_FOLDER].map(dirSize));
  });

  addMainHandler("export-debug-clean", async () => {
    return [HTML_FOLDER, LOG_FOLDER].map((dir) =>
      fs.readdirSync(dir).forEach((f) => fs.rmSync(`${dir}/${f}`)),
    );
  });

  addMainHandler("import-files", async (_e: any, paths: string[]) => {
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
