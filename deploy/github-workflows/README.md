# Файлы рабочих процессов GitHub Actions: что перенести в `.github/workflows/`

Токен ассистента не имеет права `workflow`, поэтому новые файлы рабочих процессов лежат здесь.
Владелец репозитория переносит их в `.github/workflows/` (через веб-интерфейс GitHub: Add file → Create new file, путь `.github/workflows/<имя>`,
затем удаляет эту папку отдельным коммитом).

| Файл здесь | Куда | Что делает | Статус |
|---|---|---|---|
| `release.yml` | `.github/workflows/release.yml` | По метке `vX.Y.Z` на `main`: проверки, сборка под `/problemomer/`, архив `problemomer-vX.Y.Z.zip` и `.sha256` в GitHub Release | **новый** |

Существующие `ci.yml` и `deploy.yml` не менялись.

## Перед первым выпуском

1. Перенести `release.yml`.
2. Завести секреты репозитория (Settings → Secrets and variables → Actions), если нужны Метрика и таблица для боевого сайта:
   `PROD_VITE_YM_ID`, `PROD_VITE_ANALYTICS_INGEST_URL` (значения даёт команда маркетинга; можно оставить пустыми).
3. Settings → Actions → General → Workflow permissions: достаточно «Read repository contents»; рабочий процесс сам запрашивает `contents: write`
   только для публикации выпуска (если запрещено на уровне организации/репозитория — разрешите «Read and write permissions»).
4. Проверить защиту: метки `v*` и ветка `main` (Settings → Rules).
5. Поставить метку: `git tag -a v1.0.0 -m "…" && git push origin v1.0.0`. Дождаться зелёного запуска «Выпуск» и появления архива на странице Releases.
