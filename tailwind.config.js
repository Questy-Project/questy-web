export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        'loading-bar': {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        'loading-bar': 'loading-bar 1.2s ease-in-out infinite',
      },
      colors: {
        'questy-purple': '#534AB7',
        'questy-orange': '#D85A30',
        'questy-dark':   '#0F0A2E',
        'questy-light':  '#EEEDFE',
        'questy-violet': '#7F77DD',
        'questy-sheet':  '#211a6e',
        'questy-gold':   '#f2ca50',
      },
    },
  },
  plugins: [],
}