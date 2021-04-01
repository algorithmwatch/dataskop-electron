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

1. create an auth token: https://github.com/settings/tokens
2. and add it to you: `~/.npmrc`

```bash
//npm.pkg.github.com/:_authToken=thetoken
```

To start the Electron app in dev modus:

Install [yarn](https://yarnpkg.com/getting-started/install).

First, clone the repo via git and install dependencies:

```bash
git clone git@github.com:algorithmwatch/dataskop-electron.git
cd dataskop-electron
yarn
```

We are storing large files in this repositry wit git-lfs.
So please install git-lfs: https://github.com/git-lfs/git-lfs.

### Development

We recommend [VS Code](https://code.visualstudio.com/) as text editor.
VS Code will automatically format the code and manage imports when you save a file.

```bash
yarn start
```

This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process.

### Static Files

Put static files used insige the app in `src/static` and not in `resources`.
The latter is only used for the application icon.

## Tests

```bash
yarn test
```

Pay attention to the error messages and run the required commands.

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```

To debug a production built:

```bash
yarn cross-env DEBUG_PROD=true yarn package
```

New pre-release of new minor version:

```bash
yarn run version:preminor
```

## License

MIT
