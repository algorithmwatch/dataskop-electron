// only extract data from HTML, used for

import { parseVideoNoJs } from '@algorithmwatch/harke';
import pLimit from 'p-limit';
import { addLookups, getLookups } from '../../db';
import { getVideoUrl } from './utils';

async function scrapeMetaInformation(url: string) {
  console.log(url);
  const res = await fetch(url);
  const html = await res.text();

  console.log(res.url);
  console.log('done');
  console.log(res.status);

  return {
    info: parseVideoNoJs(html),
    scrapedAt: Date.now(),
  };
}

async function scrapeVideoMeta(videoIds: string[]) {
  // 10 was too much
  const limit = pLimit(3);
  const output = videoIds.map((x) =>
    limit(() => scrapeMetaInformation(getVideoUrl(x))),
  );
  return Promise.all(output);
}

async function lookupOrScrapeVideos(videoIds: string[]) {
  const data = await getLookups();
  console.log(data);
  const readyIds = new Set(
    data.filter(({ info }) => info != null).map(({ info: { id } }) => id),
  );

  // only fetch new videos that are not already stored
  const toFetch = videoIds.filter((x) => !readyIds.has(x));
  const fetched = await scrapeVideoMeta(toFetch);
  await addLookups(fetched);

  return getLookups();
}

export { scrapeMetaInformation, scrapeVideoMeta, lookupOrScrapeVideos };
