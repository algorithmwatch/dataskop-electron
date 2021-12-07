// only extract data from HTML, used for

import { parseVideoNoJs } from '@algorithmwatch/harke';
import _ from 'lodash';
import { addLookups, clearLookups, getLookups } from 'renderer/lib/db';
import dayjs from 'renderer/lib/utils/dayjs';
import { delay } from 'renderer/lib/utils/time';
import { submitConfirmForm } from './actions/confirm-cookies';

const KEEP_LOOKUPS_MAX_DAYS = 7;

async function lookupOrScrapeVideos(videoIds: string[]) {
  let data = await getLookups();

  // If the first entry (the oldest one) is older than the max value,
  // clear all lookups and get fresh data.
  if (
    data.length > 0 &&
    dayjs().diff(dayjs(data[0].scrapedAt), 'day') > KEEP_LOOKUPS_MAX_DAYS
  ) {
    await clearLookups();
    data = [];
  }

  const readyIds = new Set(
    data
      .filter(({ info }) => info != null)
      .map(({ info: { videoId } }) => videoId),
  );

  const getHtml = async () => {
    await window.electron.ipcRenderer.invoke('scraping-background-init');
    return () =>
      window.electron.ipcRenderer.invoke(
        'scraping-background-get-current-html',
      );
  };

  await submitConfirmForm(getHtml, (sel) =>
    window.electron.ipcRenderer.invoke('scraping-background-submit-form', sel),
  );

  // important to wait some secconds to set the responding cookie in the session
  await delay(3000);

  // only fetch new videos that are not already stored
  const toFetch = _.uniq(videoIds.filter((x) => !readyIds.has(x)));

  const fetched = await window.electron.ipcRenderer.invoke(
    'scraping-background-videos',
    toFetch,
  );

  const parsed = fetched.map((x) => ({
    scrapedAt: Date.now(),
    info: { ...parseVideoNoJs(x.html), videoId: x.videoId },
  }));

  // const fetched = await scrapeVideoMeta(toFetch);
  await addLookups(parsed);

  await window.electron.ipcRenderer.invoke('scraping-background-close');

  return getLookups();
}

export { lookupOrScrapeVideos };
