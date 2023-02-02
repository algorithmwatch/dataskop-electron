import archiver from "archiver";
import { app, BrowserWindow, dialog } from "electron";
import log from "electron-log";
import fs from "fs";
import { readdir, stat } from "fs/promises";
import path from "path";
import { DB_FOLDER } from "./db";
import { DOWNLOADS_FOLDER } from "./downloads";
import { HTML_FOLDER } from "./scraping";
import { addMainHandler, getNowString } from "./utils";

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
    "export-screenshot",
    async (_event: any, rect: Electron.Rectangle, filename: any) => {
      if (mainWindow === null) return;
      const nativeImage = await mainWindow.webContents.capturePage(rect);

      if (process.env.PLAYWRIGHT_TESTING === "true") {
        fs.writeFileSync(filename, nativeImage.toJPEG(75));
        return;
      }

      const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: filename,
      });
      if (canceled || !filePath) return;
      fs.writeFileSync(filePath, nativeImage.toJPEG(75));
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

        if (fs.existsSync(DOWNLOADS_FOLDER))
          archive.directory(DOWNLOADS_FOLDER, "downloads");

        if (fs.existsSync(HTML_FOLDER)) archive.directory(HTML_FOLDER, "html");

        archive.finalize();
      });
    await makeArchive();
  });

  addMainHandler("export-file-infos", async () => {
    const sizes = await Promise.all(
      [HTML_FOLDER, LOG_FOLDER, DOWNLOADS_FOLDER, DB_FOLDER].map(dirSize),
    );

    // Currently, everything gets written to `main.log`.
    const logFile = path.join(LOG_FOLDER, "main.log");
    const logContent = fs.readFileSync(logFile, "utf8").slice(-100000);

    return {
      sizes,
      files: {
        log: logFile,
        html: HTML_FOLDER,
        downloads: DOWNLOADS_FOLDER,
        db: DB_FOLDER,
      },
      logContent,
    };
  });

  addMainHandler("export-remove-debug-files", async () => {
    return [HTML_FOLDER, LOG_FOLDER].map((dir) =>
      fs.readdirSync(dir).forEach((f) => fs.rmSync(`${dir}/${f}`)),
    );
  });

  addMainHandler("export-remove-all-files", async () => {
    [HTML_FOLDER, LOG_FOLDER, DOWNLOADS_FOLDER, DB_FOLDER].map((dir) =>
      fs.readdirSync(dir).forEach((f) => fs.rmSync(`${dir}/${f}`)),
    );
    // We removed the database so restart to re-init it.
    app.relaunch();
    app.exit();
  });
}
