// This is legacy code for indexedDb / Dexie.js.
// We switched to lowdb because there were some strange bugs with losing the connection to the index db.
// See e.g. https://github.com/dfahlander/Dexie.js/issues/613

// // Reason for dexie:
// // https://biancadanforth.github.io/git/2017/08/11/storage-one-of-the-final-frontiers.html

// // followed: https://github.com/dfahlander/Dexie.js/#hello-world-typescript

// import Dexie from 'dexie';
// import { statsForArray } from '../utils/math';
// import { ScrapingResultSaved, ScrapingSessions } from './types';

// // Declare Database
// class ScrapingDatabase extends Dexie {
//   public scrapingResults: Dexie.Table<ScrapingResultSaved, number>;

//   public scrapingSessions: Dexie.Table<ScrapingSessions, number>;

//   public constructor() {
//     super('ScrapingDatabase');
//     this.version(2).stores({
//       scrapingResults: '++id,sessionId,scrapedAt,slug,result,errorMessage',
//       scrapingSessions: '++id,sessionId,startedAt,configSlug',
//     });
//     this.scrapingResults = this.table('scrapingResults');
//     this.scrapingSessions = this.table('scrapingSessions');
//   }
// }

// const initDb = () => new ScrapingDatabase();

// let globalDb: ScrapingDatabase | null = null;

// // hotfix: https://github.com/dfahlander/Dexie.js/issues/613#issuecomment-841608979
// const db = (): ScrapingDatabase => {
//   if (!globalDb) {
//     globalDb = initDb();
//   }

//   const idb = globalDb.backendDB();

//   if (idb) {
//     try {
//       // Check if if connection to idb did not close in the meantime by access indexDb directly
//       idb.transaction('scrapingResults').abort();
//       console.log('success');
//     } catch (e) {
//       console.error(e);
//       console.log('yes, there was a problem');
//       try {
//         globalDb.close();
//       } catch (ee) {
//         console.error(ee);
//       }
//       const theinterval = setInterval(() => {
//         try {
//           globalDb = initDb();
//           clearInterval(theinterval);
//         } catch (eee) {
//           console.error(eee);
//         }
//       }, 200);
//     }
//   }

//   return globalDb;
// };

// const closeDb = () => {
//   globalDb?.close();
//   globalDb = null;
// };

// // https://dexie.org/docs/Dexie/Dexie.transaction()#specify-reusage-of-parent-transaction

// const addNewSession = (sessionId: string, configSlug: string) => {
//   const thedb = db();
//   return thedb.transaction('rw', thedb.scrapingSessions, async () =>
//     thedb.scrapingSessions.add({
//       sessionId,
//       startedAt: Date.now(),
//       configSlug,
//     }),
//   );
// };

// const addScrapingResult = (sessionId: string, data: any) => {
//   const thedb = db();
//   return thedb.transaction('rw', thedb.scrapingResults, async () => {
//     const id = await thedb.scrapingResults.add({
//       sessionId,
//       ...data,
//       scrapedAt: Date.now(),
//     });
//     return id;
//   });
// };

// const importRow = async (row: ScrapingResultSaved): Promise<number> => {
//   /**
//    * import already scraped data and try to keep the original id if possible.
//    */

//   const thedb = db();
//   return thedb.transaction('rw', thedb.scrapingResults, async () => {
//     const { id } = row;

//     if (id != null) {
//       delete row.id;
//       const existingRow = await thedb.scrapingResults.get(id);
//       if (existingRow === null) {
//         // no row with this id exists, so re-use the id
//         await thedb.scrapingResults.add(row, id);
//         return 1;
//       }
//       // row was already entered
//       if (existingRow === row) return 0;
//     }

//     // id is undefined so generate new id
//     await thedb.scrapingResults.add(row);
//     return 1;
//   });
// };

// const getScrapingResults = () => {
//   const thedb = db();
//   return thedb.transaction('r', thedb.scrapingResults, async () => {
//     const res = await thedb.scrapingResults.orderBy('scrapedAt').toArray();
//     return res;
//   });
// };

// const getSessionData = (sessiondId: string) => {
//   const thedb = db();
//   return thedb.transaction('r', thedb.scrapingResults, async () => {
//     const res = await thedb.scrapingResults
//       .where('sessionId')
//       .equals(sessiondId)
//       .toArray();
//     return res;
//   });
// };

// const clearData = () => {
//   db()
//     .scrapingResults.clear()
//     .then(() => {
//       console.log('Rows successfully deleted');
//       return true;
//     })
//     .catch((err) => {
//       console.error(`Could not delete rows ${err}`);
//       return false;
//     });
//   return true;
// };

// // https://github.com/dfahlander/Dexie.js/issues/415#issuecomment-268772586
// const getUniqueSessionIds = () =>
//   db().scrapingResults.orderBy('sessionId').uniqueKeys();

// const getSessions = async () => {
//   const thedb = db();

//   const sessionsIds = await getUniqueSessionIds();
//   const sessions = await Promise.all(
//     sessionsIds.map(async (x) => {
//       const session = await thedb.scrapingSessions
//         .where('sessionId')
//         .equals(x)
//         .first();
//       return {
//         count: await thedb.scrapingResults.where('sessionId').equals(x).count(),
//         ...session,
//       };
//     }),
//   );
//   sessions.sort((a, b) => (b?.startedAt || 0) - (a?.startedAt || 0));
//   return sessions;
// };

// const getStatisticsForSession = async (sessiondId: string) => {
//   const allTasks = await db()
//     .scrapingResults.where('sessionId')
//     .equals(sessiondId)
//     .toArray();

//   allTasks.sort((a, b) => a.scrapedAt - b.scrapedAt);

//   const firstResult = await db()
//     .scrapingSessions.where('sessionId')
//     .equals(sessiondId)
//     .first();

//   if (!firstResult) throw new Error('no records for sessionId found');

//   const { startedAt } = firstResult;
//   const allTimes = new Map();
//   let previousTime = startedAt;

//   for (let i = 0; i < allTasks.length; i += 1) {
//     const { slug, scrapedAt } = allTasks[i];
//     const duration = scrapedAt - previousTime;

//     if (allTimes.has(slug)) {
//       const oldTimes = allTimes.get(slug);
//       const newTimes = oldTimes.concat([duration]);
//       allTimes.set(slug, newTimes);
//     } else {
//       allTimes.set(slug, [duration]);
//     }

//     previousTime = scrapedAt;
//   }

//   const result = {};
//   allTimes.forEach((value, key: string) => {
//     result[key] = statsForArray(value);
//   });
//   return result;
// };

// export {
//   closeDb,
//   addScrapingResult,
//   importRow,
//   getScrapingResults,
//   clearData,
//   getSessions,
//   getSessionData,
//   addNewSession,
//   getStatisticsForSession,
// };
