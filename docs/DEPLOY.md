# Выкладка Проблемомера на stp-multiframe.ru/problemomer/

> Актуальный пакет документов для передачи, со скриптом установки и отката по метке выпуска: [handover/](handover/README.md). Ниже — краткая справка.

Короткая инструкция для команды маркетинга и администратора сайта.
Целевой адрес: **https://stp-multiframe.ru/problemomer/**

Проблемомер — набор статических файлов (страница, скрипты, картинки, звуки). Серверная часть не нужна.

## 1. Где взять готовую сборку

Вариант А (без установки программ): со страницы **Releases** репозитория скачайте архив `problemomer-vX.Y.Z.zip` нужного выпуска (рабочий процесс «Выпуск» публикует его при постановке метки). Внутри лежит готовая папка сайта. Установка одной командой — [handover/DEPLOY.md](handover/DEPLOY.md).

Вариант Б (на своём компьютере, нужен Node.js 22):

```bash
npm ci
npm run build
```

Готовые файлы появятся в папке `dist/`. Адрес `stp-multiframe.ru/problemomer/` уже заложен в сборку по умолчанию.

## 2. Куда положить файлы

Содержимое папки `dist/` (не саму папку, а то, что внутри) нужно положить в каталог сайта, который отдаётся по адресу `/problemomer/`. Например, `/var/www/stp-multiframe.ru/problemomer/`.

После выкладки на месте должны быть: `index.html`, `404.html`, `privacy.html`, `manifest.webmanifest`, `sw.js`, `og-share.jpg`, папки `assets/`, `audio/`, `images/`.

## 3. Настройка веб-сервера (nginx)

Нужно, чтобы любой адрес внутри `/problemomer/` отдавал `index.html`, а служебные файлы не застревали в кэше:

```nginx
# Файлы лежат в /var/www/stp-multiframe.ru/problemomer/
location = /problemomer { return 301 /problemomer/; }

location /problemomer/ {
    root /var/www/stp-multiframe.ru;
    try_files $uri $uri/ /problemomer/index.html;
}

# Эти файлы должны проверяться заново при каждом заходе
location ~ ^/problemomer/(index\.html|sw\.js|manifest\.webmanifest)$ {
    root /var/www/stp-multiframe.ru;
    add_header Cache-Control "no-cache";
}

# Файлы с хешем в имени можно кэшировать надолго
location /problemomer/assets/ {
    root /var/www/stp-multiframe.ru;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

Если сайт на другом сервере (Apache, хостинг с панелью), нужны те же два правила: «неизвестный адрес внутри `/problemomer/` → `index.html`» и «`sw.js`, `index.html`, `manifest.webmanifest` не кэшировать».
Файл `404.html` из сборки — запасной вариант: он возвращает на главную страницу Проблемомера, если сервер не умеет отдавать `index.html` вместо ошибки.

## 4. Что можно настроить при сборке

Переменные задаются при сборке (в `.env` или в окружении). Всё необязательное.

| Переменная | По умолчанию | Для чего |
| --- | --- | --- |
| `VITE_BASE_PATH` | `/problemomer/` | Путь на сайте. Влияет на ссылки на картинки, звуки, скрипты, адрес и область действия приложения |
| `VITE_SITE_URL` | `https://stp-multiframe.ru/problemomer/` | Полный адрес для canonical и карточки при отправке ссылки в мессенджерах |
| `VITE_CALCULATOR_URL` | `https://stp-multiframe.ru/calc/` | Ссылка калькулятора на кнопке «Рассчитать количество MultiFrame» и QR-код в PDF |
| `VITE_YM_ID` | пусто | Номер счётчика Яндекс Метрики (баннер cookies появляется только с ним) |
| `VITE_ANALYTICS_INGEST_URL` | пусто | Адрес приёма анонимной аналитики, см. [analytics.md](analytics.md) |

Пример сборки для другого пути:

```bash
VITE_BASE_PATH=/test/problemomer/ VITE_SITE_URL=https://stp-multiframe.ru/test/problemomer/ npm run build
```

## 5. Приложение на телефоне и кэш

- Проблемомер ставится на экран телефона как приложение. Область его действия — только `/problemomer/`, остальные страницы сайта он не затрагивает.
- Файл `sw.js` должен лежать в `/problemomer/` рядом с `index.html`, не в подпапке.
- Обновления подхватываются сами: после выкладки новой версии пользователь получит её при следующем заходе (иногда со второго раза).
- Если на `stp-multiframe.ru` уже есть свой служебный скрипт на корне сайта, его область (`/`) шире; конфликта нет, но убедитесь, что он не перехватывает адреса `/problemomer/`.

## 6. Проверка после выкладки

1. Открыть https://stp-multiframe.ru/problemomer/ в режиме инкогнито: страница, логотипы и звук «до/после» загружаются.
2. Перезагрузить страницу на любом шаге (адрес внутри `/problemomer/`): должна открыться страница, а не ошибка 404.
3. В исходном коде страницы (Ctrl+U) `canonical` и `og:url` ведут на `https://stp-multiframe.ru/problemomer/`.
4. Пройти расчёт до итога: блок «Следующий шаг», шкала «Дискомфорт / Комфорт / Высокий комфорт».
5. Нажать «Скачать PDF»: на последней странице QR-код ведёт на https://stp-multiframe.ru/calc/.
6. Отправить ссылку в мессенджер и убедиться, что показывается карточка с картинкой.
7. https://stp-multiframe.ru/problemomer/privacy.html открывается.

## 7. Откат

Перед выкладкой сохраните копию текущей папки `problemomer/` (например, `problemomer.prev/`). Для отката верните её на место. Старые установленные копии обновятся сами при следующем заходе.

## 8. Проверочный стенд и выпуски

Автоматическая выкладка на GitHub Pages (`.github/workflows/deploy.yml`) остаётся проверочным стендом по адресу https://paulos99.github.io/multiframe-problemomer/. Сборка в этом workflow сама подставляет путь `/multiframe-problemomer/`, на боевую сборку это не влияет.

Проверки (`.github/workflows/ci.yml`: типы, тесты, сборка, архив `problemomer-dist`) работают на каждый запрос на слияние и на `main`. Выпуск по метке `vX.Y.Z` (архив для сервера) описан в [handover/RELEASE.md](handover/RELEASE.md).
