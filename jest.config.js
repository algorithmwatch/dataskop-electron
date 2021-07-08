// jest.config.js
// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */

const config = {
  // forcing ts-jest to also transform .js files to make the ESM module lowdb work.
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'ts-jest',
  },
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testURL: 'http://localhost/',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/.erb/mocks/fileMock.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    // lowdb is a ESM module and this causes some problems right now.
    // To make it work with jest, import the .js files directly.
    lowdb: 'lowdb/lib/index',
    // another ESM module
    'p-queue': 'p-queue/dist/index',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  moduleDirectories: ['node_modules', 'src/node_modules'],
  setupFiles: ['./.erb/scripts/CheckBuildsExist.js'],
  // also transform our TS-only package harke and the ESM module lowdb (and others)

  // profile vis / d3 problems, fix it later
  //`d3-array|internmap|d3-force|d3-quadtree|d3-dispatch|d3-timer|d3-selection`

  transformIgnorePatterns: [
    'node_modules/(?!(@algorithmwatch/harke|lowdb|p-queue|p-timeout|d3-array|internmap|d3-force|d3-quadtree|d3-dispatch|d3-timer|d3-selection))',
  ],
  // only throw warnings for TS problems
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};

module.exports = config;
