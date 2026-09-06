// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    // Server-only secret: single FastAPI base URL, read explicitly from .env.
    backendBaseUrl: process.env.NUXT_BACKEND_BASE_URL ?? '',
  },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/fonts', '@nuxt/image', '@nuxt/scripts', 'v-gsap-nuxt'],
  fonts: {
    families: [
      { name: 'Switzer', provider: 'fontshare', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
      { name: 'Gambarino', provider: 'fontshare', weights: [400], styles: ['normal'] },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
})