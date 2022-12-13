import { Dayjs } from "dayjs";
import _ from "lodash";
import dayjs from "renderer/lib/dayjs";
import { addScrapingResult } from "renderer/lib/db";

const STATUS = {
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
      title: "Aktion erforderlich",
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
  "monitoring-download-error-timeout": {
    notification: {
      title: "Fehler beim Download",
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
  "monitoring-error-nothing-found": {
    notification: {
      title: "Fehler",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  // Error, the HTML may have changed
  "monitoring-error-tab-not-found": {
    notification: {
      title: "Fehler",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  // Should prompt user to fill out captcha form
  "error-captcha-required": {},
  // Error, the HTML may have changed
  "data-error-tab-not-found": {
    notification: {
      title: "Fehler",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  // Waiting until TikTok created the dump
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
  "download-action-required": {},
  "download-success": {},
  "download-error": {
    notification: {
      title: "Fehler beim Download",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  "download-error-timeout": {
    notification: {
      title: "Fehler beim Download",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  // A scraping step was finished
  "scraping-done": {},
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

// keep in sync with main/tiktok/status.ts
const isStatusPending = (status: string) => {
  return [
    "data-pending",
    "monitoring-pending",
    "data-request-success",
    "error-captcha-required", // still keep looking even though an error occured
    "data-pending-error-unable-to-check", // as well
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
  isStatusPending,
  shouldJumpToWaitingPage,
  StatusKey,
  STATUS,
  addStatusReset,
};
