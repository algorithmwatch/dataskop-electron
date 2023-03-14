import { Dayjs } from "dayjs";
import _ from "lodash";
import { addScrapingResult } from "renderer/lib/db";
import dayjs from "../../shared/dayjs";

const STATUS = {
  // GDPR data was requested and the provider is processing the request.
  "monitoring-pending": {
    notification: {
      title: "Warte auf DSGVO-Daten",
      body: "Es kann eine Weile dauern, bis die Daten bereitstellt werden.",
    },
  },
  // The download could not happen in the background, we need action from the user
  "monitoring-download-action-required": {
    notification: {
      title: "Handlung erforderlich",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  "monitoring-download-success": {},
  "monitoring-download-error": {
    notification: {
      title: "Fehler beim Download",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  "monitoring-download-timeout": {
    notification: {
      title: "Handlung erforderlich",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  // Time to download data has expired
  "monitoring-download-expired": {
    notification: {
      title: "Download abgelaufen",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  // Error, the HTML may have changed
  "monitoring-error-nothing-found": {},
  // Error, the HTML may have changed
  "monitoring-error-tab-not-found": {},
  // Should prompt user to fill out captcha form
  "error-captcha-required": {},
  // Error, the HTML may have changed
  "data-error-tab-not-found": {},
  // Waiting until the proivder created the dump
  "data-pending": {},
  // The data request should either be pending or done but we couldn't verfiy the
  // current state. Are there network problems?
  "data-pending-error-unable-to-check": {},
  // successfully requested a new GDPR dump
  "data-request-success": {},
  // There were errors when requesting a new GDPR dump
  "data-error-request": {
    notification: {
      title: "Fehler",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  "download-action-required": {
    notification: {
      title: "Handlung erforderlich",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  "download-success": {},
  "download-error": {},
  "download-timeout": {
    notification: {
      title: "Handlung erforderlich",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  // A scraping step was finished
  "scraping-done": {
    notification: {
      title: "Alle Daten sind da",
      body: "Bitte öffne die DataSkop-App, um dir die Visualisierungen anzusehen.",
    },
  },
  // A user imported a dump
  "files-imported": {},
};

// There are two more special stati: `status-not-available` and `status-reset`.
// They are not listed here because the procedures must not return it.

type StatusKey = keyof typeof STATUS;

const getAllStati = () => {
  return window.electron.ipc.invoke("db-get-all-stati");
};

const getStatus = async (): Promise<{ status: string; updatedAt: Dayjs }> => {
  const statusRows = await getAllStati();
  if (statusRows.length === 0)
    return { status: "status-not-available", updatedAt: dayjs() };

  const last = _.last(statusRows) as any;
  return {
    status: last.fields.status as string,
    updatedAt: dayjs(last.scrapedAt as number),
  };
};

const isStatusDownloadActionRequired = (status: string) => {
  return [
    "monitoring-download-action-required",
    "download-action-required",
    "monitoring-download-timeout",
    "download-timeout",
  ].includes(status);
};

const shouldJumpToWaitingPage = async () => {
  const { status } = await getStatus();
  return status !== "status-not-available" && status !== "status-reset";
};

const addStatusReset = () => {
  return addScrapingResult(
    "no-session",
    0,
    {
      success: true,
      slug: "status-reset",
      fields: {
        status: "status-reset",
      },
    },
    true,
  );
};

export {
  getStatus,
  getAllStati,
  isStatusDownloadActionRequired,
  shouldJumpToWaitingPage,
  StatusKey,
  STATUS,
  addStatusReset,
};
