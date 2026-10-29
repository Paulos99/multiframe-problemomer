import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Адрес размещения задаётся переменными окружения при сборке (см. docs/DEPLOY.md):
 *   VITE_BASE_PATH — путь на сайте, по умолчанию `/problemomer/` (stp-multiframe.ru/problemomer/);
 *   VITE_SITE_URL  — полный адрес с протоколом для canonical и карточки в мессенджерах,
 *                    по умолчанию `https://stp-multiframe.ru/problemomer/`.
 * Для проверочного стенда на GitHub Pages deploy.yml передаёт свои значения.
 */
const DEFAULT_BASE = '/problemomer/';
const DEFAULT_SITE_URL = 'https://stp-multiframe.ru/problemomer/';

function normalizeBase(raw: string | undefined): string {
  const value = (raw ?? '').trim();
  if (!value || value === '/') return value === '/' ? '/' : DEFAULT_BASE;
  return `/${value.replace(/^\/+|\/+$/g, '')}/`;
}

function normalizeSiteUrl(raw: string | undefined, base: string): string {
  const value = (raw ?? '').trim();
  if (!value) return DEFAULT_SITE_URL.replace(/\/problemomer\/$/, '') + base;
  return `${value.replace(/\/+$/, '')}/`;
}

/** Подставляет адрес сайта в index.html и в запасную страницу 404.html. */
function siteUrlPlugin(base: string, siteUrl: string): Plugin {
  let outDir = 'dist';
  return {
    name: 'mf-site-url',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      return html.replaceAll('__SITE_URL__', siteUrl);
    },
    closeBundle() {
      const file = resolve(outDir, '404.html');
      if (!existsSync(file)) return;
      const html = readFileSync(file, 'utf8').replaceAll('__BASE_PATH__', base);
      writeFileSync(file, html);
    },
  };
}

/**
 * Проверочный стенд GitHub Pages (workflow «Deploy to GitHub Pages») живёт в подпапке репозитория.
 * Пока в deploy.yml не заданы свои переменные, берём значения стенда отсюда.
 */
const PAGES_WORKFLOW = 'Deploy to GitHub Pages';
const PAGES_BASE = '/multiframe-problemomer/';
const PAGES_SITE_URL = 'https://paulos99.github.io/multiframe-problemomer/';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const isPagesStand =
    process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_WORKFLOW === PAGES_WORKFLOW;
  const base = normalizeBase(
    process.env.VITE_BASE_PATH ?? env.VITE_BASE_PATH ?? (isPagesStand ? PAGES_BASE : undefined),
  );
  const siteUrl = normalizeSiteUrl(
    process.env.VITE_SITE_URL ?? env.VITE_SITE_URL ?? (isPagesStand ? PAGES_SITE_URL : undefined),
    base,
  );

  return {
    base,
    plugins: [
      react(),
      siteUrlPlugin(base, siteUrl),
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
          id: base,
          start_url: base,
          scope: base,
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
          navigateFallback: `${base}index.html`,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2,mp3}'],
        },
      }),
    ],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
  };
});
