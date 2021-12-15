# `dataskop-electron`

DataSkop will be a platform for data donations used to examine and scrutinize algorithmic decision-making systems and to strengthen the users' digital autonomy.
The aim of the project is to empower individuals to handle their data in an informed way, to act safely in digital environments, and to understand and algorithmic systems in use.
[Read more about DataSkop on our website.](https://algorithmwatch.org/en/project/dataskop/)

## Installation for Development

This project was kickstarted with [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate/).
Electron React Boilerplate uses <a href="https://electron.atom.io/">Electron</a>, <a href="https://facebook.github.io/react/">React</a>, [TypeScript](https://www.typescriptlang.org/), <a href="https://github.com/reactjs/react-router">React Router</a>, <a href="https://webpack.github.io/docs/">Webpack</a> and <a href="https://github.com/gaearon/react-hot-loader">React Hot Loader</a> for rapid application development (HMR).
[Read more about the boilerplate in their official documentation](https://electron-react-boilerplate.js.org/docs/installation).

### Prerequisite

#### Setup Github Token

To install all private packages (location as GitHub Packages):

1. create an auth token with scope to read packages: https://github.com/settings/tokens
2. and add it to you: `~/.npmrc`: (replace `thetoken` with your token)

```bash
//npm.pkg.github.com/:_authToken=thetoken
```

Finally, restart your terminal and proceed.

#### Setup Font Awesome Pro

Follow this tutorial: <https://fontawesome.com/how-to-use/on-the-web/setup/using-package-managers#installing-pro>

You may add the following (replace the token) to aforementioned `~/.npmrc`:

```bash
//npm.fontawesome.com/:_authToken=thetoken
```

#### Setup Git LFS

Setup [Git LFS](https://git-lfs.github.com/) to store large, mostly binary files (e.g. images), outside of git.

### Installation

First, install Node v16+. Then, clone the repo via git and install dependencies:

```bash
git clone git@github.com:algorithmwatch/dataskop-electron.git
cd dataskop-electron
npm i
```

We are storing large files in this repositry wit git-lfs.
So please install git-lfs: https://github.com/git-lfs/git-lfs.

### Development

We recommend [VS Code](https://code.visualstudio.com/) as text editor.
VS Code will automatically format the code and manage imports when you save a file.

```bash
npm start
```

This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process.

### Static Files

Put static files used insige the app in `src/renderer/static` and not in `resources`.
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

Optionally using <https://sentry.io>.

## License

MIT
