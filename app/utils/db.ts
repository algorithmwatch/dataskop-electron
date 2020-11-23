// Reason for dexie:
// https://biancadanforth.github.io/git/2017/08/11/storage-one-of-the-final-frontiers.html

// followed: https://github.com/dfahlander/Dexie.js/#hello-world-typescript

import Dexie from 'dexie';

interface ScrapeResult {
  id?: number;
  sessionId?: string;
  data?: string;
  scrapedAt?: number; // number of millisecconds in UTC
}

//
// Declare Database
//
class ScrapeDatabase extends Dexie {
  public scrapeResults: Dexie.Table<ScrapeResult, number>; // id is number in this case

  public constructor() {
    super('ScrapeDatabase');
    this.version(1).stores({
      scrapeResults: '++id,sessionId,data,scrapedAt',
    });
    this.scrapeResults = this.table('scrapeResults');
  }
}

let db = new ScrapeDatabase();

// https://dexie.org/docs/Dexie/Dexie.transaction()#specify-reusage-of-parent-transaction

const addData = (sessionId: string, data: any) => {
  db.transaction('rw', db.scrapeResults, async () => {
    const id = await db.scrapeResults.add({
      sessionId,
      data,
      scrapedAt: Date.now(),
    });
    return id;
  });
};

const getData = (whereClause = {}) => {
  return db.transaction('r', db.scrapeResults, async () => {
    // const res = await db.scrapeResults.where(whereClause).toArray();
    const res = await db.scrapeResults.toArray();
    console.log(res);
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

export { addData, getData, clearData };
