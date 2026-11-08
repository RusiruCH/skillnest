/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        playground: {
          bg: '#0d1117',
          sidebar: '#161b22',
          panel: '#1f242c',
          border: '#30363d',
          accent: '#238636',
          text: '#c9d1d9',
          muted: '#8b949e',
        },
      },
    },
  },
  plugins: [],
};
