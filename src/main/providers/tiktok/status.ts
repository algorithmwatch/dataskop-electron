import log from "electron-log";
import _ from "lodash";
import { getAllStati } from "../../db";

// keep the following two methods in sync with renderer/providers/tiktok/lib/status.ts
const isStatusPending = (status: string) => {
  return [
    "data-pending",
    "monitoring-pending",
    "data-request-success",
    "error-captcha-required", // still keep looking even though an error occured
    "data-pending-error-unable-to-check", // as well
  ].includes(status);
};

const getPrintStatus = (status: string) => {
  const mapping = {
    "monitoring-pending": "Warte auf Daten (im Hintergrund)",
    "monitoring-download-action-required":
      "Download (im Hintergrund): Handlung erforderlich",
    "monitoring-download-success": "Download erfolgreich (im Hintergrund)",
    "monitoring-download-error": "Fehler beim Download (im Hintergrund)",
    "monitoring-download-error-timeout":
      "Fehler beim Download: Timeout (im Hintergrund)",
    "monitoring-download-expired":
      "Fehler: Download abgelaufen (im Hintergrund)",
    "monitoring-error-nothing-found":
      "Fehler: Nichts gefunden (im Hintergrund)",
    "monitoring-error-tab-not-found":
      "Fehler: Tab konnte nicht gefunden werden (im Hintergrund)",
    "error-captcha-required": "Fehler: CAPTCHA muss gelöst werden",
    "data-error-tab-not-found": "Fehler: Tab konnte nicht gefunden werden",
    "data-pending": "Warte auf Daten",
    "data-pending-error-unable-to-check":
      "Fehler: Status konnte nicht überprüft werden",
    "data-request-success": "Daten wurden erfolgreich beantragt",
    "data-error-request": "Fehler: Beantragung fehlerhaft",
    "download-action-required": "Download: Handlung erforderlich",
    "download-success": "Download erfolgreich",
    "download-error": "Fehler beim Download",
    "download-error-timeout": "Fehler beim Download: Timeout",
    "scraping-done": "Scraping abgeschlossen",
    "files-imported": "Daten wurden importiert",
    "status-not-available": "Status nicht vorhanden",
    "status-reset": "Status erfolgreich zurückgesetzt",
  };

  return _.get(mapping, status, status);
};

const isLastStatusPending = () => {
  const all = getAllStati();
  if (all.length === 0) return false;
  const {
    fields: { status },
  } = _.last(all);
  log.info(`For pending check, got last status ${status}`);
  return isStatusPending(status);
};

export { isLastStatusPending, getPrintStatus };
