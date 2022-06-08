/* eslint-disable no-restricted-syntax */
import { GetHtmlFunction, GetHtmlLazyFunction } from 'renderer/providers/types';
import { ProfileProcedureConfig } from '..';
import { profileScraperSlugToFun } from '../scrapers';

async function* profileProcedure(
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
  sessiondId: string,
  config: ProfileProcedureConfig,
) {
  const { profileScrapers } = config;

  let step = 0;
  const maxSteps = profileScrapers.length;

  // get background information such as history or subscriptions
  for (const slug of profileScrapers) {
    const data = await profileScraperSlugToFun[slug](getHtml);
    step += 1;
    // already return here if there is no further scraping
    if (step < maxSteps) yield [step / maxSteps, data];
    else return [step / maxSteps, data];
  }

  return [1, null];
}

export { profileProcedure };
