module.exports = {
  extends: 'erb',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    // not working well with TypeScript
    'react/require-default-props': 'off',
    'react/no-unused-prop-types': 'off',
    // allow console for debugging
    'no-console': 'off',
    // not useful for iterative software development
    'import/prefer-default-export': 'off',
    // useful for async scraping / generators
    'no-await-in-loop': 'off',
    // not helpful
    'react/react-in-jsx-scope': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-restricted-syntax': 'off',
    'no-underscore-dangle': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
