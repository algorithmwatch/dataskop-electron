import _ from "lodash";

const isStatusPending = (status: string) => {
  if (
    ["data-pending", "monitoring-pending", "data-request-success"].includes(
      status,
    )
  )
    return true;

  // still keep looking even though an error occured
  return status.includes("error");
};

const getPrintStatus = (status: string) => {
  const mapping = {
    "monitoring-pending": "Warte auf Daten (im Hintergrund)",
    "monitoring-download-action-required":
      "Download (im Hintergrund): Handlung erforderlich",
    "monitoring-download-success": "Download erfolgreich (im Hintergrund)",
    "monitoring-download-error": "Fehler beim Download (im Hintergrund)",
    "monitoring-download-timeout":
      "Download: Handlung erforderlich (Timeout im Hintergrund)",
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
    "download-timeout": "Download: Handlung erforderlich (Timeout)",
    "scraping-done": "Scraping abgeschlossen",
    "files-imported": "Daten wurden importiert",
    "status-not-available": "Status (noch) nicht vorhanden",
    "status-reset": "Status erfolgreich zurückgesetzt",
  };

  return _.get(mapping, status, status);
};

export { isStatusPending, getPrintStatus };
