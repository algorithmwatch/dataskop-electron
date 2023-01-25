const plugin = require("tailwindcss/plugin");
const youTubePreset = require("./tailwind.preset.youtube");
const tiktokPreset = require("./tailwind.preset.tiktok");

// default config at: https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js

module.exports = {
  content: ["./src/**/*.tsx", "./src/**/*.ts"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "sans-serif"],
        heading: ["'Rubik'", "sans-serif"],
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
      },
      zIndex: {
        60: "60",
      },
    },
  },
  presets: [youTubePreset, tiktokPreset],
  plugins: [
    // heading plugin
    plugin(({ addComponents, config, theme }) => {
      const headings = {
        ".hl-6xl": {
          fontSize: theme("fontSize.6xl"),
          fontFamily: theme("fontFamily.heading"),
          lineHeight: config("theme.fontSize.6xl")[1].lineHeight,
          fontWeight: theme("fontWeight.bold"),
        },
        ".hl-5xl": {
          fontSize: theme("fontSize.5xl"),
          fontFamily: theme("fontFamily.heading"),
          lineHeight: config("theme.fontSize.5xl")[1].lineHeight,
          fontWeight: theme("fontWeight.bold"),
        },
        ".hl-4xl": {
          fontSize: theme("fontSize.4xl"),
          fontFamily: theme("fontFamily.heading"),
          lineHeight: config("theme.fontSize.4xl")[1].lineHeight,
          fontWeight: theme("fontWeight.bold"),
        },
        ".hl-3xl": {
          fontSize: theme("fontSize.3xl"),
          fontFamily: theme("fontFamily.heading"),
          lineHeight: config("theme.fontSize.3xl")[1].lineHeight,
          fontWeight: theme("fontWeight.bold"),
        },
        ".hl-2xl": {
          fontSize: theme("fontSize.2xl"),
          fontFamily: theme("fontFamily.heading"),
          lineHeight: config("theme.fontSize.2xl")[1].lineHeight,
          fontWeight: theme("fontWeight.bold"),
        },
        ".hl-xl": {
          fontSize: theme("fontSize.xl"),
          fontFamily: theme("fontFamily.heading"),
          lineHeight: config("theme.fontSize.xl")[1].lineHeight,
          fontWeight: theme("fontWeight.bold"),
        },
        ".hl-lg": {
          fontSize: theme("fontSize.lg"),
          fontFamily: theme("fontFamily.heading"),
          lineHeight: config("theme.fontSize.lg")[1].lineHeight,
          fontWeight: theme("fontWeight.bold"),
        },
      };

      addComponents(headings);
    }),
  ],
};
