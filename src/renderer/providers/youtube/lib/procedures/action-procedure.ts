import { getScrapingResultsBySession } from "renderer/lib/db";
import { GetHtmlFunction, GetHtmlLazyFunction } from "renderer/providers/types";
import { ActionProcedureConfig, YtScrapingConfig } from "..";
import {
  activateWatchHistory,
  deactivateWatchHistory,
} from "../actions/manage-watch-history";

// eslint-disable-next-line require-yield
async function* actionProcedure(
  getHtml: GetHtmlFunction,
  _getHtmlLazy: GetHtmlLazyFunction,
  config: ActionProcedureConfig,
  _scrapingConfig: YtScrapingConfig,
  procedureArgs: any,
) {
  const { slug } = config;

  if (slug === "yt-activate-watch-history") {
    const data = await getScrapingResultsBySession(procedureArgs.sessionId, {
      slug: "yt-deactivate-watch-history",
    });
    const {
      fields: { turnOnAgain },
    } = data[0];

    if (turnOnAgain) {
      await activateWatchHistory(getHtml);
    }

    return [1, { success: true, slug, fields: {}, errors: [] }];
  }

  if (slug === "yt-deactivate-watch-history") {
    const turnOnAgain = await deactivateWatchHistory(getHtml);
    return [1, { success: true, slug, fields: { turnOnAgain }, errors: [] }];
  }

  return [1, null];
}

export { actionProcedure };
