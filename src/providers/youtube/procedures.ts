/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import { clearStorage } from '../../components/scraping/ipc';
import { delay } from '../../utils/time';
import { submitConfirmForm } from './actions/confirmCookies';
import { experimentScrapers } from './scrapers';
import {
  GetHtmlFunction,
  GetHtmlLazyFunction,
  ProcedureConfig,
  ProfileProcedureConfig,
  VideoProcedureConfig,
} from './types';

const { scrapeSeedVideos, scrapeSeedVideosAndFollow } = experimentScrapers;

async function* scrapingProfileProcedure(
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
  config: ProfileProcedureConfig,
) {
  const { profileScrapers } = config;

  let step = 0;
  const maxSteps = profileScrapers.length;

  // get background information such as history or subscriptions
  for (const fun of profileScrapers) {
    const data = await fun(getHtml);
    step += 1;
    // already return here if there is no further scraping
    if (step < maxSteps) yield [step / maxSteps, data];
    else return [step / maxSteps, data];
  }

  return [1, null];
}
/**
 *  some background on `yield*`:
 *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield%2A
 */
async function* scrapingVideosProcedure(
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
  config: VideoProcedureConfig,
) {
  const {
    followVideos,
    seedVideosDynamic,
    scrollingBottomForComments,
    seedVideosFixed,
    doLogout,
  } = config;

  const isFollowingVideos = !(followVideos == null || followVideos === 0);
  const scrapeComments = !(
    scrollingBottomForComments == null || scrollingBottomForComments === 0
  );

  if (doLogout) {
    await clearStorage();
    await delay(3000);
    await submitConfirmForm(getHtml);
    await delay(3000);
  }

  let step = 0;
  // guess the number of total steps (may get altered later on)
  const approxNumSeedVideos =
    seedVideosDynamic.map((x) => x.maxVideos).reduce((pv, cv) => pv + cv, 0) +
    seedVideosFixed.length;

  let maxSteps =
    seedVideosDynamic.length + approxNumSeedVideos * (followVideos + 1);

  // 1. block: get seed videos
  let seedVideoIds: string[] = seedVideosFixed;
  for (const { getVideos, maxVideos } of seedVideosDynamic) {
    const resultSeedVideos = await getVideos(getHtml);
    const numSeedVideos = Math.min(
      resultSeedVideos.fields.videos.length,
      maxVideos,
    );

    // if the projected number of seed videos is not the actual seed values, correct it
    // TODO: is it correct?
    if (maxVideos !== numSeedVideos) {
      maxSteps -= (approxNumSeedVideos - numSeedVideos) * (followVideos + 1);
    }

    step += 1;
    yield [step / maxSteps, resultSeedVideos];
    seedVideoIds = seedVideoIds
      .slice(0, numSeedVideos)
      .concat(resultSeedVideos.fields.videos.map(({ id }) => id));
  }

  // 2. block: get acutal video + video recommendations
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

// const createProcedure =
//   (config: ProcedureConfig) => (x: GetHtmlFunction, y: GetHtmlLazyFunction) =>
//     scrapingYoutubeProcedure(x, y, config);

const createProcedureGenMakers = (
  steps: ProcedureConfig[],
): ((x: GetHtmlFunction, y: GetHtmlLazyFunction) => any)[] => {
  const result: ((x: GetHtmlFunction, y: GetHtmlLazyFunction) => any)[] = [];

  for (const step of steps) {
    if (step.type === 'videos') {
      const f = (x: GetHtmlFunction, y: GetHtmlLazyFunction) =>
        scrapingVideosProcedure(x, y, step);

      result.push(f);
    }
    if (step.type === 'profile') {
      const f = (x: GetHtmlFunction, y: GetHtmlLazyFunction) =>
        scrapingProfileProcedure(x, y, step);

      result.push(f);
    }
  }

  return result;
};

const createSingleGenerator = (
  steps: ProcedureConfig[],
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
) => {
  const genMakers = createProcedureGenMakers(steps);

  async function* gen() {
    let i = 0;

    for (const genM of genMakers) {
      const singleGen = genM(getHtml, getHtmlLazy);

      while (true) {
        const { value, done } = await singleGen.next();

        // transform [frac, data] to [normalizedFrac, step, data]

        const fracFixed =
          value[0] * (1 / genMakers.length) + i / genMakers.length;

        const valueFixed = [fracFixed, i].concat(value.slice(1));

        if (done && i + 1 === genMakers.length) return valueFixed;
        yield valueFixed;

        if (done) break;
      }
      i += 1;
    }
    // should never happen
    return [1, 0, null];
  }
  return gen();
};

export { createSingleGenerator, createProcedureGenMakers };
