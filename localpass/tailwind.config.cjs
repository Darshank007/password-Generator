/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2dd4bf',
          dark: '#14b8a6',
        },
        secondary: '#7c3aed',
      },
      boxShadow: {
        card: '0 10px 30px -15px rgba(0,0,0,0.5)'
      },
      fontFamily: {
        mono: ['ui-monospace','SFMono-Regular','Menlo','Monaco','Consolas','Liberation Mono','Courier New','monospace']
      }
    },
  },
  plugins: [],
}

