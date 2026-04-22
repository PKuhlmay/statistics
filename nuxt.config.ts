import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-04-22',
  future: {
    compatibilityVersion: 3,
  },
  srcDir: 'app/',
  modules: [
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/hints',
    '@vite-pwa/nuxt',
  ],
  devtools: { enabled: true },
  css: ['katex/dist/katex.min.css', '~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Statistic Learning',
      short_name: 'StatLearn',
      theme_color: '#18181b',
      icons: [
        {
          src: '/favicon.ico',
          sizes: '64x64',
          type: 'image/x-icon',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
  },
})
