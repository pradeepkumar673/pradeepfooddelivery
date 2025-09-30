/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A400C',
        secondary: '#819067',
        accent: '#B1AB86',
        background: '#FEFAE0',
      },
    },
  },
  plugins: [],
}