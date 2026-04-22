import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-04-22',
  future: {
    compatibilityVersion: 3,
  },
  srcDir: 'app/',
  modules: ['@nuxt/eslint'],
  devtools: { enabled: true },
  css: ['katex/dist/katex.min.css', '~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
})
