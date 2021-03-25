# Known Issues

## Database

> Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.InvalidStateError: Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.

There is a hard-to-reprocude bug with indexdb: https://github.com/dfahlander/Dexie.js/issues/613

This

```
yarn rebuild && yarn start
```

seems to fix it. However, all the data is lost. :/
