// only extract data from HTML, used for

import { parseVideoNoJs } from '@algorithmwatch/harke';
import _ from 'lodash';
import { addLookups, getLookups } from 'renderer/lib/db';
import { delay } from 'renderer/lib/utils/time';
import { submitConfirmForm } from './actions/confirm-cookies';

async function lookupOrScrapeVideos(videoIds: string[]) {
  let items = await getLookups({ deleteOld: true, ids: videoIds });

  const readyIds = new Set(Object.keys(items));

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

  const parsed = Object.assign(
    {},
    ...fetched.map((x: { videoId: any; html: string }) => ({
      [x.videoId]: {
        data: {
          ...parseVideoNoJs(x.html),
          createdAt: Date.now(),
          provider: 'youtube',
        },
      },
    })),
  );

  await addLookups(parsed);

  await window.electron.ipcRenderer.invoke('scraping-background-close');

  return getLookups({ deleteOld: false, ids: videoIds });
}

export { lookupOrScrapeVideos };
