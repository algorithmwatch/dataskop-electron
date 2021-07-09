/* eslint-disable no-restricted-syntax */
import {
  GetHtmlFunction,
  GetHtmlLazyFunction,
  SeedScraper,
  SeedVideo,
  SeedVideoRepeat,
  VideoProcedureConfig,
} from '..';
import { clearStorage } from '../../../components/scraping/ipc';
import { getScrapingResultsBySession } from '../../../db';
import { delay } from '../../../utils/time';
import { submitConfirmForm } from '../actions/confirm-cookies';
import {
  experimentScrapersSlugToFun,
  scrapeSeedVideos,
  scrapeSeedVideosAndFollow,
} from '../scrapers';
import { YtScrapingConfig } from '../types';

const getSeedVideosRepeat = async (
  sessionId: string,
  scrapeAgain: SeedVideoRepeat,
  scrapingConfigSlug: YtScrapingConfig,
): Promise<SeedVideo[]> => {
  const { previousResult, step } = scrapeAgain;

  let filterBy = null;
  if (step !== null) {
    filterBy = { slug: previousResult, step };
  } else {
    filterBy = { slug: previousResult };
  }

  const oldData = await getScrapingResultsBySession(sessionId, filterBy);
  if (oldData.length > 1) {
    console.warn('Uh! Got more than 1 previous result. You sure?');
  }

  const [oldResult] = oldData;

  const { maxVideos } = (
    scrapingConfigSlug.steps[oldResult.step] as VideoProcedureConfig
  ).seedVideosDynamic.filter((x) => x.slug === previousResult)[0];

  return oldResult.fields.videos
    .slice(0, maxVideos)
    .map(({ id }: { id: string }) => ({
      id,
      creator: `repeat: ${previousResult}`,
    }));
};

/**
 *  some background on `yield*`:
 *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield%2A
 */
async function* videosProcedure(
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
  sessionId: string,
  config: VideoProcedureConfig,
  scrapingConfig: YtScrapingConfig,
  enableLogging: boolean,
) {
  const {
    followVideos,
    seedVideosFixed,
    seedVideosDynamic,
    seedVideosRepeat,
    doLogout,
  } = config;

  const isFollowingVideos = !(followVideos == null || followVideos === 0);
  const scrapeComments = false;
  // const scrapeComments = !(
  //   scrollingBottomForComments == null || scrollingBottomForComments === 0
  // );

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
    const newSeed = await getSeedVideosRepeat(sessionId, rep, scrapingConfig);
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
      enableLogging,
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

export { videosProcedure };
