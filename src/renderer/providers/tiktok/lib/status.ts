import _ from "lodash";
import { getLastResult } from "renderer/lib/db";

export const STATUS = {
  "monitoring-pending": {
    notification: {
      title: "DSGVO-Daten angefordert",
      body: "Es kann eine Weile dauern, bis TikTok die Daten bereitstellt.",
    },
  },
  "monitoring-download-available": {
    notification: {
      title: "Download verfügbar",
      body: "Der Datenexport steht zum Download bereit",
    },
  },
  "monitoring-download-expired": {
    notification: {
      title: "Download abgelaufen",
      body: "Der Datenexport muss erneut beantragt werden.",
    },
  },
  "monitoring-captcha": {
    notification: {
      title: "Captcha erforderlich",
      body: "Wir konnten den Status der Datenspende aufgrund eines Captchas nicht überprüfen.",
    },
  },
  "monitoring-error-nothing-found": {
    notification: {
      title: "Fehler",
      body: "Der Datenexport muss erneut beantragt werden.",
    },
  },
  "monitoring-error-tab-not-found": {
    notification: {
      title: "Fehler",
      body: "Der Datenexport muss erneut beantragt werden.",
    },
  },
  "scraping-done": {
    notification: {
      title: "Die Daten sind da",
      body: "Öffne die DataSkop-App, um fortzufahren.",
    },
  },
  "data-requested": {},
  "data-downloaded": {},
};

const getStatus = async (): Promise<string> => {
  const row = await getLastResult();
  if (!row) return "status-not-available";
  return _.get(row.fields, "status", "status-not-available") as string;
};

export { getStatus };
