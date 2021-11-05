/* eslint-disable no-restricted-syntax */
import { getScrapingResultsBySession } from 'renderer/db';
import {
  ActionProcedureConfig,
  GetHtmlFunction,
  GetHtmlLazyFunction,
} from '..';
import {
  activateWatchHistory,
  deactivateWatchHistory,
} from '../actions/manage-watch-history';

// eslint-disable-next-line require-yield
async function* actionProcedure(
  getHtml: GetHtmlFunction,
  _getHtmlLazy: GetHtmlLazyFunction,
  sessionId: string,
  config: ActionProcedureConfig,
) {
  const { slug } = config;

  if (slug === 'yt-activate-watch-history') {
    const data = await getScrapingResultsBySession(sessionId, {
      slug: 'yt-deactivate-watch-history',
    });
    const {
      fields: { turnOnAgain },
    } = data[0];

    if (turnOnAgain) {
      await activateWatchHistory(getHtml);
    }

    return [1, { success: true, slug, fields: {}, errors: [] }];
  }

  if (slug === 'yt-deactivate-watch-history') {
    const turnOnAgain = await deactivateWatchHistory(getHtml);
    return [1, { success: true, slug, fields: { turnOnAgain }, errors: [] }];
  }

  return [1, null];
}

export { actionProcedure };
