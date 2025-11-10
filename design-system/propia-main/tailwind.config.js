/** @type {import('tailwindcss').Config} */ 
module.exports = {
  content: [
    "./App.{js,ts,tsx}",
    "./components/**/*.{js,ts,tsx}",
    "./app/**/*.{js,ts,tsx}",
    "./global.css", // Include global.css
  ],
  theme: {
    extend: {
      fontFamily: {
        'outfit': ['Outfit_400Regular'],
        'outfit-bold': ['Outfit_700Bold'],
      },
      spacing: {
        global: '24px'
      },
      colors: {
        // Light theme colors
        highlight: '#FF2056',
        light: {
          primary: '#ffffff', // White
          secondary: '#F5F5F5', // Light gray
          text: '#000000', // Black
          subtext: '#64748B'
        },
        // Dark theme colors
        dark: {
          primary: '#171717', // Black
          secondary: '#262626',
          darker: '#000000',
          text: '#ffffff', // White
          subtext: '#A1A1A1'
        },
      },
    },
  },
  plugins: [],
};