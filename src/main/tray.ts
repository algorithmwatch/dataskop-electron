import { app, Menu, nativeImage, Tray } from "electron";
import log from "electron-log";
import path from "path";

let moniInter: ReturnType<typeof setInterval> | null = null;
let tray: Tray | null = null;

const buildTray = (doMonitoring: () => any, configStore: any, icon: string) => {
  if (tray != null) return;

  const image = nativeImage.createFromPath(icon);
  tray = new Tray(image.resize({ width: 25, height: 25 }));

  const INTERVAL_SECONDS = 60 * 60 * 1000;

  const handleMonitoring = (menuItem, browserWindow, event) => {
    if (menuItem.checked && moniInter === null) {
      log.info("Adding interval for monitoring");
      moniInter = setInterval(doMonitoring, INTERVAL_SECONDS);
    }

    if (!menuItem.checked && moniInter !== null) {
      log.info("Removing interval for monitoring");
      clearInterval(moniInter);
      moniInter = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    // const item = contextMenu.getMenuItemById("monitoring");
    // console.log(item);
    // if (item) item.checked = true;
    // menuItem.checked = !menuItem.checked;
  };

  const monitoringActive = configStore.get("monitoringInterval");

  handleMonitoring({ checked: handleMonitoring }, null, null);

  // Context Menu
  const contextMenu = Menu.buildFromTemplate([
    { label: "Über DataSkop", role: "about" },
    { label: "Separator", type: "separator" },
    {
      label: "Stündliches Monitoring",
      id: "monitoring",
      type: "checkbox",
      checked: monitoringActive,
      click: handleMonitoring,
    },
    { label: "Datenexport überprüfen", click: doMonitoring },
    { label: "Separator", type: "separator" },
    { label: "Schließen", role: "quit" },
  ]);

  tray.setToolTip("DataSkop");
  tray.setContextMenu(contextMenu);
};

const appFolder = path.dirname(process.execPath);
const updateExe = path.resolve(appFolder, "..", "Update.exe");
const exeName = path.basename(process.execPath);

// https://www.electronjs.org/docs/latest/api/app#appsetloginitemsettingssettings-macos-windows
const pathArgs = {
  path: updateExe,
  args: [
    "--processStart",
    `"${exeName}"`,
    "--process-start-args",
    `"--hidden"`,
  ],
};

const setOpenAtLogin = (value: boolean) => {
  if (app.getLoginItemSettings(pathArgs).openAtLogin == value) return;

  app.setLoginItemSettings({
    openAtLogin: value,
    openAsHidden: true,
    ...pathArgs,
  });
};

export { buildTray, setOpenAtLogin };
