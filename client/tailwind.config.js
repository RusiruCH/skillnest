/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        playground: {
          bg: '#0d1117',
          sidebar: '#161b22',
          panel: '#1f242c',
          border: '#30363d',
          accent: '#238636',
          text: '#c9d1d9',
          muted: '#8b949e'
        }
      }
    },
  },
  plugins: [],
}
