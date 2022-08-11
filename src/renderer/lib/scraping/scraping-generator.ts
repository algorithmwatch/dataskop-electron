import {
  GetHtmlFunction,
  GetHtmlLazyFunction,
  ScrapingConfig,
} from 'renderer/providers/types';

const deserializeConfigSteps = (config: ScrapingConfig, mapping: any) => {
  return config.steps.map((step) => {
    return (
      x: GetHtmlFunction,
      y: GetHtmlLazyFunction,
      sessiondId: string,
      enableLogging: boolean,
    ) =>
      mapping[step.type].call(
        this,
        x,
        y,
        sessiondId,
        step,
        config,
        enableLogging,
      );
  });
};

const createScrapingGenerator = (
  scrapingConfig: ScrapingConfig,
  mapping: any,
  getHtml: GetHtmlFunction,
  getHtmlLazy: GetHtmlLazyFunction,
  sessionId: string,
  enableLogging: boolean,
) => {
  const genMakers = deserializeConfigSteps(scrapingConfig, mapping);

  async function* gen() {
    let i = 0;

    for (const genM of genMakers) {
      const singleGen = genM(getHtml, getHtmlLazy, sessionId, enableLogging);

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

export { createScrapingGenerator };
