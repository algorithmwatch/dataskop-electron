/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/App.js",
    "./src/components/VizOne.js",
    "./src/components/VizOneDropDown.js",
    "./src/components/VizOneToggleButtons.js",
  ],
  theme: {
    extend: {},
    colors: {
      pink: {
        light: "#ffc4d7",
        dark: "#ff0050",
        // border: "#ff6e9c",
      },
      aqua: {
        dark: "#00f2ea",
        light: "#a1fffc",
        // border: "92d9d7",
      },
      black: "#000000",
      white: "#ffffff",
      gray: {
        600: "#4b5563",
        300: "#d1d5db",
        700: "#374151",
      },
    },
  },
  plugins: [],
};
