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


const NOINDEX_META = '<meta name="robots" content="noindex,nofollow" />';

export function addNoindexMeta(html: string): string {
  if (/name=["']robots["']/.test(html)) return html;
  return html.replace(/<head>/, `<head>\n    ${NOINDEX_META}`);
}

/**
 * Стенд на GitHub Pages скрывается от поисковиков: noindex в index.html и 404.html и файл robots.txt.
 * В боевых сборках (метка выпуска, локальная сборка) этого нет. Принудительно: NOINDEX=1 / NOINDEX=0.
 */
export function isStandBuild(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.NOINDEX === '1') return true;
  if (env.NOINDEX === '0') return false;
  // Имя процесса стенда: «Deploy to GitHub Pages (проверочный стенд)»; процесс выпуска называется иначе.
  return env.GITHUB_ACTIONS === 'true' && (env.GITHUB_WORKFLOW ?? '').startsWith(PAGES_WORKFLOW);
}

/** Подставляет адрес сайта в index.html и в запасную страницу 404.html; на стенде добавляет запрет индексации. */
function siteUrlPlugin(base: string, siteUrl: string): Plugin {
  let outDir = 'dist';
  return {
    name: 'mf-site-url',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      const out = html.replaceAll('__SITE_URL__', siteUrl);
      return isStandBuild() ? addNoindexMeta(out) : out;
    },
    generateBundle() {
      if (!isStandBuild()) return;
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: 'User-agent: *\nDisallow: /\n' });
    },
    closeBundle() {
      const file = resolve(outDir, '404.html');
      if (!existsSync(file)) return;
      let html = readFileSync(file, 'utf8').replaceAll('__BASE_PATH__', base);
      if (isStandBuild()) html = addNoindexMeta(html);
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
