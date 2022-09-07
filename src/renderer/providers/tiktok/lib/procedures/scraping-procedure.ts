import { GetHtmlFunction, GetHtmlLazyFunction } from "renderer/providers/types";

const scrapeWatchedVideos = async (config) => {
  const dump = await window.electron.ipc.invoke("scraping-get-download");
  return "done";
};

const scrapeVideosTimeFrame = async (config) => {
  const dump = await window.electron.ipc.invoke("scraping-get-download");
  return "done";
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
