## Logging

Using [electron-log](https://www.npmjs.com/package/electron-log) to store logs on a user's computer.

```bash
# on macOS
less ~/Library/Logs/DataSkop/renderer.log
less ~/Library/Logs/DataSkop/main.log
```

Optionally using <https://sentry.io> to catch bugs in the wild.

Optionally storing a providers HTML pages in user data folder.

```bash
ls ~/Library/Application\ Support/dataskop-electron
```
