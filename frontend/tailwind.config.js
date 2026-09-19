/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F3F7F4',
          100: '#E4EDE7',
          200: '#C7DBCF',
          300: '#9FBFAe',
          400: '#739F8C',
          500: '#52796F',
          600: '#3E6157',
          700: '#2D4E45',
          800: '#203B34',
          900: '#162A25',
          forest: '#1B4D3E',
          leaf: '#2D6A4F',
          sage: '#52796F',
          cream: '#F9FBF7',
          gold: '#D4A373',
          amber: '#E9C46A'
        }
      }
    },
  },
  plugins: [],
}
