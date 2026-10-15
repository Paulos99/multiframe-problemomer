import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Project Pages: https://paulos99.github.io/multiframe-problemomer/
export default defineConfig({
  base: '/multiframe-problemomer/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-stp.png', 'logo-multiframe.png', 'og-share.jpg'],
      manifest: {
        name: 'Проблемомер MultiFrame',
        short_name: 'Проблемомер',
        description: 'Проверка шума сверху и эффекта MultiFrame за 2 минуты',
        theme_color: '#01644f',
        background_color: '#f4f7f6',
        display: 'standalone',
        lang: 'ru',
        start_url: '/multiframe-problemomer/',
        scope: '/multiframe-problemomer/',
        icons: [
          {
            src: 'logo-stp.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'logo-stp.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/multiframe-problemomer/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2,mp3}'],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
