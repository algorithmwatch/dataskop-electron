import { GetHtmlFunction, GetHtmlLazyFunction } from 'renderer/providers/types';

const getDataExport = async (getHtml) => {
  const xx = getHtml();

  // https://www.tiktok.com/setting?activeTab=dyd

  // browser needs to store session data
  // 1. check if logged in
  // 2. check if requested
  // 3. if yes, wait
  // 4. if no, get the data
};

async function* actionProcedure(
  getHtml: GetHtmlFunction,
  _getHtmlLazy: GetHtmlLazyFunction,
  sessionId: string,
  config: any,
  _scrapingConfig: any,
  _enableLogging: boolean,
) {
  const { slug } = config;

  if (slug === 'tt-data-export') {
    const [done, data] = await getDataExport(getHtml);
    if (done) return [1, { success: true, slug, fields: {}, errors: [] }];
  }

  return [1, null];
}

export { actionProcedure };
