import { app, Menu, nativeImage, Tray } from "electron";
import path from "path";

let tray: Tray | null = null;
const buildTray = (handleTrayClick: (str: string) => any, icon: string) => {
  if (tray != null) return;

  const image = nativeImage.createFromPath(icon);
  tray = new Tray(image.resize({ width: 25, height: 25 }));

  // Context Menu
  const contextMenu = Menu.buildFromTemplate([
    { label: "About", role: "about" },
    { label: "Separator", type: "separator" },
    {
      label: "Status",
      submenu: [
        {
          label: "On",
          type: "radio",
          checked: false,
          click: () => handleTrayClick("on"),
        },
        {
          label: "Off",
          type: "radio",
          checked: true,
          click: () => handleTrayClick("off"),
        },
      ],
    },
    { label: "Separator", type: "separator" },
    { label: "Quit", role: "quit" },
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
