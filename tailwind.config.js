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
      colors: {
        'questy-purple': '#534AB7',
        'questy-orange': '#D85A30',
        'questy-dark':   '#0F0A2E',
        'questy-light':  '#EEEDFE',
        'questy-violet': '#7F77DD',
        'questy-sheet':  '#211a6e',
      },
    },
  },
  plugins: [],
}