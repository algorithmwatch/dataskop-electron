# `dataskop-pedd`

DataSkop will be a platform for data donations used to examine and scrutinize algorithmic decision-making systems and to strengthen the users' digital autonomy.
The aim of the project is to empower individuals to handle their data in an informed way, to act safely in digital environments, and to understand and algorithmic systems in use.

More information about DataSkop: https://algorithmwatch.org/en/project/dataskop/

This project was kickstarted with [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate/).
Electron React Boilerplate uses <a href="https://electron.atom.io/">Electron</a>, <a href="https://facebook.github.io/react/">React</a>, <a href="https://github.com/reactjs/redux">Redux</a>, <a href="https://github.com/reactjs/react-router">React Router</a>, <a href="https://webpack.github.io/docs/">Webpack</a> and <a href="https://github.com/gaearon/react-hot-loader">React Hot Loader</a> for rapid application development (HMR).
Read more information about the boilerplate [in their official documentation](https://electron-react-boilerplate.js.org/docs/installation).

## Installation

- **If you have installation or compilation issues with this project, please see [this debugging guide](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/400)**

First, clone the repo via git and install dependencies:

```bash
yarn install
```

We are storing large files in this repositry wit git-lfs.
So please install git-lfs: https://github.com/git-lfs/git-lfs.

## Development

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
yarn dev
```

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

## License

MIT
