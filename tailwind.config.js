const plugin = require('tailwindcss/plugin');

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.tsx', './src/**/*.ts'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    // heading plugin
    plugin(function ({ addComponents, config, theme }) {
      const headings = {
        '.hl-6xl': {
          fontSize: theme('fontSize.6xl'),
          lineHeight: config('theme.fontSize.6xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
        '.hl-5xl': {
          fontSize: theme('fontSize.5xl'),
          lineHeight: config('theme.fontSize.5xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
        '.hl-4xl': {
          fontSize: theme('fontSize.4xl'),
          lineHeight: config('theme.fontSize.4xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
        '.hl-3xl': {
          fontSize: theme('fontSize.3xl'),
          lineHeight: config('theme.fontSize.3xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
        '.hl-2xl': {
          fontSize: theme('fontSize.2xl'),
          lineHeight: config('theme.fontSize.2xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
        '.hl-xl': {
          fontSize: theme('fontSize.xl'),
          lineHeight: config('theme.fontSize.xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
        '.hl-lg': {
          fontSize: theme('fontSize.lg'),
          lineHeight: config('theme.fontSize.lg')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
      };

      addComponents(headings, ['responsive']);
    }),
  ],
};
