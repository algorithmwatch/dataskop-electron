import { GetHtmlFunction, GetHtmlLazyFunction } from 'renderer/providers/types';
import { SearchProcedureConfig, YtScrapingConfig } from '..';
import { scrapeVideoSearch } from '../scrapers';

async function* searchProcedure(
  getHtml: GetHtmlFunction,
  _getHtmlLazy: GetHtmlLazyFunction,
  config: SearchProcedureConfig,
  _scrapingConfig: YtScrapingConfig,
  _procedureArgs: any,
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
