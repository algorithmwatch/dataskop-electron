/* eslint-disable no-restricted-syntax */
import {
  GetHtmlFunction,
  GetHtmlLazyFunction,
  SearchProcedureConfig,
} from '..';
import { scrapeVideoSearch } from '../scrapers';

async function* searchProcedure(
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
  sessionId: string,
  config: SearchProcedureConfig,
) {
  const { queries } = config;
  for (const [i, q] of queries.entries()) {
    const result = await scrapeVideoSearch(getHtml, q);
    if (i === queries.length - 1) return [1, result];
    // frac must be above 0 to trigger the next call
    yield [(i + 1) / queries.length, result];
  }

  // should never happen
  return [1, null];
}

export { searchProcedure };
