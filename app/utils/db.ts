// Reason for dexie:
// https://biancadanforth.github.io/git/2017/08/11/storage-one-of-the-final-frontiers.html

// followed: https://github.com/dfahlander/Dexie.js/#hello-world-typescript

import Dexie from 'dexie';

interface ScrapeResult {
  id?: number;
  sessionId?: string;
  scrapedAt?: number; // number of millisecconds in UTC
  task?: string;
  items?: string;
}

interface ScrapingSessions {
  id?: number;
  sessionId?: string;
  startedAt?: number; // number of millisecconds in UTC
}

//
// Declare Database
//
class ScrapeDatabase extends Dexie {
  public scrapeResults: Dexie.Table<ScrapeResult, number>; // id is number in this case

  public scrapingSessions: Dexie.Table<ScrapingSessions, number>; // id is number in this case

  public constructor() {
    super('ScrapeDatabase');
    this.version(2).stores({
      scrapeResults: '++id,sessionId,scrapedAt,task,items',
      scrapingSessions: '++id,sessionId,startedAt',
    });
    this.scrapeResults = this.table('scrapeResults');
    this.scrapingSessions = this.table('scrapingSessions');
  }
}

const db = new ScrapeDatabase();

// https://dexie.org/docs/Dexie/Dexie.transaction()#specify-reusage-of-parent-transaction

const newSession = (sessionId: string) => {
  db.transaction(
    'rw',
    db.scrapingSessions,
    async () =>
      await db.scrapingSessions.add({ sessionId, startedAt: Date.now() })
  );
};

const addData = (sessionId: string, data: any) => {
  db.transaction('rw', db.scrapeResults, async () => {
    const id = await db.scrapeResults.add({
      sessionId,
      ...data,
      scrapedAt: Date.now(),
    });
    return id;
  });
};

const getData = () => {
  return db.transaction('r', db.scrapeResults, async () => {
    const res = await db.scrapeResults.toArray();
    return res;
  });
};

const getSessionData = (sessiondId: string) => {
  return db.transaction('r', db.scrapeResults, async () => {
    const res = await db.scrapeResults
      .where('sessionId')
      .equals(sessiondId)
      .toArray();
    return res;
  });
};

const clearData = () => {
  db.scrapeResults
    .clear()
    .then(() => {
      console.log('Rows successfully deleted');
      return true;
    })
    .catch((err) => {
      console.error(`Could not delete rows ${err}`);
      return false;
    });
  return true;
};

// https://github.com/dfahlander/Dexie.js/issues/415#issuecomment-268772586
const getUniqueSessionIds = () =>
  db.scrapeResults.orderBy('sessionId').uniqueKeys();

const getSessionsMetaData = async () => {
  const sessionsIds = await getUniqueSessionIds();
  const sessions = await Promise.all(
    sessionsIds.map(async (x) => {
      return {
        count: await db.scrapeResults.where('sessionId').equals(x).count(),
        scrapedAt: (await db.scrapeResults.where('sessionId').equals(x).first())
          ?.scrapedAt,
        id: x,
      };
    })
  );
  sessions.sort((a, b) => b.scrapedAt - a.scrapedAt);
  return sessions;
};

const medianForArray = (arr) => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const statsForArray = (arr: number[]) => {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const average = arr.reduce((p, c) => p + c, 0) / arr.length;
  const median = medianForArray(arr);
  return { min, max, average, median };
};

const getStatisticsForSession = async (sessiondId) => {
  const allTasks = await db.scrapeResults
    .where('sessionId')
    .equals(sessiondId)
    .toArray();

  allTasks.sort((a, b) => a.scrapedAt - b.scrapedAt);

  const { startedAt } = await db.scrapingSessions
    .where('sessionId')
    .equals(sessiondId)
    .first();

  const allTimes = new Map();

  let previousTime = startedAt;

  for (let i = 0; i < allTasks.length; i += 1) {
    const task = allTasks[i];
    const duration = task.scrapedAt - previousTime;
    if (allTimes.has(task.task)) {
      const oldTimes = allTimes.get(task.task);
      const newTimes = oldTimes.concat([duration]);
      allTimes.set(task.task, newTimes);
    } else {
      allTimes.set(task.task, [duration]);
    }
    previousTime = task.scrapedAt;
  }

  const result = {};
  allTimes.forEach((value, key: string) => {
    result[key] = statsForArray(value);
  });
  return result;
};

export {
  addData,
  getData,
  clearData,
  getSessionsMetaData,
  getSessionData,
  newSession,
  getStatisticsForSession,
};
