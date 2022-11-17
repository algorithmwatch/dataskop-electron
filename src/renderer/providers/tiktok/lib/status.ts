import _ from "lodash";
import { addScrapingResult, getScrapingResults } from "renderer/lib/db";

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
  // monitoring-captcha
  // Monitoring interrupted by captcha
  // Should prompt user to fill out captcha form
  "monitoring-captcha": {},
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
  // Error, the HTML may have changed
  "data-error-tab-not-found": {
    notification: {
      title: "Fehler",
      body: "Bitte öffne die DataSkop-App, um fortzufahren.",
    },
  },
  // Waiting until TikTok created the dump
  "data-pending": {},
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
  "files-imported": {},
};

type StatusKey = keyof typeof STATUS;

const getStatus = async (): Promise<string> => {
  const rows = await getScrapingResults();
  const statusRows = rows.filter((x) => x.fields && x.fields.status);
  if (statusRows.length === 0) return "status-not-available";

  return (_.last(statusRows) as any).fields.status as string;
};

const isStatusPending = (status: string) => {
  return [
    "data-pending",
    "monitoring-pending",
    "data-request-success",
  ].includes(status);
};

const isMonitoringPending = async () => {
  const s = await getStatus();
  return isStatusPending(s);
};

const shouldJumpToWaitingPage = async () => {
  const status = await getStatus();
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

// During testing, `ipc` is not set correctly
if (window.electron) {
  window.electron.ipc.on("monitoring-pending", async () => {
    window.electron.ipc.invoke(
      "monitoring-pending-reply",
      await isMonitoringPending(),
    );
  });
}

export {
  getStatus,
  shouldJumpToWaitingPage,
  isStatusPending,
  StatusKey,
  STATUS,
  addStatusReset,
};
