import _ from "lodash";
import { getLastResult } from "renderer/lib/db";

export const STATUS = {
  // TikTok data was requested and TikTok is busy, It didn't fail yet
  "monitoring-pending": {
    notification: {
      title: "DSGVO-Daten angefordert",
      body: "Es kann eine Weile dauern, bis TikTok die Daten bereitstellt.",
    },
  },
  // The download could not happen in the background, we need action from the user
  "monitoring-download-action-required": {
    notification: {
      title: "Download verfügbar",
      body: "Der Datenexport steht zum Download bereit",
    },
  },
  "monitoring-download-success": {},
  "monitoring-download-error": {},
  "monitoring-download-error-timeout": {},
  // Time to download data has expired
  "monitoring-download-expired": {
    notification: {
      title: "Download abgelaufen",
      body: "Der Datenexport muss erneut beantragt werden.",
    },
  },
  // monitoring-captcha
  // Monitoring interrupted by captcha
  // Should prompt user to fill out captcha form
  "monitoring-captcha": {
    notification: {
      title: "Captcha erforderlich",
      body: "Wir konnten den Status der Datenspende aufgrund eines Captchas nicht überprüfen.",
    },
  },
  // Error, the HTML may have changed
  "monitoring-error-nothing-found": {
    notification: {
      title: "Fehler",
      body: "Es ist ein Fehler aufgetreten.",
    },
  },
  // Error, the HTML may have changed
  "monitoring-error-tab-not-found": {
    notification: {
      title: "Fehler",
      body: "Es ist ein Fehler aufgetreten.",
    },
  },
  // Error, the HTML may have changed
  "data-error-tab-not-found": {},
  // Waiting until TikTok created the dump
  "data-pending": {},
  // successfully requested a new GDPR dump
  "data-request-success": {},
  // There were errors when requesting a new GDPR dump
  "data-error-request": {},
  "download-action-required": {},
  "download-sucess": {},
  "download-error": {},
  "download-error-timeout": {},
  // A scraping step was finished
  "scraping-done": {},
  "files-imported": {},
};

const getStatus = async (): Promise<string> => {
  const row = await getLastResult();
  if (!row) return "status-not-available";
  return _.get(row.fields, "status", "status-not-available") as string;
};

export { getStatus };
