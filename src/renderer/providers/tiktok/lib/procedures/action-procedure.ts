import cheerio from 'cheerio';
import { currentDelay } from 'renderer/lib/delay';
import { clickOnElement, getReadyHtml } from 'renderer/lib/scraping';
import {
  GetCurrentHtml,
  GetHtmlFunction,
  GetHtmlLazyFunction,
} from 'renderer/providers/types';

const clickOnDownloadTab = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtml(getCurrentHtml);
  const $html = cheerio.load(html);

  const downloadDataTab = $html('.dyd-title')
    .next()
    .find('span:contains("Download data")')
    .first();

  window.electron.log.info(downloadDataTab);

  if (downloadDataTab.length) {
    await clickOnElement(downloadDataTab, $html);
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

  if (downloadButton.length) {
    await clickOnElement(downloadButton, $html);
    return true;
  }
  return false;
};

const isDumpCreationPending = async (getCurrentHtml: GetCurrentHtml) => {
  const html = await getReadyHtml(getCurrentHtml);
  const $html = cheerio.load(html);

  const pendingButton = $html(
    '.dyddownload-container button:contains("Pending")',
  ).first();

  window.electron.log.info(pendingButton);

  return !!pendingButton.length;
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

  const requestDataTab = $html('.dyd-title')
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
  await currentDelay('longer');
  if (!(await isDumpCreationPending(getCurrentHtml))) {
    throw new Error('Could not verify whether data request was successfull');
  }
};

// https://www.tiktok.com/setting?activeTab=dyd

// browser needs to store session data
// 1. check if logged in
// 2. check if requested
// 3. if yes, wait
// 4. if no, get the data

const getDataExport = async (getHtml: GetHtmlFunction) => {
  window.electron.log.info('Started data export step');

  // the lang paramater is important because we are filtering by text later on
  const getDataUrl = 'https://www.tiktok.com/setting?activeTab=dyd&lang=en';
  const getCurrentHtml = await getHtml(getDataUrl);

  const successClickTab = await clickOnDownloadTab(getCurrentHtml);
  if (!successClickTab) {
    throw new Error("Failed to find 'Download data' tab");
  }

  window.electron.log.info('Looking for download button');
  const successDownloadClick = await clickDownloadButton(getCurrentHtml);

  if (successDownloadClick) {
    let filePath = null;
    let lastReceived = new Date().getTime();

    window.electron.ipcRenderer.on('scraping-download-started', () =>
      window.electron.log.info('Downloading started'),
    );

    window.electron.ipcRenderer.on(
      'scraping-download-progress',
      (bytes: number) => {
        lastReceived = new Date().getTime();
      },
    );

    window.electron.ipcRenderer.on(
      'scraping-download-done',
      (success: boolean, path: string) => {
        window.electron.log.info('Downloading done: ', success, path);
        if (success) filePath = path;
        else {
          throw new Error('Could not download export dump');
        }
      },
    );

    // Wait until a download is finished
    while (true) {
      await currentDelay();
      if (filePath != null)
        return [true, { filePath, status: 'data downloaded' }];
      if (new Date().getTime() - lastReceived > 60 * 1000) {
        throw new Error(
          'Downloading time exceeded: no updates for over 60 seconds',
        );
      }
    }
  } else {
    // Check if we have to wait
    if (await isDumpCreationPending(getCurrentHtml)) {
      return [false, { status: 'pending' }];
    }

    // Request a new dump
    try {
      await requestData(getCurrentHtml);
      return [false, { status: 'data requested' }];
    } catch (error) {
      throw new Error('Could not request new export:' + error);
    }
  }
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
    try {
      const [done, data] = await getDataExport(getHtml);
      if (done)
        return [1, { success: true, slug, fields: { data }, errors: [] }];
      else return [1, { success: false, slug, fields: { data }, errors: [] }];
    } catch (error) {
      window.electron.log.error('Error with data export step:');
      window.electron.log.error(error);
      return [1, { success: false, slug, fields: {}, errors: [error] }];
    }
  }

  return [1, null];
}

export { actionProcedure };
