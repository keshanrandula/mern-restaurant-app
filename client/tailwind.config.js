/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbeb',
          100: '#fbf5c4',
          200: '#f7eb94',
          300: '#f2da5d',
          400: '#ecbe2f',
          500: '#d9a11a',
          600: '#bb7e11',
          700: '#975c10',
          800: '#7c4812',
          900: '#673b14',
          950: '#3c1e07',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
