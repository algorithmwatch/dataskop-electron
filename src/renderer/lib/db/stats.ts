import { statsForArray } from "../utils/math";
import { setUpDb } from "./data";

// some math utils

const getStatisticsForSession = async (sessiondId: string) => {
  const data = await setUpDb();

  const allTasks = data.scrapingResults.filter(
    (x) => x.sessionId === sessiondId,
  );

  allTasks.sort((a, b) => a.scrapedAt - b.scrapedAt);

  const firstResult = data.scrapingSessions.filter(
    (x) => x.sessionId === sessiondId,
  )[0];

  if (!firstResult) return {};

  const { startedAt } = firstResult;
  const allTimesSlug = new Map();
  const allTimesStep = new Map();
  let previousTime = startedAt;

  for (let i = 0; i < allTasks.length; i += 1) {
    const { slug, scrapedAt, step } = allTasks[i];
    const duration = scrapedAt - previousTime;

    if (allTimesSlug.has(slug)) {
      const oldTimes = allTimesSlug.get(slug);
      const newTimes = oldTimes.concat([duration]);
      allTimesSlug.set(slug, newTimes);
    } else {
      allTimesSlug.set(slug, [duration]);
    }

    if (allTimesStep.has(step)) {
      const oldTimes = allTimesStep.get(step);
      const newTimes = oldTimes.concat([duration]);
      allTimesStep.set(step, newTimes);
    } else {
      allTimesStep.set(step, [duration]);
    }

    previousTime = scrapedAt;
  }

  const resultSlug: { [key: string]: any } = {};
  allTimesSlug.forEach((value, key: string) => {
    resultSlug[key] = statsForArray(value);
  });

  const resultStep: { [key: string]: any } = {};
  allTimesStep.forEach((value, key: string) => {
    resultStep[key] = statsForArray(value);
  });

  return { steps: resultStep, slugs: resultSlug };
};

export { getStatisticsForSession };
