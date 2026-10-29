# Сборка: боевой путь и путь стенда

Обычно собирать ничего не нужно: готовый архив приходит вместе с выпуском ([RELEASE.md](RELEASE.md)). Эта страница — для проверки
и для случаев, когда выпуск нужно собрать самим из метки.

## Требования

- Node.js 22 (LTS) и npm 10+. Другого ПО не нужно.
- Доступ к npm-реестру при установке зависимостей.

## Команды

```bash
git clone https://github.com/Paulos99/multiframe-problemomer.git && cd multiframe-problemomer
git checkout v1.0.0            # нужная метка выпуска
npm ci                         # точная установка по package-lock.json (не npm install)
npx tsc -b                     # проверка типов
npm test                       # тесты (26)
npm run check:acoustic         # контрольные точки акустической модели
npm run build                  # готовая папка сайта: dist/
```

## Путь на сайте (базовый путь)

Путь и адрес для карточки в мессенджерах подставляются **при сборке** переменными окружения (`vite.config.ts`):

| | `VITE_BASE_PATH` | `VITE_SITE_URL` |
|---|---|---|
| **Боевой** (по умолчанию, ничего задавать не нужно) | `/problemomer/` | `https://stp-multiframe.ru/problemomer/` |
| **Стенд GitHub Pages** (задаёт рабочий процесс `deploy.yml`) | `/multiframe-problemomer/` | `https://paulos99.github.io/multiframe-problemomer/` |
| Любой другой путь (проверка на тестовом поддомене) | например `/test/problemomer/` | полный адрес с протоколом |

Пример для другого пути:

```bash
VITE_BASE_PATH=/test/problemomer/ VITE_SITE_URL=https://stp-multiframe.ru/test/problemomer/ npm run build
```

От пути зависят: ссылки на скрипты, картинки и звуки, `start_url` и `scope` приложения, область сервис-воркера (`sw.js`),
`canonical` и `og:url`, запасная страница `404.html`. Поэтому **сборку под один путь нельзя положить в другой**: боевой
архив работает только по `/problemomer/`, архив стенда — только по `/multiframe-problemomer/`.

## Что получается в `dist/`

`index.html`, `404.html`, `privacy.html`, `manifest.webmanifest`, `sw.js`, `workbox-*.js`, `og-share.jpg`, логотипы,
папки `assets/` (скрипты и стили с хешем в имени), `audio/`, `images/`. В готовом архиве выпуска добавлен ещё файл
`version.txt` с номером выпуска (по нему скрипт установки проверяет, что включена нужная версия).

## Проверка собранного

```bash
grep -o 'rel="canonical" href="[^"]*"' dist/index.html        # → https://stp-multiframe.ru/problemomer/
grep -o '"scope":"[^"]*"' dist/manifest.webmanifest            # → "/problemomer/"
grep -rl 'multiframe-problemomer' dist || echo "путь стенда в сборке не найден (хорошо)"
npx vite preview --base /problemomer/                          # посмотреть: http://localhost:4173/problemomer/
```

## Проверочный стенд на GitHub Pages

Рабочий процесс `.github/workflows/deploy.yml` («Deploy to GitHub Pages») при каждом изменении `main` собирает сайт с путём
стенда и публикует его. Владелец видит результат на https://paulos99.github.io/multiframe-problemomer/ до того, как поставит метку выпуска.
Стенд не зависит от боевого сервера и не влияет на него.
