# Install Checklist

This file is the intake record for **MultiFrame Проблемомер**. The agent fills it in during product-discipline setup and keeps it current afterwards.

**For the agent:** treat this file as the source of truth for what the product needs. Do not start feature work until everything through _First-version capabilities_ (and every conditional section activated by those answers) is completed. Never ask the product owner anything under _Decided by the agent_ — make those calls yourself and explain them in product terms. Prefer evidence from `README.md`, `PRODUCT_SPEC.md`, and the live SPA; label gaps as **ASSUMPTION**.

**For the product owner:** this is the record of what was decided. If something here is wrong, say so.

Answer cells hold `_unanswered_` until asked, and `n/a` when the question cannot apply. Answers may be in Russian; section headings and capability-ledger state words stay in English: `included` | `available` | `absent` | `removed`. Keep every section heading, even when its rows are all `n/a`.

**Install status:** `completed 2026-09-12`
<!-- Set to: not started | in progress | completed YYYY-MM-DD -->

---

## 1. Project identity

| Question                                                        | Answer |
| --------------------------------------------------------------- | ------ |
| New project from this template, or work on the template itself? | Existing product repo (not a vibe-template install). Product-discipline docs inspired by [di-sukharev/vibe](https://github.com/di-sukharev/vibe) CHECKLIST process. |
| Project name / slug                                             | MultiFrame Проблемомер (`multiframe-problemomer`) |
| Your own GitHub repository URL, if you have one                 | https://github.com/Paulos99/multiframe-problemomer |

Live context (do not redesign from this URL alone): https://paulos99.github.io/multiframe-problemomer/

## 2. Product

| Question                                                  | Answer |
| --------------------------------------------------------- | ------ |
| What product do you want to build first?                  | **MultiFrame Проблемомер** — веб-инструмент спроса на **акустический комфорт** при выборе натяжного потолка с бескаркасной системой **StP MultiFrame**. Это **не** калькулятор материалов и **не** инженерный расчёт звукоизоляции. MVP: только потолок; шум сверху через перекрытие; только frameless MultiFrame. |
| Core value (owner, 2026-09-12; tone 2026-09-13) | Ближе к «без акустики покупаю красивую плёнку, а шум сверху останется», но шире: **в моей/клиентской комнате** понять, что комфорт сейчас понижен; MultiFrame может поднять класс на ступень+; проверить ориентиры; **почувствовать** насколько тише; увидеть **особенности системы** (комфорт, монтаж, универсальность, безопасность) так, чтобы ценность выводилась **сама**; путь «для клиента» — готовый аргумент. **UI без** «за что платим» / давления ценой. |
| Audiences / Start (confirmed 2026-09-13) | На старте только: **«Интересуюсь звукоизоляцией: для себя / для клиента»**. Длинный список ролей/входов — **не UI-опрос**, а **карта JTBD** для полного контента обоснования покупки MultiFrame. |
| User models = JTBD content map (owner 2026-09-13) | Клиент: таргет / поиск / сайт MultiFrame / сайт партнёра. Профи: менеджер продаж, мастер на объекте, замерщик, дизайнер и аналоги. Нужны не отдельные ветки, а **один полный buy-case**, который закрывает эти работы. |
| Further Start clarification | **Не делаем.** Зачем не нужно: если результат уже даёт полную аргументацию покупки MultiFrame (исходное состояние + эффект + плюсы + классы/цифры/аудио), доп. вопросы «менеджер / замер / дизайн» только усложняют вход и не добавляют фактов. UTM может менять хук без вопроса. |
| What is the first user journey that must work end to end? | `для себя`/`для клиента` → комната → сравнение до/после → аудио → профиль + CTA. **Без** опроса сценариев/«что мешает». На результате — полный buy-case; **оба** канала Δ всегда. |
| Result evidence depth (confirmed 2026-09-12) | **Показать всё**, аргументированно, понятно, персонально: **цифры + классы А/Б/В + графики + пояснения к ним**. Не выбирать «только ощущение» или «только цифры». Честная рамка pre_lab / marketing_placeholder сохраняется — это ориентиры под комнату, не лаб-сертификат. |
| Evidence presentation Q4 (confirmed 2026-09-12) | **Всё сразу** на одном скролле: **сверху вывод**, ниже детальные данные. Менеджер и пользователь сами смотрят нужный слой. Не progressive disclosure и не урезание пакета по роли. |
| Charts (confirmed 2026-09-13) | **C — оба:** сверху шкала классов комфорта А→Б→В (куда сдвинемся), ниже столбцы до/после с ориентирами ΔRw / ΔLnw. Без частотного спектра в MVP. Подписи + рамка pre_lab обязательны. |
| Numbers policy (confirmed 2026-09-13) | **Показываем полные числа сейчас** как рабочую модель эффекта MultiFrame — пока **неподтверждённые** (`pre_lab` / `marketing_placeholder`). После техподтверждения **заменим** на корректные. Не прятать цифры в MVP. Не выдавать за лаб-гарантию. |
| MultiFrame features (presentation 2026-09-13 + stp-multiframe.ru) | Эффект барабана под натяжным → MultiFrame рассеивает; до ~17 дБ; AEROCELL / перфорация / SmartLock / шип-паз; Flat+Wave; для клиента монтаж = «быстро, без долгой стройки» (не техника крепежа/коммуникаций); потолок+стены; эко/сертификаты; патент. UI: **понятно + аргументированно** (тезис + короткое почему/как), не голые слоганы и не техдамп; **без** «за что платим». Источник: `docs/sources/06-multiframe-presentation.pdf`. |
| Norm footnote (confirmed 2026-09-13) | Под сдвигом класса: `Ориентир по шкале комфортности (норм. документы)`. |
| Class shift verdict line (confirmed 2026-09-13) | Формат: `Сейчас: {класс} → с MultiFrame: {класс}` (пример: `Сейчас: Дискомфорт → с MultiFrame: Комфорт (Б)`). |
| Comfort class labels (confirmed 2026-09-13) | UI: `Высокий комфорт (А)` · `Комфорт (Б)` · `Допустимый (В)` · **`Дискомфорт`** (когда даже до В не дотягивает — часто). Мягкая отсылка к нормативному документу. А — верх шкалы, не «эконом». |
| Slab thickness ranges (confirmed 2026-09-13) | `До ~160 мм` · `Около 160–200 мм` · `Около 200–250 мм` · `Толще ~250 мм` · `Не знаю`. В модели — mid ASSUMPTION. |
| Slab type ≠ thickness (confirmed 2026-09-13) | Тип и толщина — **два пункта**, не матрица. Толщина — **разбросы** (`До ~160` · `160–200` · `200–250` · `Толще ~250` · `Не знаю`), не точечные мм. |
| Planned ceiling (confirmed 2026-09-13) | `Планируем натяжной` · `Потолок уже есть` · `Не знаю` (вариант B, без строительного жаргона). |
| Noisy neighbors (confirmed 2026-09-13) | `Не знаю` · `Обычно тихо` · `Сверху бывает шумно` (вариант B — мягче, не «шумные соседи»). Не опрос «мешает ли». |
| Before/After «До» comfort (confirmed 2026-09-13) | В буллете карточки «Сейчас типично» — **гибридный класс из модели** (вариант A): `Сейчас: Дискомфорт` / `Допустимый (В)` / `Комфорт (Б)` / `Высокий комфорт (А)`. Не `Тихо/Терпимо/Мешает`. |
| Before/After «После» comfort (confirmed 2026-09-13) | Симметрично: последний буллет `С MultiFrame: {hybrid class}`. Старые chips `Тихо/Терпимо/Мешает` и прежние эмоциональные буллеты Before/After — **устарели**; пишем заново. |
| Before/After bullet frame (confirmed 2026-09-13) | Вариант A: **2 фразы + класс** в каждой карточке. Не одна фраза и не «только класс». |
| Object stage (confirmed 2026-09-13) | `Новостройка / до заселения` · `Идёт ремонт` · `Уже живут` · `Не знаю`. |
| House type options (confirmed 2026-09-13) | `Панельный` · `Блочный` · `Кирпичный` · `Монолит` (в т.ч. монолит-кирпич) · `Деревянный / по балкам` · `Не знаю`. Сталинка ≈ кирпичный (подсказка). |
| Room field order (confirmed 2026-09-13) | тип → площадь → тип перекрытия → толщина перекрытия → пол сверху → тип дома → стадия → потолок → соседи. |
| Room required fields (confirmed 2026-09-13) | Обязательны только **тип комнаты** и **площадь**. Тип/толщина перекрытия, пол сверху, тип дома, стадия, потолок, соседи — можно `Не знаю`. |
| Floor-above options (confirmed 2026-09-13) | Подписи ОК: `Не знаю` · `Обычный пол (без плавающей схемы)` · `Есть плавающий пол / шумоизоляция в полу`. «Без чистового» — не сюда. |
| Floor above unknown OK (confirmed 2026-09-13) | «Не знаю» по полу сверху — нормальный ответ; не блокирует шаг. Модель берёт консервативное ASSUMPTION. |
| Room = primary diagnostic (2026-09-13) | Обязательно: тип + площадь. Перекрытие = **тип** и **толщина** отдельно (не матрица). Плюс: пол сверху, тип дома, стадия, потолок, шумные соседи. Везде опционально `Не знаю`. Год — не в MVP. |
| Always both Δ channels (confirmed 2026-09-13) | На эффективности всегда **воздух и удар**, у каждого — пояснение + ощущение. |
| Scenarios survey (removed 2026-09-13) | Убрать вопрос «что слышите/мешает»: клиент мог не жить в квартире и не задумываться о шуме; опрос провоцирует «мне ничего не мешает». |
| Current complaint survey (removed 2026-09-13) | Убрать вместе со сценариями (тот же антипаттерн). Класс до/после считает модель, не самооценка «мешает». |
| Effectiveness block (confirmed 2026-09-13) | Сначала **ориентиры Δ** (воздух/удар) с **поясняющими подписями и ощущениями** у каждой дельты; затем графики. Рамка pre_lab. |
| Result feature order (confirmed 2026-09-13) | **1)** класс жилья/комфорта → **2)** эффективность → **3)** эффект барабана → **4)** безопасность → **5)** остальное. Монтаж клиенту только как **быстро, без долгой стройки** — без техники крепежа/коммуникаций. |
| Feature copy style (confirmed 2026-09-13) | Преимущества на результате — **тезис + 1 фраза обоснования**. Пример ОК: «Без системы под натяжным воздух работает как барабан. MultiFrame рассеивает эту энергию — в комнате спокойнее.» Не слоганы и не техдамп. |
| Premium copy tone (confirmed 2026-09-13) | Не использовать прямые формулировки про оплату/стоимость («за что платим», акцент на цене). Клиент сам делает вывод о ценности из преимуществ и эффекта. |

## 3. Active surfaces

Mark what is active now. Everything unmarked is deferred and must be left alone: no features, no setup, no test flows for deferred surfaces.

- [ ] `backend` - API, database, auth
- [x] `webapp` - browser SPA (no SEO requirement for this MVP)
- [ ] `website` - public marketing pages that must rank in search or preview when shared
- [ ] `mobile` - native / Expo app

| Question                                                                                                             | Answer |
| -------------------------------------------------------------------------------------------------------------------- | ------ |
| Why the unmarked surfaces are deferred, if it needs explaining                                                       | MVP — один статический SPA на GitHub Pages. Нет серверного API, аккаунтов, SEO-лендинга и нативного приложения. Отдельный «website» не нужен: продукт сам является публичным webapp. Backend / mobile — только если позже появятся CRM-лиды, auth или магазинный оффлайн-режим. |
| If `mobile` is active: are Expo/EAS builds, Expo Push, and Maestro E2E needed now, or left unconfigured until later? | n/a (`mobile` deferred) |

**ASSUMPTION:** vibe’s `webapp` usually means “behind sign-in”; here the SPA is public and unauthenticated. We still mark only `webapp` as active because it is the interactive product surface (not a content/SEO site).

## 4. First-version capabilities

Ask about product needs, not implementations. Mark what the first version actually needs.

- [ ] Accounts / sign-in
- [ ] Saved data that survives a restart
- [ ] File, image, or media uploads → also answer _Files, images, and media_
- [ ] Paid subscriptions or one-off payments → also answer _Payments_
- [ ] Admin tools or roles
- [x] External integrations (which: outbound handoff to MultiFRAME calculator URL; demo lead stub to console only — no real CRM)
- [ ] Real-time chat, presence, collaboration, or live updates

Product capabilities that **are** in the first version (not listed as vibe template toggles above — see ledger):

- 5-step comfort wizard after Start: Room → Before/After → Audio → Result (no scenarios/current quiz)
- Expert qualitative effect model with `marketing_placeholder` ΔRw / ΔLnw and pre_lab disclaimer
- Before/after emotional contrast + SimCompare (feeling primary, dB tertiary)
- Demo audio stubs that sell the difference
- CTA: calculator deep-link + demo lead form
- Mobile-dense layout + sticky question/CTA chrome

| Question                                                                                          | Answer |
| ------------------------------------------------------------------------------------------------- | ------ |
| What the first version explicitly should NOT do (write "nothing ruled out" if that is the answer) | Стены, перегородки, системы пола, Polyblock, каркасные системы; вопрос про этаж; обещание полной нормы Lnw только потолком; фейковые «лабораторные гарантии»; tech dumps в UI; «вдвое спокойнее» для ударного канала; реальные платежи / auth / CRM. Не расширять скоуп в walls/Polyblock. |

## 5. Files, images, and media

No user uploads in MVP. Audio is generated in-browser (Web Audio demo stubs), not uploaded.

| Question                                                                                      | Answer |
| --------------------------------------------------------------------------------------------- | ------ |
| What do users upload?                                                                         | n/a — uploads absent |
| Public, private, shared with selected people, or mixed?                                       | n/a |
| Who can upload, view, replace, and delete?                                                    | n/a |
| Maximum file size and allowed file types                                                      | n/a |
| Do images need thumbnails, resizing, format conversion, compression, cropping, or moderation? | n/a |
| How long do files live after the owning record is deleted?                                    | n/a |
| Should filenames be visible to users, or opaque?                                              | n/a |

## 6. Website data and freshness

`website` surface is deferred. Public SPA is built from the repo and published as static assets.

| Question                                                                                    | Answer |
| ------------------------------------------------------------------------------------------- | ------ |
| Which public product or content data comes from the backend/database at website build time? | n/a |
| How soon after that data changes must the public website show the change?                   | n/a |
| Which changes require an automatic rebuild/redeploy rather than a manual release?           | n/a — GitHub Actions rebuilds the SPA on push to `main` (existing Pages workflow) |

## 7. Payments

Payments are not part of this product.

| Question                                                                                                                    | Answer |
| --------------------------------------------------------------------------------------------------------------------------- | ------ |
| What exactly do users pay for?                                                                                              | n/a |
| Recurring subscription, one-off purchase, or both?                                                                          | n/a |
| Does the public website need a local cart or offer selection before registration/sign-in?                                   | n/a |
| Which active surfaces need payment: browser checkout, App Store / Google Play, native card entry, Apple Pay, or Google Pay? | n/a |
| What stops working when someone does not pay?                                                                               | n/a |

## 8. Deployment

| Question                                                                                     | Answer |
| -------------------------------------------------------------------------------------------- | ------ |
| Is deployment needed now, or local-only for the moment?                                      | Already deployed: static SPA via GitHub Pages. Further commercial hosting unanswered / deferred. |
| Where are your users, and must the data stay in Russia?                                      | **ASSUMPTION:** primary audience is Russia / CIS (StP MultiFrame, Russian UI). No personal data is persisted server-side in MVP (lead is console stub), so residency is not yet a hosting constraint. |
| Hosting, picked by the agent from the answer above: DigitalOcean / Yandex Cloud / own server | Deferred. Current production = **GitHub Pages** (static). Do not migrate hosting until product owner asks. |
| Production domains / URLs for API, webapp, and website; is Yandex CDN needed now?            | Webapp: `https://paulos99.github.io/multiframe-problemomer/` (base path `/multiframe-problemomer/`). API / website / Yandex CDN: n/a for now. Calculator handoff: `https://paulos99.github.io/MF_StP/`. |
| Which surfaces are released first                                                            | `webapp` only |

**Ask the audience question, not the provider question.** Hosting beyond GitHub Pages stays `_unanswered_` / deferred until a real backend or CRM appears.

## 9. Decided by the agent - do not ask the user

Engineering decisions already made / owned by the agent (product terms):

- **Surface:** one public Vite + React + TypeScript SPA (`webapp`). No separate SEO `website`, no backend microservices.
- **Stack (recorded, do not reopen):** Vite + React SPA, client session state, GitHub Actions → GitHub Pages. No microservices.
- **Effect model:** `source: marketing_placeholder`, center ΔRw **+10** (UI range 8–12), ΔLnw **−8** (UI range 6–10), classes **A/B/V** (UI Cyrillic А/Б/В) from Trofimov-style comfort grading; always `pre_lab` / expert disclaimers.
- **Audio:** procedural Web Audio demo stubs; always labeled «демо»; may exaggerate contrast for showroom.
- **CTA:** deep-link to MultiFRAME calculator with query payload; lead form is demo-only (`console` stub), never invent a corporate CRM endpoint.
- **Mobile:** denser inputs + sticky progress/CTA; touch targets ≥44px; no tech dumps.
- **Out of scope code paths:** walls, partitions, floors systems, Polyblock, framed systems — do not add.
- Libraries, file layout, naming, refactors, and validation scope for future feature work follow existing repo patterns; product screen contracts live in `PRODUCT_SPEC.md`.

## 10. Capability ledger

What this project actually contains. The agent updates it whenever a capability is added or removed. Every row carries exactly one state:

- `included` - present and expected to work.
- `available` - partly there but not usable yet; the note says exactly what is still missing.
- `absent` - not part of this project. Build it only after the product owner asks.
- `removed` - deliberately deleted. **Do not re-add it.**

A capability with no row is `absent` by default. The State column always holds one of the four states above — never `_unanswered_` or `n/a`.

| Capability | State | Note |
| ---------- | ----- | ---- |
| Comfort wizard (Start + 4 steps) | included | Start → Room → Before/After → Audio → Result. No scenarios/current quiz. |
| Ceiling-only / upstairs noise scope | included | `answers.scope: 'ceiling'`. No floor question. |
| Frameless MultiFrame positioning | included | Only бескаркасная StP MultiFrame; framed systems out of scope. |
| Room + optional slab input | included | Room type, area m², optional slab key (default solid 180 mm). |
| Noise scenario multi-select | removed | Owner 2026-09-13: do not quiz «что мешает». |
| Current comfort + noise type | removed | Owner 2026-09-13: no complaint quiz; class from model. |
| Emotional before/after contrast | included | Hybrid class on both cards + top verdict; emotional bullets rewritten from scratch (old copy obsolete). |
| SimCompare effect UI | included | Hybrid class primary; no `Тихо/Терпимо/Мешает`; Rw/Lnw tertiary; pre_lab badge. |
| marketing_placeholder Δ model | included | ΔRw +10 (range 8–12), ΔLnw −8 (range 6–10); `source: marketing_placeholder`; `disclaimer: pre_lab`. Never claim lab guarantees. |
| Trofimov-style comfort classes A/B/V | included | Canon A\|B\|V; UI Cyrillic А\|Б\|В; partial/below statuses. Never promise full Lnw norm from ceiling alone. |
| Demo audio difference | included | Web Audio stubs; badges «демо» / «демо-набор»; «вдвое спокойнее» only for air channel. |
| Calculator CTA handoff | included | Opens calculator with `area`, `roomType` (no scenarios). |
| Demo lead form | available | UI + `console` stub + JSON payload (`schemaVersion: 1`). No real StP CRM / email endpoint. |
| Sticky mobile chrome | included | Header + progress + sticky Далее/CTA; denser cards on narrow viewports. |
| Theme toggle (light/dark) | included | Client-only preference. |
| Auth (email + password) | absent | No accounts. |
| Admin roles | absent | — |
| Password reset / email delivery | absent | — |
| Saved sessions / cloud sync | absent | Session lives in memory for the visit. |
| File/media uploads | absent | — |
| Payments / checkout | absent | — |
| Backend API / database | absent | Static SPA only. |
| Real CRM / lead delivery | absent | Demo stub only; do not invent endpoints. |
| Walls / partitions / floor systems | absent | Explicitly out of MVP scope. |
| Polyblock product path | absent | Explicitly out of scope. |
| Framed acoustic systems | absent | Explicitly out of scope. |
| Lab-certified ΔRw/ΔLnw guarantees | absent | Placeholders only; always pre_lab. |
| Native mobile app | absent | Deferred. |
| SEO marketing website | absent | Deferred; SPA is the product. |
| Real-time / WebSockets | absent | — |
| Push notifications | absent | — |
| Social sign-in | absent | — |
| Infrastructure as code (DO/Yandex) | absent | GitHub Pages is enough for static MVP. |

## 11. Environment checks

Verified by the agent during setup, not asked.

- [x] Repository inspected (`README.md`, `src/`, GitHub Pages workflow present)
- [x] Live SPA URL recorded for context only (no redesign-by-coding)
- [x] Product screen contracts captured in `PRODUCT_SPEC.md`
- [ ] `docker compose` — n/a (no backend)
- [x] `git remote` points at `Paulos99/multiframe-problemomer`
- [ ] App-local `.env` — n/a for static MVP (no secrets required to run)
- [ ] Automated validation suite — deferred; acceptance criteria live in `PRODUCT_SPEC.md` (A solo / B showroom ≤3 min)

## 12. After setup

- [x] Durable answers above filled in, install status set to `completed 2026-09-12`
- [x] Validation scope recorded for this project: manual acceptance tests A/B in `PRODUCT_SPEC.md`; no mandatory CI product suite beyond existing Pages build until owner asks
- [x] Product docs added: `CHECKLIST.md`, `PRODUCT_SPEC.md`; README pointer
- [x] Deferred surfaces recorded (backend / website / mobile)
- [ ] `AGENTS.md` Bootstrap block — n/a (this repo does not ship vibe’s AGENTS bootstrap; product rules live here + `PRODUCT_SPEC.md`)
- [x] Local commands remain `npm install` / `npm run dev` / `npm run build` as in README

`README.md` and future agent docs should cross-reference this file by **section name**, not by number.
