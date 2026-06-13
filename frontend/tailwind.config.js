/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finops: {
          dark: '#0B0F19',
          card: 'rgba(20, 26, 42, 0.65)',
          violet: '#7C3AED',
          green: '#10B981',
          accent: '#EC4899',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
