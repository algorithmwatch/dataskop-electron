// only extract data from HTML, used for

import { parseVideoNoJs } from '@algorithmwatch/harke';
import { ipcRenderer } from 'electron';
import { addLookups, getLookups } from '../../db';
import { delay } from '../../utils/time';
import { submitConfirmForm } from './actions/confirm-cookies';

async function lookupOrScrapeVideos(videoIds: string[]) {
  const data = await getLookups();

  const readyIds = new Set(
    data.filter(({ info }) => info != null).map(({ info: { id } }) => id),
  );

  const getHtml = async () => {
    await ipcRenderer.invoke('scraping-background-init');
    return () => ipcRenderer.invoke('scraping-background-get-current-html');
  };

  await submitConfirmForm(getHtml, (sel) =>
    ipcRenderer.invoke('scraping-background-submit-form', sel),
  );

  // important to wait some secconds to set the responding cookie in the session
  await delay(3000);

  // only fetch new videos that are not already stored
  const toFetch = videoIds.filter((x) => !readyIds.has(x));

  const fetched = await ipcRenderer.invoke(
    'scraping-background-videos',
    toFetch,
  );

  const parsed = fetched.map((x) => ({
    scrapedAt: Date.now(),
    info: { ...parseVideoNoJs(x.html), videoId: x.videoId },
  }));

  // const fetched = await scrapeVideoMeta(toFetch);
  await addLookups(parsed);

  await ipcRenderer.invoke('scraping-background-close');

  return getLookups();
}

export { lookupOrScrapeVideos };
