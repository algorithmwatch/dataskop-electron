import { Menu, nativeImage, Tray } from "electron";
import log from "electron-log";
import _ from "lodash";
import dayjs from "./dayjs";
import { getAllStati } from "./db";

const getLastTimeUpdated = () => {
  const all = getAllStati();
  if (all.length === 0) return "";
  const {
    fields: { status },
    scrapedAt,
  } = _.last(all);
  return { status, updatedAt: dayjs(scrapedAt).fromNow() };
};

let moniInter: ReturnType<typeof setInterval> | null = null;
let tray: Tray | null = null;

const buildTray = (
  createWindow,
  doMonitoring: () => any,
  configStore: any,
  icon: string,
) => {
  if (tray != null) return;

  const image = nativeImage.createFromPath(icon);
  tray = new Tray(image.resize({ width: 25, height: 25 }));
  tray.setToolTip("DataSkop");

  const INTERVAL_SECONDS = 60 * 60 * 1000;

  const handleMonitoring = (menuItem, browserWindow, event) => {
    if (process.env.NODE_ENV === "development") {
      log.debug("Skipping interval monitoring in development");
      return;
    }
    if (menuItem.checked && moniInter === null) {
      log.info("Adding interval for monitoring");
      moniInter = setInterval(doMonitoring, INTERVAL_SECONDS);
    }

    if (!menuItem.checked && moniInter !== null) {
      log.info("Removing interval for monitoring");
      clearInterval(moniInter);
      moniInter = null;
    }
  };

  const monitoringActive = configStore.get("monitoringInterval");

  handleMonitoring({ checked: handleMonitoring }, null, null);

  const baseTemplate = [
    { label: "DataSkop öffnen", click: createWindow },
    { label: "Separator", type: "separator" },
    {
      label: "Stündliches Monitoring",
      id: "monitoring",
      type: "checkbox",
      checked: monitoringActive,
      click: handleMonitoring,
    },
    { label: "Datenexport überprüfen", click: doMonitoring },
    { label: "", enabled: false },
    { label: "", enabled: false },
    { label: "Separator", type: "separator" },
    { label: "Schließen", role: "quit" },
  ];

  // Context Menu
  let contextMenu = Menu.buildFromTemplate(baseTemplate);
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    const last = getLastTimeUpdated();

    baseTemplate[4].label = `Status: ${last.status}`;
    baseTemplate[5].label = last.updatedAt;

    // Rebuild menu
    contextMenu = Menu.buildFromTemplate(baseTemplate);
    tray.setContextMenu(contextMenu);
  });
};

export { buildTray };
