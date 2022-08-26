module.exports = {
  theme: {
    extend: {
      colors: {
        turquoise: {
          50: "#e8fffe",
          100: "#befffd",
          200: "#94fffb",
          300: "#6afffa",
          400: "#40fff8",
          500: "#16f7ef",
          600: "#00cec7",
          700: "#00a5a0",
          800: "#007c78",
          900: "#005451",
        },
      },
      boxShadow: {
        flat: "10px 10px 0 0 #EEEEEE",
      },
      borderRadius: {
        "4xl": "1.75rem",
        "5xl": "2.25rem",
      },
      keyframes: {
        fade: {
          "0%,50%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        fade1: "fade 6s infinite alternate-reverse both",
        fade2: "fade 6s infinite alternate both",
      },
    },
  },
};
