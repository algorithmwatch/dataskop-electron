const plugin = require('tailwindcss/plugin');
const colors = require('tailwindcss/colors');

// default config at: https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.tsx', './src/**/*.ts'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        black: colors.black,
        white: colors.white,
        gray: colors.coolGray,
        blue: {
          100: '#dde1f3',
          200: '#bbc3e7',
          300: '#99a5db',
          400: '#7786cf',
          500: '#5568c3',
          600: '#3d51ad',
          700: '#31418b',
          800: '#253169',
          900: '#202b5c',
          1000: '#1c254f',
          1100: '#171f42',
          1200: '#131935',
          1300: '#0e1227',
          1400: '#090c1a',
          1500: '#05060d',
        },
        red: {
          100: '#fce0e0',
          200: '#f9c0c2',
          300: '#f5a1a3',
          400: '#f28284',
          500: '#ef6366',
          600: '#ec4347',
          700: '#e82428',
          800: '#d4161a',
          900: '#ba1317',
          1000: '#9f1114',
          1100: '#850e10',
          1200: '#6a0b0d',
          1300: '#50080a',
          1400: '#350607',
          1500: '#1b0303',
        },
        green: {
          100: '#ebf4f2',
          200: '#d6e9e5',
          300: '#c2ded8',
          400: '#add4cb',
          500: '#99c9bd',
          600: '#84beb0',
          700: '#70b3a3',
          800: '#5ba896',
          900: '#4f9484',
          1000: '#437f71',
          1100: '#386a5e',
          1200: '#2d554b',
          1300: '#223f38',
          1400: '#162a26',
          1500: '#0b1513',
        },
        yellow: {
          100: '#fff9de',
          200: '#fff4bd',
          300: '#ffee9c',
          400: '#ffe87b',
          500: '#ffe35a',
          600: '#ffdd39',
          700: '#ffd818',
          800: '#f6cc00',
          900: '#d7b300',
          1000: '#b99900',
          1100: '#9a8000',
          1200: '#7b6600',
          1300: '#5c4d00',
          1400: '#3e3300',
          1500: '#1f1a00',
        },
      },
      borderWidth: {
        24: '24px',
      },
      inset: {
        '-78': '-19.5rem',
        '-192': '-48rem',
      },
      width: {
        192: '48rem',
      },
      height: {
        18: '4.375rem',
        max: 'max-content',
      },
      zIndex: {
        60: '60',
      },
      margin: {
        '-1/2': '-50%',
      },
      maxHeight: {
        '3/4': '75%',
      },
    },
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
          fontFamily: "'Rubik', sans-serif",
          lineHeight: config('theme.fontSize.6xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
        '.hl-5xl': {
          fontSize: theme('fontSize.5xl'),
          fontFamily: "'Rubik', sans-serif",
          lineHeight: config('theme.fontSize.5xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
        '.hl-4xl': {
          fontSize: theme('fontSize.4xl'),
          fontFamily: "'Rubik', sans-serif",
          lineHeight: config('theme.fontSize.4xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
        '.hl-3xl': {
          fontSize: theme('fontSize.3xl'),
          fontFamily: "'Rubik', sans-serif",
          lineHeight: config('theme.fontSize.3xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
        '.hl-2xl': {
          fontSize: theme('fontSize.2xl'),
          fontFamily: "'Rubik', sans-serif",
          lineHeight: config('theme.fontSize.2xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
        '.hl-xl': {
          fontSize: theme('fontSize.xl'),
          fontFamily: "'Rubik', sans-serif",
          lineHeight: config('theme.fontSize.xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
        '.hl-lg': {
          fontSize: theme('fontSize.lg'),
          fontFamily: "'Rubik', sans-serif",
          lineHeight: config('theme.fontSize.lg')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
        },
      };

      addComponents(headings, ['responsive']);
    }),
  ],
};
