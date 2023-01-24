import cheerio from "cheerio";
import { range } from "lodash";
import { currentDelay } from "renderer/lib/delay";
import { clickOnElement, getReadyHtml } from "renderer/lib/scraping";
import { delay } from "renderer/lib/utils/time";
import { GetCurrentHtml } from "renderer/providers/types";

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

  window.electron.log.info(`downloadDataTab: ${downloadDataTab.length}`);

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
  activeUser = false,
): Promise<{
  filePath?: string;
  status:
    | "download-success"
    | "download-error"
    | "download-action-required"
    | "download-timeout";
}> => {
  let started = false;
  let error = false;
  let filePath = null;
  const DOWNLOAD_TIMEOUT_SECONDS = 60 * 5;
  const ACTION_REQUIRED_SECONDS = 5;

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

  if (activeUser) {
    window.electron.log.info("Showing the scraping window to the user");
    // Make the window full screen. This is hacky because the state in the context is wrong.
    window.electron.ipc.invoke("scraping-set-bounds", {
      width: window.innerWidth,
      height: window.innerHeight,
      x: 0,
      y: 0,
    });
  } else {
    window.electron.log.info("Not showing the scraping window");
  }

  // Wait until a download is finished
  while (true) {
    await currentDelay();
    if (filePath != null) {
      // The scraping window is still open but it will get closed in a while later on.
      return { filePath, status: "download-success" };
    }
    if (error) return { status: "download-error" };

    if (
      !activeUser &&
      new Date().getTime() - lastReceived > ACTION_REQUIRED_SECONDS * 1000
    ) {
      // If the download didn't even start, TikTok requires the user's attention.
      if (!started) return { status: "download-action-required" };
    }

    if (new Date().getTime() - lastReceived > DOWNLOAD_TIMEOUT_SECONDS * 1000) {
      // The download button clicked but nothing happend for an substancial amount of time.
      // It looks like the user has not interacted with the tool.
      // This case should never happend in monitoring mode since "download-action-required" should fire.
      return { status: "download-timeout" };
    }
  }
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

/**
 * Check if the GPDR dump is ready and download it if so.
 */
const clickDownloadButton = async (
  getCurrentHtml: GetCurrentHtml,
  dataRequestWasStarted: boolean,
  activeUser = false,
) => {
  const maxtries = dataRequestWasStarted ? 5 : 3;
  let numTry = 0;

  while (true) {
    // eslint-disable-next-line no-empty-pattern
    for (const {} of range(5)) {
      // scroll down to trigger lazy loading
      await window.electron.ipc.invoke("scraping-scroll-down");
      await delay(200);
    }

    const html = await getReadyHtmlIframe(getCurrentHtml);
    const $html = cheerio.load(html);

    const downloadButton = $html(
      `${GDPR_RESULTS_HTML_SELECTOR} button:contains("Download")`,
    ).first();

    const buttonAvailable = !!downloadButton.length;
    window.electron.log.info(`Download button available: ${buttonAvailable}`);

    if (!buttonAvailable) {
      if (numTry < maxtries && !(await isDumpCreationPending(getCurrentHtml))) {
        window.electron.log.warn(
          "Something went wrong. There should either a `Download` or `Pending` button. Retry.",
        );
        await currentDelay("longer");
        numTry += 1;
        continue;
      }
      return { buttonAvailable };
    }

    const data = await downloadDump(
      () => clickOnElementIframe(downloadButton, $html),
      activeUser,
    );
    return { buttonAvailable, ...data };
  }
};

const isDownloadExpired = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtmlIframe(getCurrentHtml);
  const $html = cheerio.load(html);

  const expiredButton = $html(
    `${GDPR_RESULTS_HTML_SELECTOR} button:disabled div:contains("Expired")`,
  ).first();

  window.electron.log.info(`expiredButton: ${expiredButton.length}`);

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

export {
  isDumpCreationPending,
  clickOnDownloadTab,
  clickDownloadButton,
  isDownloadExpired,
  isCaptcha,
  requestNewGdprDump,
};
