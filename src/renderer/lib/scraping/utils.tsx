import { ParserResult } from '@algorithmwatch/harke';
import { range } from 'lodash';
import { GetCurrentHtml, GetHtmlFunction } from 'renderer/providers/types';
import { ScrapingResult } from '../db';
import { delay } from '../utils/time';

const waitUntilDone = async (
  getCurrentHtml: GetCurrentHtml,
  parseHtml: (html: string) => ParserResult,
  isDoneCheck: null | ((arg0: ScrapingResult, arg1: number) => boolean) = null,
  timeout: number,
  times: number,
  slugPrefix = 'yt',
) => {
  const curTimeout = timeout;

  // set to some dummy value to please TypeScript
  let prevResult = {
    success: false,
    fields: {},
    errors: [],
    slug: '',
  } as ScrapingResult;

  let prevHash = null;

  // in last round, return parsing result anyhow

  for (const i of range(times)) {
    const lastRound = i === times - 1;
    await delay(curTimeout);
    const { html, hash } = await getCurrentHtml();

    // parse + check if the hash of the HTML is identical
    // OR 2/3 of times passed and in last round
    const checkAnyhow = Math.floor((times * 2) / 3) === i || lastRound;

    if (prevHash === null || (prevHash !== hash && !checkAnyhow)) {
      prevHash = hash;
      // eslint-disable-next-line no-continue
      continue;
    } else {
      prevHash = hash;
    }

    // cast to slightly different `ScrapingResult`
    const result: ScrapingResult = {
      success: false,
      ...parseHtml(html),
    };
    // always prepend the provider's slug
    result.slug = `${slugPrefix}-${result.slug}`;

    if (
      result.errors.length === 0 &&
      (isDoneCheck === null || isDoneCheck(result, i / (times - 1)))
    ) {
      // mark as success
      result.success = true;
      return result;
    }
    prevResult = result;
  }

  // prevResult is the last extracted result.
  // `success` is still set to `false`.
  return prevResult;
};

const trySeveralTimes = async (
  getHtml: GetHtmlFunction,
  url: string,
  parseHtml: (html: string) => ParserResult,
  isDoneCheck: null | ((arg0: ScrapingResult, arg1: number) => boolean) = null,
  enableLogging = false,
  numTries = 3,
  baseTimeout = 13,
  timeout = 1000,
  slugPrefix = 'yt',
) => {
  let lastRes = {
    success: false,
    fields: {},
    errors: [],
    slug: '',
  } as ScrapingResult;

  const allErros = [];
  // eslint-disable-next-line no-empty-pattern
  for (const i of range(numTries)) {
    try {
      if (enableLogging) window.electron.log.info(`fetch ${url}, try: ${i}`);
      const getCurrentHtml = await getHtml(url);
      // wait after loading since the rendering is still happening
      await delay(timeout);
      const result = await waitUntilDone(
        getCurrentHtml,
        parseHtml,
        isDoneCheck,
        timeout,
        baseTimeout + i * 4,
        slugPrefix,
      );
      if (result !== null && result.success) return result;

      lastRes = result;
    } catch (e) {
      if (enableLogging) window.electron.log.error(JSON.stringify(e));
      console.error(e);
      allErros.push(e);
    }
  }
  if (!lastRes.success) {
    if (enableLogging)
      window.electron.log.error(
        `Too many failed tries to extract html: ${JSON.stringify(allErros)}`,
      );

    // hotfix to overcome channel error
    if (lastRes.errors.length === 1 && lastRes.errors[0].field === 'channel') {
      lastRes.success = true;
      lastRes.fields.channel = {
        id: 'invalid',
        name: '',
        url: '',
        thumbnail: '',
      };
      return lastRes;
    }
    lastRes.errors.push({
      message: `Too many failed tries to extract html: ${JSON.stringify(
        allErros,
      )}`,
      field: 'general error',
    });
  }
  return lastRes;
};

export { trySeveralTimes };