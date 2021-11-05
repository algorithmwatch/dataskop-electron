/* eslint-disable no-restricted-syntax */
import cheerio from 'cheerio';
import { submitFormScraping } from 'renderer/components/scraping/ipc';
import { currentDelay } from '../../..';
import { getUniquePath } from '../../../../utils/cheerio-unique-selector';
import { GetHtmlFunction } from '../types';

const rootUrl = 'https://www.youtube.com/';

const onlySubmitConsentForm = async (html) => {
  const $hmtl = cheerio.load(html);

  const forms = $hmtl('form')
    .toArray()
    .map((ele) => [ele, $hmtl(ele).attr('action')]);

  const theForm = forms.filter((x) => x[1] === 'https://consent.youtube.com/s');

  if (theForm.length === 0) {
    await currentDelay();
  } else {
    const selectorPath = getUniquePath($hmtl(theForm[0][0]), $hmtl);
    submitFormScraping(selectorPath);
  }
};

const submitConfirmForm = async (
  getHtml: GetHtmlFunction,
  submitForm = submitFormScraping,
) => {
  const getCurrentHtml = await getHtml(rootUrl);
  // try 10 times and then give up
  const maxSteps = 10;

  for (let step = 0; step < maxSteps; step += 1) {
    const { html } = await getCurrentHtml();
    const $hmtl = cheerio.load(html);

    const forms = $hmtl('form')
      .toArray()
      .map((ele) => [ele, $hmtl(ele).attr('action')]);

    const theForm = forms.filter(
      (x) => x[1] === 'https://consent.youtube.com/s',
    );

    if (theForm.length === 0) {
      await currentDelay();
    } else {
      const selectorPath = getUniquePath($hmtl(theForm[0][0]), $hmtl);
      submitForm(selectorPath);

      // it's over
      break;
    }
  }
  return [null, null];
};

export { submitConfirmForm, onlySubmitConsentForm };
