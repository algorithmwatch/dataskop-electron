/* eslint-disable no-empty-pattern */
/* eslint-disable no-restricted-syntax */
import cheerio from 'cheerio';
import _ from 'lodash';
import { clickElement, elementExists } from 'renderer/components/scraping/ipc';
import { getUniquePath } from 'renderer/utils/cheerio-unique-selector';
import { currentDelay } from '../..';
import { GetHtmlFunction } from '../types';

const changeWatchHistoryUrl = 'https://www.youtube.com/feed/history';

const holdButtonSvg =
  'M9 16h2V8H9v8zm3-14C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-4h2V8h-2v8z';
const playButtonSvg =
  'M10 16.5l6-4.5-6-4.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z';

const isWatchHistoryHolded = async (
  getHtml: GetHtmlFunction,
  maxSteps: number,
) => {
  const getCurrentHtml = await getHtml(changeWatchHistoryUrl);
  for ({} of _.range(maxSteps)) {
    const { html } = await getCurrentHtml();
    const $hmtl = cheerio.load(html);

    const buttonIcons = $hmtl(
      '#secondary #contents ytd-button-renderer svg path',
    );

    if (buttonIcons == null) {
      await currentDelay();
    } else {
      for (const ele of buttonIcons.toArray()) {
        const $ele = $hmtl(ele);
        if ($ele.attr('d') === holdButtonSvg) {
          const linkElement = $ele.closest('a').first();
          const selectorPath = getUniquePath(linkElement, $hmtl);
          return [false, selectorPath];
        }
        if ($ele.attr('d') === playButtonSvg) {
          const linkElement = $ele.closest('a').first();
          const selectorPath = getUniquePath(linkElement, $hmtl);
          return [true, selectorPath];
        }
      }

      // it's over
      break;
    }
  }
  return [null, null];
};

const clickSecondButton = async (path: string, maxSteps: number) => {
  await clickElement(path);
  for ({} of _.range(maxSteps)) {
    await currentDelay();
    if (await elementExists('#confirm-button > a')) break;
  }
  await clickElement('#confirm-button > a');
};

const deactivateWatchHistory = async (
  getHtml: GetHtmlFunction,
  maxSteps = 100,
) => {
  const [isHolded, path] = await isWatchHistoryHolded(getHtml, maxSteps);

  if (isHolded === null) return false;
  if (isHolded) return false;

  await clickSecondButton(path, maxSteps);

  // was active, needs to turn on again
  return true;
};

const activateWatchHistory = async (
  getHtml: GetHtmlFunction,
  maxSteps = 100,
) => {
  const [isHolded, path] = await isWatchHistoryHolded(getHtml, maxSteps);

  if (isHolded === null) return false;
  if (!isHolded) return false;

  await clickSecondButton(path, maxSteps);

  return true;
};

export { isWatchHistoryHolded, activateWatchHistory, deactivateWatchHistory };
