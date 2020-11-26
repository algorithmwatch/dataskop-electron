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

//
// Declare Database
//
class ScrapeDatabase extends Dexie {
  public scrapeResults: Dexie.Table<ScrapeResult, number>; // id is number in this case

  public constructor() {
    super('ScrapeDatabase');
    this.version(1).stores({
      scrapeResults: '++id,sessionId,scrapedAt,task,items',
    });
    this.scrapeResults = this.table('scrapeResults');
  }
}

const db = new ScrapeDatabase();

// https://dexie.org/docs/Dexie/Dexie.transaction()#specify-reusage-of-parent-transaction

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

// clear database but also initialize it
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

export { addData, getData, clearData, getSessionsMetaData, getSessionData };
