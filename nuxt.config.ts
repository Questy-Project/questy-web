export default defineNuxtConfig({
  devtools: { enabled: true },

  ssr: false, // Mode SPA — toutes les pages sont protégées par auth

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    },
  },

  typescript: {
    strict: true,
  },
})