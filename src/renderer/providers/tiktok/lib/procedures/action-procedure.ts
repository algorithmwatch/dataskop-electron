import cheerio from "cheerio";
import _ from "lodash";
import { currentDelay } from "renderer/lib/delay";
import {
  clickOnElement,
  getReadyHtml,
  ProcedureArgs,
} from "renderer/lib/scraping";
import {
  GetCurrentHtml,
  GetHtmlFunction,
  GetHtmlLazyFunction,
} from "renderer/providers/types";
import { confirmCookies } from "../actions";
import { StatusKey } from "../status";

type ActionReturn = Promise<{
  status: StatusKey;
  filePath?: string;
  errorMessage?: string;
}>;

const GDPR_RESULTS_HTML_SELECTOR = "div[role=tabpanel]";

/**
 * get html from iFrame
 * @param getCurrentHtml
 * @returns
 */
const getReadyHtmlIframe = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtml(getCurrentHtml);
  return html.split("\n\n")[1];
};

/**
 * click on element in iFrame
 * @param element
 * @param $html
 * @returns
 */
const clickOnElementIframe = (
  element: cheerio.Cheerio,
  $html: cheerio.Root,
) => {
  return clickOnElement(element, $html, 1);
};

/**
 * Check wether a TikTok captcha present on a page
 */
const isCaptcha = ($html: cheerio.Root) => {
  return !!$html(
    ".captcha_verify_container, #captcha_container, .captcha_verify_bar, .captcha_verify_action",
  ).first().length;
};

/**
 * Click on the 'Download' tab.
 */
const clickOnDownloadTab = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtmlIframe(getCurrentHtml);
  const $html = cheerio.load(html);

  const downloadDataTab = $html(
    'button span:contains("Download data")',
  ).first();

  window.electron.log.debug(downloadDataTab);

  if (downloadDataTab.length) {
    await clickOnElementIframe(downloadDataTab, $html);
    return true;
  }
  return false;
};

/**
 * Download the ready GDPR dump
 *
 * @param click Click on the 'download' button
 * @returns status key
 */
const downloadDump = async (
  click: () => Promise<void>,
): Promise<{
  filePath?: string;
  status:
    | "download-success"
    | "download-error"
    | "download-action-required"
    | "download-error-timeout";
}> => {
  let started = false;
  let error = false;
  let filePath = null;
  const DOWNLOAD_TIMEOUT_SECONDS = 60;
  let lastReceived = new Date().getTime();

  window.electron.ipc.on("scraping-download-started", () => {
    started = true;
    window.electron.log.info("Downloading started");
  });

  window.electron.ipc.on("scraping-download-progress", () => {
    lastReceived = new Date().getTime();
  });

  window.electron.ipc.on(
    "scraping-download-done",
    (success: boolean, path: string) => {
      window.electron.log.info("Downloading done: ", success, path);
      if (success) filePath = path;
      else error = true;
    },
  );

  await click();

  // Wait until a download is finished
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await currentDelay();
    if (filePath != null) return { filePath, status: "download-success" };
    if (error) return { status: "download-error" };

    if (new Date().getTime() - lastReceived > DOWNLOAD_TIMEOUT_SECONDS * 1000) {
      // If the download didn't even start, TikTok requires attention
      if (!started) return { status: "download-action-required" };

      // The download has started but it looks like there is an error.
      // "Downloading time exceeded: no updates for over 60 seconds",
      return { status: "download-error-timeout" };
    }
  }
};

/**
 * Check if the GPDR dump is ready and download it if so
 */
const clickDownloadButton = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtmlIframe(getCurrentHtml);
  const $html = cheerio.load(html);

  const downloadButton = $html(
    `${GDPR_RESULTS_HTML_SELECTOR} button:contains("Download")`,
  ).first();

  window.electron.log.debug(downloadButton);
  const buttonAvailable = !!downloadButton.length;

  if (!buttonAvailable) return { buttonAvailable };

  const data = await downloadDump(() =>
    clickOnElementIframe(downloadButton, $html),
  );
  return { buttonAvailable, ...data };
};

const isDumpCreationPending = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtmlIframe(getCurrentHtml);
  const $html = cheerio.load(html);

  const pendingButton1 = $html(
    `${GDPR_RESULTS_HTML_SELECTOR} button:disabled div:contains("Pending")`,
  ).first().length;

  const pendingButton2 = $html(
    'button:disabled div:contains("Processing request")',
  ).first().length;

  return !!(pendingButton1 + pendingButton2);
};

const isDownloadExpired = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtmlIframe(getCurrentHtml);
  const $html = cheerio.load(html);

  const expiredButton = $html(
    `${GDPR_RESULTS_HTML_SELECTOR} button:disabled div:contains("Expired")`,
  ).first();

  window.electron.log.debug(expiredButton);

  return !!expiredButton.length;
};

const clickOnJsonFormat = ($html: cheerio.Root) => {
  const jsonBox = $html('input[name="format"][value="json"]').first();
  window.electron.log.info(jsonBox);
  return clickOnElementIframe(jsonBox, $html);
};

const clickOnRequestData = ($html: cheerio.Root) => {
  const jsonBox = $html('button div:contains("Request data")').first();
  window.electron.log.info(jsonBox);
  return clickOnElementIframe(jsonBox, $html);
};

const requestNewGdprDump = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtmlIframe(getCurrentHtml);
  const $html = cheerio.load(html);

  const requestDataTab = $html('button span:contains("Request data")').first();

  window.electron.log.info(requestDataTab);

  await clickOnElementIframe(requestDataTab, $html);
  // Work on new html (because of tab change)
  await currentDelay("longer");
  const html2 = await getReadyHtmlIframe(getCurrentHtml);
  const $html2 = cheerio.load(html2);
  await clickOnJsonFormat($html2);
  await currentDelay("longer");
  await clickOnRequestData($html2);

  // check if it's actually working
  await currentDelay("longer");
  if (!(await isDumpCreationPending(getCurrentHtml))) {
    throw new Error("Could not verify whether data request was successfull");
  }
};

// the lang paramater is important because we are filtering by text later on
const GET_DATA_URL =
  "https://www.tiktok.com/setting/download-your-data?lang=en";

/**
 * Check if download is ready to download and do so if it's available.
 *
 * This action gets started in headless monitoring mode.
 */
const monitorDataExport = async (getHtml: GetHtmlFunction): ActionReturn => {
  window.electron.log.info("Started monitor data export");

  // the lang paramater is important because we are filtering by text later on
  const getCurrentHtml = await getHtml(GET_DATA_URL);
  await confirmCookies();

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

  const downloadData = await clickDownloadButton(getCurrentHtml);
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
    return { status: "monitoring-captcha" };
  }

  return { status: "monitoring-error-nothing-found" };
};

/**
 * After logging in, request new data and try to download the data (if available).
 *
 * browser needs to store session data
 * 1. check if logged in
 * 2. check if requested
 * 3. if yes, wait
 * 4. if no, get the data
 *
 * @param getHtml
 * @returns
 */
const getDataExport = async (getHtml: GetHtmlFunction): ActionReturn => {
  window.electron.log.info("Started get data export");

  const getCurrentHtml = await getHtml(GET_DATA_URL);
  await confirmCookies();

  // Check if we have to wait (first try)
  if (await isDumpCreationPending(getCurrentHtml)) {
    return { status: "data-pending" };
  }

  const successClickTab = await clickOnDownloadTab(getCurrentHtml);
  if (!successClickTab) {
    return { status: "data-error-tab-not-found" };
  }

  window.electron.log.info("Looking for download button");
  const downloadData = await clickDownloadButton(getCurrentHtml);
  if (downloadData.buttonAvailable) {
    return _.pick(downloadData, ["filePath", "status"]);
  }

  // Check if we have to wait (second try)
  if (await isDumpCreationPending(getCurrentHtml)) {
    return { status: "data-pending" };
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

  if (slug === "tt-data-export-monitoring") {
    try {
      const data = await (procedureArgs.monitoring
        ? monitorDataExport
        : getDataExport)(getHtml);

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
