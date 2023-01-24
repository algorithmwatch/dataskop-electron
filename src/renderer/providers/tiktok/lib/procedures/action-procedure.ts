import cheerio from "cheerio";
import _ from "lodash";
import { ProcedureArgs } from "renderer/lib/scraping";
import { GetHtmlFunction, GetHtmlLazyFunction } from "renderer/providers/types";
import {
  isStatusDownloadActionRequired,
  isStatusPending,
  STATUS,
  StatusKey,
} from "../status";
import {
  clickDownloadButton,
  clickOnDownloadTab,
  isCaptcha,
  isDownloadExpired,
  isDumpCreationPending,
  requestNewGdprDump,
} from "./action-tasks";

type ActionReturn = Promise<{
  status: StatusKey;
  filePath?: string;
  errorMessage?: string;
}>;

// the lang paramater is important because we are filtering by text later on
const GET_DATA_URL =
  "https://www.tiktok.com/setting/download-your-data?lang=en";

/**
 * Check if download is ready to download and do so if it's available.
 *
 * This action gets started in headless monitoring mode, so the app runs in the
 * background.
 */
const monitorDataExport = async (
  getHtml: GetHtmlFunction,
  dataRequestWasStarted: boolean,
): ActionReturn => {
  window.electron.log.info(
    `Started \`monitorDataExport\` with \`dataRequestWasStarted\`:${dataRequestWasStarted}`,
  );

  const getCurrentHtml = await getHtml(GET_DATA_URL);

  if (await isDumpCreationPending(getCurrentHtml)) {
    return { status: "monitoring-pending" };
  }

  const successClickTab = await clickOnDownloadTab(getCurrentHtml);

  if (!successClickTab) {
    return { status: "monitoring-error-tab-not-found" };
  }

  if (await isDumpCreationPending(getCurrentHtml)) {
    return { status: "monitoring-pending" };
  }

  const downloadData = await clickDownloadButton(
    getCurrentHtml,
    dataRequestWasStarted,
  );

  if (downloadData.buttonAvailable) {
    return {
      filePath: downloadData.filePath,
      status: `monitoring-${downloadData.status}`,
    };
  }

  if (await isDownloadExpired(getCurrentHtml)) {
    return { status: "monitoring-download-expired" };
  }

  if (isCaptcha(cheerio.load((await getCurrentHtml()).html))) {
    return { status: "error-captcha-required" };
  }

  return { status: "monitoring-error-nothing-found" };
};

/**
 * After logging in, request new data and try to download the data (if available).
 * This step gets invoked when the user is using the app activly.
 *
 * @param getHtml
 * @returns
 */
const getDataExport = async (
  getHtml: GetHtmlFunction,
  dataRequestWasStarted: boolean,
): ActionReturn => {
  window.electron.log.info(
    `Started \`getDataExport\` with \`dataRequestWasStarted\`:${dataRequestWasStarted}`,
  );

  const getCurrentHtml = await getHtml(GET_DATA_URL);

  // Check if we have to wait (first try)
  if (await isDumpCreationPending(getCurrentHtml)) {
    return { status: "data-pending" };
  }

  const successClickTab = await clickOnDownloadTab(getCurrentHtml);
  if (!successClickTab) {
    return { status: "data-error-tab-not-found" };
  }

  window.electron.log.info("Looking for download button");
  const downloadData = await clickDownloadButton(
    getCurrentHtml,
    dataRequestWasStarted,
    true,
  );

  if (downloadData.buttonAvailable) {
    return _.pick(downloadData, ["filePath", "status"]);
  }

  // Check if we have to wait (second try)
  if (await isDumpCreationPending(getCurrentHtml)) {
    return { status: "data-pending" };
  }

  // Only request a new dump if we can be sure that we don't overwrite an old dump.
  if (dataRequestWasStarted) {
    if (isCaptcha(cheerio.load((await getCurrentHtml()).html))) {
      return { status: "error-captcha-required" };
    }
    return { status: "data-pending-error-unable-to-check" };
  }

  // Request a new dump
  try {
    await requestNewGdprDump(getCurrentHtml);
    return { status: "data-request-success" };
  } catch (error: any) {
    return {
      status: "data-error-request",
      errorMessage: error.message,
    };
  }
};

// eslint-disable-next-line require-yield
async function* actionProcedure(
  getHtml: GetHtmlFunction,
  _getHtmlLazy: GetHtmlLazyFunction,
  config: any,
  _scrapingConfig: any,
  procedureArgs: ProcedureArgs,
) {
  const { slug } = config;

  // Get the last status to prevent requesting a new dump because we couldn't
  // check for the current status, e.g., because of an error.
  const dataRequestWasStarted =
    isStatusPending(procedureArgs.lastStatus.status) ||
    isStatusDownloadActionRequired(procedureArgs.lastStatus.status);

  if (slug === "tt-data-export") {
    try {
      const data = await (procedureArgs.monitoring
        ? monitorDataExport
        : getDataExport)(getHtml, dataRequestWasStarted);

      // Only show notifications for a subset of status
      const status = STATUS[data.status];
      if ("notification" in status) {
        const {
          notification: { title, body },
        } = status;
        window.electron.ipc.invoke("show-notification", title, body);
      }

      window.electron.log.info(`Step ended with the status: ${data.status}`);

      if ((data.status as string).includes("error")) {
        const errors = [data.status, data.errorMessage];
        return [1, { success: false, slug, fields: { ...data }, errors }];
      }
      return [1, { success: true, slug, fields: { ...data }, errors: [] }];
    } catch (error: any) {
      window.electron.log.error(`Error with data export step: ${error}`);
      return [1, { success: false, slug, fields: {}, errors: [error.message] }];
    }
  }

  return [1, null];
}

export { actionProcedure };
