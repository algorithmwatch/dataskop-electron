/* eslint-disable no-restricted-syntax */
import {
  GetHtmlFunction,
  GetHtmlLazyFunction,
  YtProcedureConfig,
} from '../types';
import { actionProcedure } from './action-procedure';
import { profileProcedure } from './profile-procedure';
import { searchProcedure } from './search-procedure';
import { videosProcedure } from './video-procedure';

// deserialize JSON configs
const createProcedureGenMakers = (
  steps: YtProcedureConfig[],
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
    if (step.type === 'video') {
      const f = (
        x: GetHtmlFunction,
        y: GetHtmlLazyFunction,
        sessiondId: string,
      ) => videosProcedure(x, y, sessiondId, step);

      result.push(f);
    }
    if (step.type === 'profile') {
      const f = (
        x: GetHtmlFunction,
        y: GetHtmlLazyFunction,
        sessiondId: string,
      ) => profileProcedure(x, y, sessiondId, step);

      result.push(f);
    }
    if (step.type === 'search') {
      const f = (
        x: GetHtmlFunction,
        y: GetHtmlLazyFunction,
        sessiondId: string,
      ) => searchProcedure(x, y, sessiondId, step);

      result.push(f);
    }

    if (step.type === 'action') {
      const f = (
        x: GetHtmlFunction,
        y: GetHtmlLazyFunction,
        sessiondId: string,
      ) => actionProcedure(x, y, sessiondId, step);

      result.push(f);
    }
  }

  return result;
};

const createSingleGenerator = (
  steps: YtProcedureConfig[],
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
