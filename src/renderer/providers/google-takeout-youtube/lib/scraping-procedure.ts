import { ProcedureArgs } from "renderer/lib/scraping";
import { GetHtmlFunction, GetHtmlLazyFunction } from "renderer/providers/types";

const scrapeWatchedVideos = async (
  config: any,
  procedureArgs: ProcedureArgs,
): Promise<string> => {
  await window.electron.ipc.invoke(
    "google-takout-youtube-scrape-watched-videos",
    config.maxVideos,
    config.maxScraping,
  );
  return "scraping-done";
};

// eslint-disable-next-line require-yield
async function* scrapingProcedure(
  getHtml: GetHtmlFunction,
  _getHtmlLazy: GetHtmlLazyFunction,
  config: any,
  _scrapingConfig: any,
  procedureArgs: ProcedureArgs,
) {
  const funs = {
    "gtyt-scraping-watched-videos": scrapeWatchedVideos,
  };
  const { slug }: { slug: keyof typeof funs } = config;

  try {
    return [
      1,
      {
        success: true,
        slug,
        fields: { status: await funs[slug](config, procedureArgs) },
        errors: [],
      },
    ];
  } catch (error) {
    window.electron.log.error(`Error with scraping: ${error}`);
    return [1, { success: false, slug, fields: {}, errors: [error] }];
  }
}

export { scrapingProcedure };
