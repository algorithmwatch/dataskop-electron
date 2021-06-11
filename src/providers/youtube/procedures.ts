import { clearStorage } from '../../components/scraping/ipc';
import { getSessionData } from '../../db';
import { delay } from '../../utils/time';
import { submitConfirmForm } from './actions/confirmCookies';
import {
  experimentScrapersSlugToFun,
  profileScraperSlugToFun,
  scrapeSeedVideos,
  scrapeSeedVideosAndFollow,
  scrapeVideoSearch,
} from './scrapers';
import {
  GetHtmlFunction,
  GetHtmlLazyFunction,
  ProcedureConfig,
  ProfileProcedureConfig,
  SearchProcedureConfig,
  SeedScraper,
  SeedVideo,
  SeedVideoRepeat,
  VideoProcedureConfig,
} from './types';

const getSeedVideosRepeat = async (
  sessionId: string,
  scrapeAgain: SeedVideoRepeat,
): Promise<SeedVideo[]> => {
  const { previousResult, step, maxVideos } = scrapeAgain;
  const oldData = await getSessionData(sessionId, {
    slug: previousResult,
    step,
  });
  return oldData[0].fields.videos
    .slice(0, maxVideos)
    .map(({ id }) => ({ id, creator: `repeat: ${previousResult}` }));
};

async function* scrapingProfileProcedure(
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
/**
 *  some background on `yield*`:
 *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield%2A
 */
async function* scrapingVideosProcedure(
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
  sessionId: string,
  config: VideoProcedureConfig,
) {
  const {
    followVideos,
    seedVideosFixed,
    seedVideosDynamic,
    seedVideosRepeat,
    scrollingBottomForComments,
    doLogout,
  } = config;

  const isFollowingVideos = !(followVideos == null || followVideos === 0);
  const scrapeComments = !(
    scrollingBottomForComments == null || scrollingBottomForComments === 0
  );

  if (doLogout) {
    await clearStorage();
    await delay(5000);
    await submitConfirmForm(getHtml);
    await delay(5000);
  }

  let step = 0;
  // guess the number of total steps (may get altered later on)
  const approxNumSeedVideos =
    seedVideosDynamic.map((x) => x.maxVideos).reduce((pv, cv) => pv + cv, 0) +
    seedVideosFixed.length;

  let maxSteps =
    seedVideosDynamic.length + approxNumSeedVideos * (followVideos + 1);

  // 1. block: get seed videos
  const seedVideos: SeedVideo[] = seedVideosFixed.map((x) => ({
    id: x,
    creator: 'fixed',
  }));

  // get videos from previous results
  for (const rep of seedVideosRepeat) {
    const newSeed = await getSeedVideosRepeat(sessionId, rep);
    maxSteps += newSeed.length;
    seedVideos.push(...newSeed);
  }

  for (const seedDynamic of seedVideosDynamic) {
    const { slug, maxVideos } = seedDynamic;
    const theslug = slug as SeedScraper;
    const resultSeedVideos = await experimentScrapersSlugToFun[theslug](
      getHtml,
    );

    const numSeedVideos = Math.min(
      resultSeedVideos.fields.videos.length,
      maxVideos,
    );

    // if the projected number of seed videos is not the actual seed values, correct it
    // TODO: is it correct?
    if (maxVideos !== numSeedVideos) {
      maxSteps -= (approxNumSeedVideos - numSeedVideos) * (followVideos + 1);
    }

    // frac must be above 0 to trigger the next call
    step += 1;
    yield [step / maxSteps, resultSeedVideos];

    const newSeed = resultSeedVideos.fields.videos
      .slice(0, numSeedVideos)
      .map(({ id }: { id: string }) => ({
        id,
        creator: slug,
      }));

    seedVideos.push(...newSeed);
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
      seedVideos,
      step,
      maxSteps,
      followVideos,
      scrapeComments,
    );
  }

  return yield* scrapeSeedVideos(
    getHtmlVideos,
    seedVideos,
    step,
    maxSteps,
    scrapeComments,
  );
}

async function* scrapingSearchProcedure(
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
}

const createProcedureGenMakers = (
  steps: ProcedureConfig[],
): ((
  x: GetHtmlFunction,
  y: GetHtmlLazyFunction,
  sessiondId: string,
) => any)[] => {
  const result: ((
    x: GetHtmlFunction,
    y: GetHtmlLazyFunction,
    sessiondId: string,
  ) => any)[] = [];

  for (const step of steps) {
    if (step.type === 'videos') {
      const f = (
        x: GetHtmlFunction,
        y: GetHtmlLazyFunction,
        sessiondId: string,
      ) => scrapingVideosProcedure(x, y, sessiondId, step);

      result.push(f);
    }
    if (step.type === 'profile') {
      const f = (
        x: GetHtmlFunction,
        y: GetHtmlLazyFunction,
        sessiondId: string,
      ) => scrapingProfileProcedure(x, y, sessiondId, step);

      result.push(f);
    }
    if (step.type === 'search') {
      const f = (
        x: GetHtmlFunction,
        y: GetHtmlLazyFunction,
        sessiondId: string,
      ) => scrapingSearchProcedure(x, y, sessiondId, step);

      result.push(f);
    }
  }

  return result;
};

const createSingleGenerator = (
  steps: ProcedureConfig[],
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
  sessionId: string,
) => {
  const genMakers = createProcedureGenMakers(steps);

  async function* gen() {
    let i = 0;

    for (const genM of genMakers) {
      const singleGen = genM(getHtml, getHtmlLazy, sessionId);

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
