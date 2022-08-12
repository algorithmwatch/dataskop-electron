import cheerio from 'cheerio';
import { extractHtml } from 'renderer/components/scraping/ipc';
import { currentDelay } from 'renderer/lib/delay';
import { GetHtmlFunction } from 'renderer/providers/types';
import { getUniquePath } from '../../../../vendor/cheerio-unique-selector';

const rootUrl = 'https://www.youtube.com/';

const submitFormScraping = (selector: string) => {
  return window.electron.ipc.invoke('scraping-submit-form', selector);
};

const onlySubmitConsentForm = async (html: string) => {
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

const confirmCockieForm = async () => {
  const url = await window.electron.ipc.invoke('scraping-get-url');

  if (
    url !== null &&
    url.startsWith('https://consent.youtube.com') &&
    url.includes('account')
  ) {
    onlySubmitConsentForm((await extractHtml()).html);
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

export { confirmCockieForm, submitConfirmForm };
