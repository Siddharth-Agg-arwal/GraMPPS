// tailwind.config.js
const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(dropdown|input|menu|divider|popover|button|ripple|spinner|form).js"
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-open-sans)', 'Open Sans', 'Arial', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};