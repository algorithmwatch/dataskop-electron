import cheerio from 'cheerio';
import { delay } from 'renderer/lib/utils/time';
import {
  GetCurrentHtml,
  GetHtmlFunction,
  GetHtmlLazyFunction,
} from 'renderer/providers/types';
import { getUniquePath } from 'renderer/vendor/cheerio-unique-selector';

const getReadyHtml = async (getCurrentHtml: GetCurrentHtml) => {
  const maxTries = 5;
  let i = 0;
  let result = await getCurrentHtml();

  while (i < maxTries) {
    await delay(2000);
    const newResult = await getCurrentHtml();
    if (result.hash == newResult.hash) {
      return result.html;
    }
    result = newResult;
  }

  return result.html;
};

const clickOnDownloadTab = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtml(getCurrentHtml);
  const $html = cheerio.load(html);

  const downloadDataTab = $html('.dyd-title')
    .next()
    .find('span:contains("Download data")')
    .first();

  window.electron.log.info(downloadDataTab);

  if (downloadDataTab) {
    const path = getUniquePath(downloadDataTab, $html);

    window.electron.log.info(path);

    await window.electron.ipcRenderer.invoke('scraping-click-element', path);
    return true;
  }

  return false;
};

const clickDownloadButton = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtml(getCurrentHtml);
  const $html = cheerio.load(html);

  const downloadButton = $html(
    '.dyddownload-container button:contains("Download")',
  ).first();

  window.electron.log.info(downloadButton);

  if (downloadButton) {
    const path = getUniquePath(downloadButton, $html);

    window.electron.log.info(path);

    await window.electron.ipcRenderer.invoke('scraping-click-element', path);
    return true;
  }

  return false;
};

const getDataExport = async (getHtml: GetHtmlFunction) => {
  window.electron.log.info('started data export step');

  // await delay(2000);

  // the lang paramater is important because we are filtering by text later on
  const getDataUrl = 'https://www.tiktok.com/setting?activeTab=dyd&lang=en';

  const getCurrentHtml = await getHtml(getDataUrl);

  const successClick = await clickOnDownloadTab(getCurrentHtml);

  if (!successClick) {
    window.electron.log.info("failed to find 'Download data' tab");
    return [false, {}];
  }

  window.electron.log.info('Looking for download button');

  const successDownloadClick = await clickDownloadButton(getCurrentHtml);

  if (!successDownloadClick) {
    // request data
  } else {
    let done = false;

    window.electron.ipcRenderer.on('scraping-download-started', () =>
      console.log('started'),
    );
    window.electron.ipcRenderer.on('scraping-download-done', () => {
      done = true;
    });

    while (true) {
      delay(1000);
      if (done) return [true, {}];
    }
    // wait until a download is finished
  }

  // https://www.tiktok.com/setting?activeTab=dyd

  // browser needs to store session data
  // 1. check if logged in
  // 2. check if requested
  // 3. if yes, wait
  // 4. if no, get the data
};

async function* actionProcedure(
  getHtml: GetHtmlFunction,
  _getHtmlLazy: GetHtmlLazyFunction,
  sessionId: string,
  config: any,
  _scrapingConfig: any,
  _enableLogging: boolean,
) {
  const { slug } = config;

  if (slug === 'tt-data-export') {
    const [done, data] = await getDataExport(getHtml);
    if (done) return [1, { success: true, slug, fields: {}, errors: [] }];
  }

  return [1, null];
}

export { actionProcedure };
