# `dataskop-electron`

DataSkop will be a platform for data donations used to examine and scrutinize algorithmic decision-making systems and to strengthen the users' digital autonomy.
The aim of the project is to empower individuals to handle their data in an informed way, to act safely in digital environments, and to understand and algorithmic systems in use.
[Read more about DataSkop on our website.](https://algorithmwatch.org/en/project/dataskop/)

## Installation for Development

This project was kickstarted with [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate/) but heavily modified. [Read more about the boilerplate in their official documentation](https://electron-react-boilerplate.js.org/docs/installation).

### Prerequisite

#### Setup Github token

To install our privates packages from GitHub, you need to setup an access token.

1. create an auth token with scope to read packages: https://github.com/settings/tokens
2. and add it to you: `~/.npmrc`: (replace `thetoken` with your token)

```bash
//npm.pkg.github.com/:_authToken=thetoken
```

Finally, restart your terminal and proceed.

#### Setup Font Awesome Pro token

Follow this tutorial: <https://fontawesome.com/how-to-use/on-the-web/setup/using-package-managers#installing-pro>

You may add the following (replace the token) to aforementioned `~/.npmrc`:

```bash
//npm.fontawesome.com/:_authToken=thetoken
```

#### Setup .env

Copy the `.env.example` to `.env` and adjust the values to your needs.

#### Setup Git LFS

Setup [Git LFS](https://git-lfs.github.com/) to store large, mostly binary files (e.g. images), outside of git.

### Installation

First, install Node v16+. Then, clone the repo via git and install dependencies:

```bash
git clone git@github.com:algorithmwatch/dataskop-electron.git
cd dataskop-electron
npm i
```

### Development

We recommend to use [VS Code](https://code.visualstudio.com/) but you are free to choose another text editor.
VS Code will automatically format and lint the code, and manages imports, has a built-in debugger etc.

```bash
npm start
```

### Static files

Put static files for the renderer process in `src/renderer/static` and not in `resources`.
The latter is only used for the application icon.

## Tests

```bash
npm test
```

Pay attention to the error messages and run the required commands.

## Packaging

### Locally

To package apps for the local platform:

```bash
npm run package
```

To debug a production build:

```bash
npm run cross-env DEBUG_PROD=true npm run package
```

### Production

To deploy a new version:

1. _IMPORTANT_: ensure that you have a clean git status
2. run `npm run version:pre`
3. watch the GitHub action status (and maybe retry) at: <https://github.com/algorithmwatch/dataskop-electron/actions/workflows/publish.yml>

[Read more on how to publish releases for production](./docs/publishing.md)

## Logging

Using [electron-log](https://www.npmjs.com/package/electron-log) to store logs on a user's computer.

```bash
# on macOS
less ~/Library/Logs/DataSkop/renderer.log
```

Optionally using <https://sentry.io> to catch bugs in the wild.

## License

MIT
