import { getMostRecentWatchVideos } from "@algorithmwatch/schaufel-wrangle";
import { ProcedureArgs } from "renderer/lib/scraping";
import { GetHtmlFunction, GetHtmlLazyFunction } from "renderer/providers/types";

const scrapeWatchedVideos = async (
  config: any,
  procedureArgs: ProcedureArgs,
): Promise<string> => {
  const dump = await window.electron.ipc.invoke("downloads-get");
  const ids = getMostRecentWatchVideos(
    dump,
    config.maxVideos,
    config.minWatchedSeconds,
  );
  await window.electron.ipc.invoke(
    "tiktok-scrape-videos",
    ids,
    true,
    config.maxScraping,
    procedureArgs.htmlLogging,
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
    "tt-scrape-watched-videos": scrapeWatchedVideos,
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
