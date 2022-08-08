import cheerio from 'cheerio';
import { currentDelay } from 'renderer/providers';
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
    await currentDelay();
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

    window.electron.ipcRenderer.on('scraping-download-progress', (bytes) => {
      lastReceived = new Date().getTime();
    });

    window.electron.ipcRenderer.on(
      'scraping-download-done',
      (success, path) => {
        window.electron.log.info('Downloading done: ', success, path);
        if (success) filePath = path;
        else {
          throw new Error('Could not download export dump');
        }
      },
    );

    while (true) {
      await delay(1000);
      if (filePath != null) return [true, { filePath }];
      if (new Date().getTime() - lastReceived > 60 * 1000) {
        throw new Error('Downloading time exceeded: no updates for 60 seconds');
      }
    }
    // wait until a download is finished
  }

  // Should never get reached.
  return [false, {}];
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
