/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import { experimentScrapers } from './scrapers';

const { scrapeSeedVideos, scrapeSeedVideosAndFollow } = experimentScrapers;

/**
 *  some background on `yield*`:
 *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield%2A
 */
async function* scrapingYoutubeProcedure(
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
  config: ProcedureConfig,
) {
  const {
    followVideos,
    seedCreators,
    personalScrapers,
    scrollingBottomForComments,
    seedFixedVideos,
  } = config;

  const isFollowingVideos = !(followVideos == null || followVideos === 0);
  const scrapeComments = !(
    scrollingBottomForComments == null || scrollingBottomForComments === 0
  );

  let step = 0;
  // guess the number of total steps (may get altered later on)
  const approxNumSeedVideos =
    seedCreators.map((x) => x.approxNumVideos).reduce((pv, cv) => pv + cv, 0) +
    seedFixedVideos.length;

  let maxSteps =
    seedCreators.length +
    approxNumSeedVideos * (followVideos + 1) +
    personalScrapers.length;

  // 1. block: get seed videos
  let seedVideoIds: string[] = seedFixedVideos;
  for (const { seedFunction, approxNumVideos } of seedCreators) {
    const resultSeedVideos = await seedFunction(getHtml);
    const numSeedVideos = Math.min(
      resultSeedVideos.fields.videos.length,
      approxNumVideos,
    );

    // if the projected number of seed videos is not the actual seed values, correct it
    // TODO: is it correct?
    if (approxNumVideos !== numSeedVideos) {
      maxSteps -= (approxNumSeedVideos - numSeedVideos) * (followVideos + 1);
    }

    step += 1;
    yield [step / maxSteps, resultSeedVideos];
    seedVideoIds = seedVideoIds
      .slice(0, numSeedVideos)
      .concat(resultSeedVideos.fields.videos.map(({ id }) => id));
  }

  // 2. block: get background information such as history or subscriptions
  for (const fun of personalScrapers) {
    const data = await fun(getHtml);
    step += 1;
    // already return here if there is no further scraping
    if (step < maxSteps) yield [step / maxSteps, data];
    else return [step / maxSteps, data];
  }

  // 3. block: get acutal video + video recommendations
  // use lazy loading if comments are required

  const getHtmlVideos = getHtml;

  // TODO: if scraping comments again

  // const getHtmlVideos = !scrapeComments
  //   ? getHtml
  //   : (url: string) =>
  //       getHtmlLazy(
  //         url,
  //         scrollingBottomForComments,

  //       );

  if (isFollowingVideos) {
    return yield* scrapeSeedVideosAndFollow(
      getHtmlVideos,
      seedVideoIds,
      step,
      maxSteps,
      followVideos,
      scrapeComments,
    );
  }

  return yield* scrapeSeedVideos(
    getHtmlVideos,
    seedVideoIds,
    step,
    maxSteps,
    scrapeComments,
  );
}

// eslint-disable-next-line import/prefer-default-export
export { scrapingYoutubeProcedure };
