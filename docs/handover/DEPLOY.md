# Установка, обновление и откат на сервере

Целевой адрес: **https://stp-multiframe.ru/problemomer/**. Нужен веб-сервер с HTTPS и возможностью отдавать файлы из каталога.
Пример для nginx — [../../deploy/nginx/problemomer.conf](../../deploy/nginx/problemomer.conf).

## Как устроена выкладка

```
/var/www/stp-multiframe.ru/                 ← SITE_ROOT (корень сайта)
├── problemomer  →  .releases/problemomer/v1.0.1    ← ссылка на включённый выпуск (её и видит nginx)
└── .releases/problemomer/
    ├── v1.0.0/   предыдущий выпуск (для отката)
    ├── v1.0.1/   текущий выпуск
    ├── current, previous                           ← служебные файлы с номерами
    └── _before-first-install/                      ← то, что лежало по этому адресу до первой установки
```

Включение и откат — это перекладывание ссылки: сайт не бывает «наполовину обновлённым».

## Первая установка

1. На сервере нужны `bash`, `curl`, `unzip`, `sha256sum` (обычно уже есть). Node.js **не нужен**.
2. Получите скрипты (они в репозитории, код сайта на сервер не попадает):
   ```bash
   curl -fsSLO https://raw.githubusercontent.com/Paulos99/multiframe-problemomer/v1.0.0/deploy/install-release.sh
   curl -fsSLO https://raw.githubusercontent.com/Paulos99/multiframe-problemomer/v1.0.0/deploy/rollback.sh
   chmod +x install-release.sh rollback.sh
   ```
   (в адресе — номер выпуска; скрипты берутся из той же метки).
3. Подключите настройки nginx из `deploy/nginx/problemomer.conf` и `deploy/nginx/security-headers.conf`
   (последний сохраните как `/etc/nginx/snippets/problemomer-security-headers.conf`). Проверьте `nginx -t`, затем `nginx -s reload`.
4. Установите выпуск:
   ```bash
   SITE_ROOT=/var/www/stp-multiframe.ru \
   SMOKE_URL=https://stp-multiframe.ru/problemomer/ \
   ./install-release.sh v1.0.0 <контрольная_сумма_из_сообщения_владельца>
   ```
   Скрипт: скачивает `problemomer-v1.0.0.zip`, сверяет sha256, распаковывает в `.releases/problemomer/v1.0.0`,
   переключает ссылку и проверяет `https://stp-multiframe.ru/problemomer/version.txt`. Если проверка не прошла, возвращает предыдущий выпуск.
5. Пройдите [проверку после выкладки](#проверка-после-выкладки) и [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md).

## Обновление

Владелец сообщает: «Выпуск v1.0.1, сумма `…`». Выполните ту же команду с новым номером:

```bash
SITE_ROOT=/var/www/stp-multiframe.ru SMOKE_URL=https://stp-multiframe.ru/problemomer/ ./install-release.sh v1.0.1 <сумма>
```

Перезагрузка nginx не нужна. Пользователи получают новую версию при следующем заходе (иногда со второго раза: так работает автообновление приложения).
Хранится 5 последних выпусков (`KEEP=10` — другое число).

## Откат

```bash
SITE_ROOT=/var/www/stp-multiframe.ru ./rollback.sh           # на предыдущий выпуск
SITE_ROOT=/var/www/stp-multiframe.ru ./rollback.sh v1.0.0    # на конкретный, если он ещё на диске
```

Откат занимает секунды. Установленные на телефонах копии обновятся сами при следующем заходе. Если нужного выпуска нет на диске,
установите его заново тем же `install-release.sh`. Сообщите владельцу, что откатили и почему.

## Установка вручную (без скрипта)

1. Скачайте `problemomer-vX.Y.Z.zip` и `.sha256` со страницы [Releases](https://github.com/Paulos99/multiframe-problemomer/releases).
2. `sha256sum -c problemomer-vX.Y.Z.zip.sha256`
3. Распакуйте **содержимое** архива в новую папку, например `/var/www/stp-multiframe.ru/.releases/problemomer/vX.Y.Z`.
4. Переключите ссылку: `ln -sfn <папка выпуска> /var/www/stp-multiframe.ru/problemomer.new && mv -T /var/www/stp-multiframe.ru/problemomer.new /var/www/stp-multiframe.ru/problemomer`.
5. Для отката верните ссылку на прежнюю папку тем же способом.

Если на сервере не nginx (Apache, хостинг с панелью): нужны те же правила — «любой неизвестный адрес внутри `/problemomer/` отдаёт
`index.html`» и «`index.html`, `sw.js`, `manifest.webmanifest`, `version.txt` не кэшировать». Файл `404.html` из сборки — запасной вариант.

## Проверка после выкладки

1. https://stp-multiframe.ru/problemomer/ в режиме инкогнито: страница, логотипы и звук «до/после» загружаются.
2. https://stp-multiframe.ru/problemomer/version.txt отвечает номером выпуска (`v1.0.0`).
3. Перезагрузка страницы на любом шаге мастера: открывается страница, а не ошибка 404.
4. В исходном коде страницы (Ctrl+U): `canonical` и `og:url` ведут на `https://stp-multiframe.ru/problemomer/`.
5. Расчёт до итога: блок «Следующий шаг», шкала «Дискомфорт / Комфорт / Высокий комфорт».
6. «Скачать PDF»: на последней странице QR-код ведёт на https://stp-multiframe.ru/calc/.
7. Ссылка в мессенджере показывает карточку с картинкой.
8. https://stp-multiframe.ru/problemomer/privacy.html открывается.
9. Если заданы Метрика и таблица: после согласия на cookies в Метрике появляются цели `pm_*`, в таблице появляется строка ([../ИНСТРУКЦИЯ_ДЛЯ_МАРКЕТИНГА.md](../ИНСТРУКЦИЯ_ДЛЯ_МАРКЕТИНГА.md)).

## Приложение на телефоне и кэш

- Область действия приложения — только `/problemomer/`, остальные страницы сайта оно не затрагивает.
- `sw.js` должен лежать в `/problemomer/` рядом с `index.html`, не в подпапке.
- Если на корне `stp-multiframe.ru` есть свой сервис-воркер, убедитесь, что он не перехватывает адреса `/problemomer/` и `/calc/`.
- После выкладки при сомнениях проверьте в браузере (инструменты разработчика → Application → Service Workers), что активна последняя версия.
