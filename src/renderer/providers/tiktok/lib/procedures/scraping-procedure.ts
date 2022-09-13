import { GetHtmlFunction, GetHtmlLazyFunction } from "renderer/providers/types";
import { getMostRecentWatchVideos } from "../data-wrangling";

const scrapeWatchedVideos = async (config: any): Promise<string> => {
  const dump = await window.electron.ipc.invoke("scraping-get-download");
  const ids = getMostRecentWatchVideos(dump, config.max);
  await window.electron.ipc.invoke("tiktok-get-lookups", ids, true);
  return "scraping-done";
};

const scrapeVideosTimeFrame = async (config: any): Promise<string> => {
  return scrapeWatchedVideos(config);
  // const dump = await window.electron.ipc.invoke("scraping-get-download");
  // return "scraping-done";
};

// eslint-disable-next-line require-yield
async function* scrapingProcedure(
  getHtml: GetHtmlFunction,
  _getHtmlLazy: GetHtmlLazyFunction,
  config: any,
  _scrapingConfig: any,
  procedureArgs: any,
) {
  const funs = {
    "tt-scrape-watched-videos": scrapeWatchedVideos,
    "tt-scrape-all-videos-for-time-frame": scrapeVideosTimeFrame,
  };
  const { slug }: { slug: keyof typeof funs } = config;

  try {
    return [
      1,
      {
        success: true,
        slug,
        fields: { status: await funs[slug](config) },
        errors: [],
      },
    ];
  } catch (error) {
    window.electron.log.error("Error with data export step:", error);
    return [1, { success: false, slug, fields: {}, errors: [error] }];
  }
}

export { scrapingProcedure };
