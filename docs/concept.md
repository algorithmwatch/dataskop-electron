# Concept, Software Design Decisions, Software Architecture

## Package everything

All code gets packaged with the app, no code gets loaded remotely.
While this is possibile it's discouraged (because it may lead to security issues).
We may have to change this if the parser for a provider needs to get updated very often.
But genereally, we could also publish a new release every time a parser update is required.

## Only TypeScript

Write only TypeScript (or JavaScript) to keep it simple, do not try to include Python or other stuff.
Even thought there are more sophisticated Python packages for scraping, [cheerio](https://github.com/cheeriojs/cheerio) is fine.
Try not to use any kind of native module.

## Database

Initially, we've used [Dexie.js](https://github.com/dfahlander/Dexie.js/) with indexedDB to store data. But we ran into strangle problems that we were unable to fix. The resulting error message:

> Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.InvalidStateError: Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.

Did not give us the option to debug it. We have found a hard-to-reprocude bug with indexedDB: https://github.com/dfahlander/Dexie.js/issues/613

So we decided to to [lowdb](https://github.com/typicode/lowdb) to store all data in JSON file in the `userData` directory.
