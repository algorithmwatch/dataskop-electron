import { Menu, MenuItemConstructorOptions, nativeImage, Tray } from "electron";
import log from "electron-log";
import _ from "lodash";
import dayjs from "./dayjs";
import { getAllStati } from "./db";
import { getPrintStatus } from "./providers/tiktok/status";

const getLastTimeUpdated = () => {
  const all = getAllStati();
  if (all.length === 0) return null;
  const {
    fields: { status },
    scrapedAt,
  } = _.last(all) as any;
  return { status, date: dayjs(scrapedAt).fromNow() };
};

let monitoringInterval: ReturnType<typeof setInterval> | null = null;
let tray: Tray | null = null;

const buildTray = (
  createOrBringToFocus: () => void,
  doMonitoring: () => any,
  configStore: any,
  icon: string,
) => {
  if (tray != null) return;

  const image = nativeImage.createFromPath(icon);
  tray = new Tray(image.resize({ width: 25, height: 25 }));
  tray.setToolTip("DataSkop");

  // 1 hour
  const MONITORING_INTERVAL_SECONDS = 60 * 60 * 1000;

  const handleMonitoringInterval = (active: boolean) => {
    if (process.env.NODE_ENV === "development") {
      log.debug("Skipping interval monitoring in development");
      return;
    }

    if (active && monitoringInterval === null) {
      log.info("Set interval for monitoring");
      monitoringInterval = setInterval(
        doMonitoring,
        MONITORING_INTERVAL_SECONDS,
      );
    }

    if (!active && monitoringInterval !== null) {
      log.info("Removing interval for monitoring");
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
  };
  configStore.onDidChange("monitoringInterval", handleMonitoringInterval);

  const initConfigMonitoring = configStore.get("monitoringInterval");
  handleMonitoringInterval(initConfigMonitoring);

  const baseTemplate: MenuItemConstructorOptions[] = [
    { label: "DataSkop öffnen", click: createOrBringToFocus },
    { label: "Separator", type: "separator" },
    {
      label: "Stündliches Monitoring",
      id: "monitoring",
      type: "checkbox",
      checked: initConfigMonitoring,
      click: (menuItem) => {
        // Persist change
        configStore.set("monitoringInterval", menuItem.checked);
      },
    },
    { label: "Datenexport überprüfen", click: doMonitoring },
    { label: "", enabled: false, visible: false },
    { label: "", enabled: false, visible: false },
    { label: "Separator", type: "separator" },
    {
      label: "DataSkop automatisch starten",
      type: "checkbox",
      checked: configStore.get("openAtLogin"),
      click: (menuItem) => {
        // Persist change
        configStore.set("openAtLogin", menuItem.checked);
      },
    },
    {
      label: "Separator",
      type: "separator",
    },
    { label: "Schließen", role: "quit" },
  ];

  let contextMenu = Menu.buildFromTemplate(baseTemplate);
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    // Get most recent values from disk because they may have been changed
    baseTemplate[2].checked = configStore.get("monitoringInterval");
    baseTemplate[7].checked = configStore.get("openAtLogin");

    // Fetch recent status when clicking on tray icon
    const last = getLastTimeUpdated();

    if (last === null) {
      baseTemplate[4].visible = false;
      baseTemplate[5].visible = false;
      log.info("Clicked on tray icon but there is no status to display");
    } else {
      baseTemplate[4].label = `Status: ${getPrintStatus(last.status)}`;
      baseTemplate[5].label = last.date;
      baseTemplate[4].visible = true;
      baseTemplate[5].visible = true;
    }

    // Rebuild menu to update it
    contextMenu = Menu.buildFromTemplate(baseTemplate);
    tray?.setContextMenu(contextMenu);
  });
};

export { buildTray };
