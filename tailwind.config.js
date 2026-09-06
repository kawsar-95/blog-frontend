/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef4ff",
          100: "#dbe6ff",
          200: "#bdd0ff",
          300: "#90b1ff",
          400: "#5e87ff",
          500: "#3a63f5",
          600: "#2547d6",
          700: "#1d36ab",
          800: "#1c3186",
          900: "#1d2f6b",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};