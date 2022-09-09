import cheerio from "cheerio";
import { currentDelay } from "renderer/lib/delay";
import { clickOnElement, getReadyHtml } from "renderer/lib/scraping";
import { STATUS } from "renderer/providers/tiktok/lib/status";
import {
  GetCurrentHtml,
  GetHtmlFunction,
  GetHtmlLazyFunction,
} from "renderer/providers/types";

/*
  Status:
  - monitoring-pending
    - TikTok data was requested and TikTok is busy
    - It didn't fail yet
  - monitoring-download-available
    - Data is ready to be downloaded
  - monitoring-download-expired
    - Time to download data has expired
  - monitoring-captcha
    - Monitoring interrupted by captcha
    - Should prompt user to fill out captcha form
  - monitoring-nothing-found
    -
*/

const isCaptcha = ($html: cheerio.Root) => {
  return !!$html(
    ".captcha_verify_container, #captcha_container, .captcha_verify_bar, .captcha_verify_action",
  ).first().length;
};

const clickOnDownloadTab = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtml(getCurrentHtml);
  const $html = cheerio.load(html);

  const downloadDataTab = $html(".dyd-title")
    .next()
    .find('span:contains("Download data")')
    .first();

  window.electron.log.debug(downloadDataTab);

  if (downloadDataTab.length) {
    await clickOnElement(downloadDataTab, $html);
    return true;
  }
  return false;
};

const checkDownloadButton = async (
  getCurrentHtml: GetCurrentHtml,
  click = true,
) => {
  const html = await getReadyHtml(getCurrentHtml);
  const $html = cheerio.load(html);

  const downloadButton = $html(
    '.dyddownload-container button:contains("Download")',
  ).first();

  window.electron.log.debug(downloadButton);

  if (!click && downloadButton.length) return true;

  if (downloadButton.length) {
    await clickOnElement(downloadButton, $html);
    return true;
  }
  return false;
};

const isDumpCreationPending = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtml(getCurrentHtml);
  const $html = cheerio.load(html);

  const pendingButton1 = $html(
    '.dyddownload-container button:disabled div:contains("Pending")',
  ).first().length;

  const pendingButton2 = $html(
    'button:disabled div:contains("Processing request")',
  ).first().length;

  return !!(pendingButton1 + pendingButton2);
};

const isDownloadExpired = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtml(getCurrentHtml);
  const $html = cheerio.load(html);

  const expiredButton = $html(
    '.dyddownload-container button:disabled div:contains("Expired")',
  ).first();

  window.electron.log.debug(expiredButton);

  return !!expiredButton.length;
};

const clickOnJsonFormat = ($html: cheerio.Root) => {
  const jsonBox = $html('input[name="format"][value="json"]').first();
  window.electron.log.info(jsonBox);
  return clickOnElement(jsonBox, $html);
};

const clickOnRequestData = ($html: cheerio.Root) => {
  const jsonBox = $html('button:contains("Request data")').first();
  window.electron.log.info(jsonBox);
  return clickOnElement(jsonBox, $html);
};

const requestData = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtml(getCurrentHtml);
  const $html = cheerio.load(html);

  const requestDataTab = $html(".dyd-title")
    .next()
    .find('span:contains("Request data")')
    .first();

  window.electron.log.info(requestDataTab);

  await clickOnElement(requestDataTab, $html);
  // Work on new html (because of tab change)
  await currentDelay();
  const html2 = await getReadyHtml(getCurrentHtml);
  const $html2 = cheerio.load(html2);
  await clickOnJsonFormat($html2);
  await currentDelay();
  await clickOnRequestData($html2);

  // check if it's actually working
  await currentDelay("longer");
  if (!(await isDumpCreationPending(getCurrentHtml))) {
    throw new Error("Could not verify whether data request was successfull");
  }
};

// the lang paramater is important because we are filtering by text later on
const GET_DATA_URL = "https://www.tiktok.com/setting?activeTab=dyd&lang=en";

const monitorDataExport = async (getHtml: GetHtmlFunction) => {
  window.electron.log.info("Started monitor data export");

  // the lang paramater is important because we are filtering by text later on
  const getCurrentHtml = await getHtml(GET_DATA_URL);
  let status: keyof typeof STATUS = "monitoring-error-nothing-found";

  if (await isDumpCreationPending(getCurrentHtml)) {
    status = "monitoring-pending";
  }

  const successClickTab = await clickOnDownloadTab(getCurrentHtml);

  if (!successClickTab) {
    status = "monitoring-error-tab-not-found";
  } else if (await isDumpCreationPending(getCurrentHtml)) {
    status = "monitoring-pending";
  } else if (await checkDownloadButton(getCurrentHtml, false)) {
    status = "monitoring-download-available";
  } else if (await isDownloadExpired(getCurrentHtml)) {
    status = "monitoring-download-expired";
  } else if (isCaptcha(cheerio.load((await getCurrentHtml()).html))) {
    status = "monitoring-captcha";
  }

  const {
    notification: { title, body },
  } = STATUS[status];
  window.electron.ipc.invoke("show-notification", title, body);

  return { status };
};

// browser needs to store session data
// 1. check if logged in
// 2. check if requested
// 3. if yes, wait
// 4. if no, get the data

const getDataExport = async (getHtml: GetHtmlFunction) => {
  window.electron.log.info("Started get data export");

  const getCurrentHtml = await getHtml(GET_DATA_URL);

  // Check if we have to wait (first try)
  if (await isDumpCreationPending(getCurrentHtml)) {
    return { status: "data-pending" };
  }

  const successClickTab = await clickOnDownloadTab(getCurrentHtml);
  if (!successClickTab) {
    throw new Error("Failed to find 'Download data' tab");
  }

  window.electron.log.info("Looking for download button");
  const successDownloadClick = await checkDownloadButton(getCurrentHtml);

  if (successDownloadClick) {
    let filePath = null;
    let lastReceived = new Date().getTime();

    window.electron.ipc.on("scraping-download-started", () =>
      window.electron.log.info("Downloading started"),
    );

    window.electron.ipc.on("scraping-download-progress", (bytes: number) => {
      lastReceived = new Date().getTime();
    });

    window.electron.ipc.on(
      "scraping-download-done",
      (success: boolean, path: string) => {
        window.electron.log.info("Downloading done: ", success, path);
        if (success) filePath = path;
        else {
          throw new Error("Could not download export dump");
        }
      },
    );

    // Wait until a download is finished
    while (true) {
      await currentDelay();
      if (filePath != null) return { filePath, status: "data-downloaded" };
      if (new Date().getTime() - lastReceived > 60 * 1000) {
        throw new Error(
          "Downloading time exceeded: no updates for over 60 seconds",
        );
      }
    }
  } else {
    // Check if we have to wait (second try)
    if (await isDumpCreationPending(getCurrentHtml)) {
      return { status: "data-pending" };
    }

    // Request a new dump
    try {
      await requestData(getCurrentHtml);
      return { status: "data-requested" };
    } catch (error) {
      throw new Error(`Could not request new export:${error}`);
    }
  }
};

// eslint-disable-next-line require-yield
async function* actionProcedure(
  getHtml: GetHtmlFunction,
  _getHtmlLazy: GetHtmlLazyFunction,
  config: any,
  _scrapingConfig: any,
  procedureArgs: any,
) {
  const { slug } = config;

  if (slug === "tt-data-export-monitoring") {
    try {
      const data = await (procedureArgs.monitoring
        ? monitorDataExport
        : getDataExport)(getHtml);

      return [1, { success: true, slug, fields: { data }, errors: [] }];
    } catch (error) {
      window.electron.log.error("Error with data export step:", error);
      return [1, { success: false, slug, fields: {}, errors: [error] }];
    }
  }

  return [1, null];
}

export { actionProcedure, STATUS };
