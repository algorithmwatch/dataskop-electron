// only extract data from HTML, used for

import { parseVideoNoJs } from "@algorithmwatch/harke";
import _ from "lodash";
import { currentDelay } from "renderer/lib/delay";
import { submitConfirmForm } from "./actions/confirm-cookies";

async function lookupOrScrapeVideos(videoIds: string[], enableLogging = false) {
  const items = await window.electron.ipc.invoke("db-get-lookups", videoIds);

  const readyIds = new Set(Object.keys(items));

  if (enableLogging) {
    window.electron.log.info(
      `lookupOrScrapeVideos: about to scrape ${
        videoIds.length - readyIds.size
      } of ${videoIds.length} videos`,
    );
  }
  const getHtml = async () => {
    await window.electron.ipc.invoke("scraping-background-init");
    return () =>
      window.electron.ipc.invoke("scraping-background-get-current-html");
  };

  await submitConfirmForm(getHtml, (sel) =>
    window.electron.ipc.invoke("scraping-background-submit-form", sel),
  );

  // important to wait some secconds to set the responding cookie in the session
  await currentDelay("longer");

  // only fetch new videos that are not already stored
  const toFetch = _.uniq(videoIds.filter((x) => !readyIds.has(x)));

  const fetched: any[] = await window.electron.ipc.invoke(
    "youtube-scraping-background-videos",
    toFetch,
  );

  const parsed = Object.assign(
    {},
    ...fetched.map((x: { videoId: any; html: string }) => ({
      [x.videoId]: {
        data: {
          ...parseVideoNoJs(x.html),
          createdAt: Date.now(),
          provider: "youtube",
        },
      },
    })),
  );

  await window.electron.ipc.invoke("db-set-lookups", parsed);

  if (enableLogging) {
    window.electron.log.info(
      `lookupOrScrapeVideos: adding ${fetched.length} new videos to lookup`,
    );
  }

  await window.electron.ipc.invoke("scraping-background-close");

  return window.electron.ipc.invoke("db-get-lookups", videoIds);
}

export { lookupOrScrapeVideos };
