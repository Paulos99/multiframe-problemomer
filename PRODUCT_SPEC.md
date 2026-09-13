# PRODUCT_SPEC — MultiFrame Проблемомер

Screen-by-screen product contract for the MVP SPA. Exact Russian UI strings are normative. Engineering may rearrange markup, but must not change meaning, omit required copy, or reintroduce out-of-scope capabilities from `CHECKLIST.md` (Capability ledger).

**Related:** `CHECKLIST.md` (intake + ledger) · live context `https://paulos99.github.io/multiframe-problemomer/` (do not redesign from the live site alone).

**Audiences (confirmed 2026-09-12):** homeowner/customer **and** showroom manager are **equal**. One answer flow; **role switcher on Start** with two short hooks. Role changes framing/copy emphasis and CTA wording, not the 7-step data path.

**Core value (owner-confirmed direction):** show that in *this* room comfort is lower than assumed; MultiFrame can raise comfort class (often by a step+); let user feel how much quieter; explain what ~500k pays for (quiet + frameless “beautiful and quiet ceiling”, not only ΔdB); give manager a fast sales argument. Still **not** a materials calculator and **not** a lab certificate.

**Global product rules**

- Feeling + comfort-class story first on early screens; **no numbers on Start**.
- On Before/After + Profile: show the **full evidence pack** — personal room story, classes А/Б/В, numbers, charts, and plain-language explanations of each (owner 2026-09-12: «показать всё, аргументированно, понятно, персонально»).
- **Evidence layout (Q4, owner 2026-09-12):** everything on one scroll — **conclusion / verdict on top**, detailed data below. Not progressive disclosure; not role-trimmed packs. Manager and homeowner skim what they need. Same stack for both roles (role may still change copy/CTA emphasis).
- **Charts (owner 2026-09-13):** **both** — comfort **class scale А→Б→В** (arrow “where we move”) **above**; **before/after bars** for oriented ΔRw / ΔLnw **below**. Not spectrum/frequency charts in MVP. Always with plain-language captions + `pre_lab` framing.
- Effect source: `marketing_placeholder`; disclaimer: `pre_lab` / expert qualitative — never lab guarantees. Charts/numbers are **oriented arguments**, not certificates.
- ΔRw center **+10** (show range **+8…+12**); ΔLnw center **−8** (show range **−6…−10** as absolute 6…10 in UI copy).
- Classes **A/B/V** (UI: **А/Б/В**), Trofimov-style comfort grading — “пониженный → выше классом” is a required narrative beat.
- «примерно вдвое спокойнее» **only for air (воздух)**; impact (удар) = quieter + floor often needed — never claim Lnw norm from ceiling alone.
- Audio must sell the difference; demo stubs allowed with clear «демо» labeling.
- Mobile: denser inputs + sticky question/CTA; pack stays one scroll with sticky verdict readable above the fold when possible. No raw tech dumps without explanation.
- Out of scope: walls, partitions, floors systems, Polyblock, framed systems, fake lab guarantees, floor-level question.

### Workshop log (durable)

| Date | Decision |
| ---- | -------- |
| 2026-09-12 | Value ≈ «плёнка без акустики / шум останется» + class uplift + feel quieter + justify ~500k + non-acoustic benefits + sales tool |
| 2026-09-12 | Audiences **C**: both equal; Start role switcher; shared answer flow |
| 2026-09-12 | Result depth: **full pack** — personal + classes + numbers + charts + explanations (not A/B-only; not “feeling only”) |
| 2026-09-12 | Evidence presentation **Q4**: all-at-once scroll; **вывод сверху, данные ниже**; user/manager self-select depth (not progressive disclosure; not role-dependent density) |
| 2026-09-13 | Charts **C**: class scale А→Б→В on top + before/after bars (ΔRw/ΔLnw) below; no frequency spectrum in MVP |

---

## Global chrome

### Header

| Element | Copy / behavior |
| ------- | --------------- |
| Logos | `StP`, `MultiFRAME` (alt text) |
| Product name | `Проблемомер` (may hide on very narrow ≤420px) |
| Theme toggle | aria/title: `Светлая тема` / `Тёмная тема` |

Must **not** appear: calculator links, dB values, lead form, Polyblock, floor question.

### Progress

| Step key | Progress label |
| -------- | -------------- |
| `start` | Старт |
| `room` | Комната |
| `scenarios` | Шум |
| `current` | Сейчас |
| `beforeAfter` | Сравнение |
| `audio` | Звук |
| `result` | Профиль |

- Hidden on Start.
- On narrow viewports (≤520px): dots only, labels may hide.
- `aria-label`: `Прогресс`.

### Sticky CTA

- Hidden on Start.
- Shown on steps `room` … `result`.
- Back: `Назад` (enabled when not on first sticky step; Start has no sticky bar).
- Next default: `Далее`.
- Overrides: see per-screen (`Услышать разницу`, `К профилю`, `Расчёт материалов`).
- Next disabled until screen validation passes (except Result: always enabled → calculator).
- Fixed bottom + safe-area; primary control min touch height **44px**.

### Default expert disclaimer

`Оценка экспертная и качественная. Это не инженерный расчёт звукоизоляции и не гарантия конкретных показателей.`

### Simulation disclaimer (SimCompare)

`Не замер и не гарантия Δ. Классы А/Б/В — ориентир комфорта, не расчёт по СП. Потолком нельзя заявлять полную норму по ударному шуму: часто нужен пол у соседа сверху.`

### Simulation badge

`Оценка до лабораторных данных`

---

## Screen 1 — Start (`start`)

### Goal

Pick role (equal weight) + emotional hook: create demand for acoustic comfort before choosing a stretch ceiling. Push into the wizard. No numbers.

### Visible elements

- Role switcher (two options), kicker, role-dependent H1/lead, primary CTA `Начать`, three scope bullets.
- Header (no progress, no sticky CTA).

### Exact primary copy (RU)

| Role | Text |
| ---- | ---- |
| Kicker | `StP · MultiFRAME · потолок` |
| Role switcher | **DRAFT (owner-confirmed need, copy TBD):** `Я выбираю потолок` · `Я продаю в шоуруме` (or equivalent; exact labels open) |
| H1 (homeowner — DRAFT) | Keep current baseline until copy pass: `Проверьте уровень акустического комфорта перед выбором натяжного потолка` — rewrite later toward «за что плачу / класс комфорта в моей комнате» |
| H1 (showroom — DRAFT) | TBD — toward «быстрый аргумент: красивый и тихий потолок за 3 минуты» |
| Lead | `Проблемомер помогает почувствовать разницу: обычный потолок и потолок с бескаркасной системой MultiFrame — без сложных терминов.` (may fork by role later) |
| Bullet 1 | `Только потолок и шум сверху через перекрытие` |
| Bullet 2 | `Экспертная оценка с понятными ориентирами` |
| Bullet 3 | `Далее — расчёт материалов MultiFRAME` |
| Primary CTA | `Начать` |

### Controls

| Control | Action | Enabled |
| ------- | ------ | ------- |
| Role switcher | Sets `audienceRole: homeowner \| showroom` (shared data path) | Always; default **ASSUMPTION:** last used or homeowner |
| `Начать` | Go to Room | Always |

### Validation messages

None.

### Must NOT appear

Rw/Lnw, ΔdB, class chips, slab picker, lead form, Polyblock, walls, floor question, audio player, technical SP references.

---

## Screen 2 — Room (`room`)

### Goal

Capture room type + ceiling area (for calculator handoff) and optional upstairs slab for the qualitative sim.

### Visible elements

- Title, subtitle, room-type cards, area field, optional slab block.
- Progress + sticky `Назад` / `Далее`.

### Exact primary copy (RU)

| Role | Text |
| ---- | ---- |
| Title | `Комната и потолок` |
| Subtitle | `Опишите помещение. Этаж не спрашиваем — важен потолок и перекрытие сверху.` |
| Room types | `Гостиная` · `Спальня` · `Детская` · `Кухня` · `Кабинет` · `Другое` |
| Area label | `Площадь потолка, м²` |
| Area hint | `Нужна для ссылки на калькулятор MultiFRAME` |
| Area placeholder | `Например, 18` |
| Optional block title | `Перекрытие сверху (по желанию)` |
| Optional help | `Для оценочной симуляции. Если не указать — берём сплошную 180 мм.` |
| Slab field | `Тип / толщина плиты` |
| Slab empty option | `Не указывать (180 по умолчанию)` |
| Slab options | `Сплошная 140 мм` · `Сплошная 160 мм` · `Сплошная 180 мм (по умолчанию)` · `Сплошная 200 мм` · `ПК 220 мм (пустотка)` · `Монолит 250 мм` |

### Controls

| Control | Action | Enabled |
| ------- | ------ | ------- |
| Room card (single select) | Sets `roomType` | Always |
| Area number input | Sets `ceilingAreaM2` | Always |
| Slab select | Sets optional `floorSlab` / key; empty → default 180 | Always |
| Sticky `Далее` | Go to Scenarios | Enabled iff room type selected **and** area > 0 |
| Sticky `Назад` | Go to Start | Always |

### Validation messages

When Далее disabled, status may show: `выберите тип` and/or `укажите площадь`.

### Must NOT appear

Этаж / номер этажа; wall materials; Polyblock; dB tables; lead form.

---

## Screen 3 — Scenarios (`scenarios`)

### Goal

Multi-select upstairs noise scenarios that drive noise-type suggestion and audio pair selection.

### Visible elements

- Title, subtitle, scenario cards (title + hint), selection status, sticky CTA.

### Exact primary copy (RU)

| Role | Text |
| ---- | ---- |
| Title | `Что слышите сверху?` |
| Subtitle | `Выберите все подходящие сценарии. Можно несколько.` |
| Status empty | `выберите хотя бы один сценарий` |
| Status filled | `Выбрано: N` |

| Scenario key | Title | Hint |
| ------------ | ----- | ---- |
| `steps` | `Шаги сверху` | `Ходьба, топот` |
| `drop` | `Падение предметов` | `Игрушки, вещи` |
| `furniture` | `Передвижение мебели` | `Стулья, столы` |
| `talk` | `Разговоры` | `Голоса соседей` |
| `tv` | `ТВ` | `Телевизор, сериалы` |
| `music` | `Музыка` | `Бас, колонки` |
| `repair` | `Ремонт` | `Дрель, перфоратор` |

### Controls

| Control | Action | Enabled |
| ------- | ------ | ------- |
| Scenario cards | Toggle multi-select | Always |
| Sticky `Далее` | Go to Current | Enabled iff ≥1 scenario |
| Sticky `Назад` | Go to Room | Always |

### Validation messages

`выберите хотя бы один сценарий` when none selected.

### Must NOT appear

dB numbers; floor systems; single-select-only UX; tech spectrum charts.

---

## Screen 4 — Current state (`current`)

### Goal

User confirms comfort feeling + noise character; show “why it matters” and a before-emphasized SimCompare.

### Visible elements

- Title, subtitle, comfort cards, noise-type cards, «Почему это важно» aside, SimCompare (`emphasize="before"`), sticky CTA.

### Exact primary copy (RU)

| Role | Text |
| ---- | ---- |
| Title | `Как сейчас?` |
| Subtitle | `Оцените ощущение и характер шума — рядом покажем ориентиры комфорта.` |
| Comfort group | `Уровень комфорта` |
| Comfort options | `Тихо — почти не замечаю` · `Терпимо — иногда отвлекает` · `Мешает — хочется тишины` |
| Noise group | `Тип шума` |
| Noise options | `Ударный (шаги, падения, мебель)` · `Воздушный (голоса, ТВ, музыка)` · `Смешанный` |
| Aside title | `Почему это важно` |

**Dynamic `whyPlain` (one of):**

- bothers: `Вам мешает {шум сверху|этот сценарий|эти сценарии}. По типу это {ударный|воздушный|смешанный} шум через перекрытие — типичная задача для бескаркасной акустики потолка.`
- ok: `Шум заметный, но терпимый. Часто на этапе выбора потолка решают: «как у всех» или с акустическим комфортом.`
- quiet: `Сейчас относительно тихо. Проблемомер помогает понять, стоит ли усилить потолок MultiFrame — как запас комфорта.`

**ASSUMPTION (matches current code):** if `current` is empty on enter, auto-seed comfort `ok` and noise type from scenarios so sticky Далее can enable immediately.

### Controls

| Control | Action | Enabled |
| ------- | ------ | ------- |
| Comfort cards | Set `comfortLevel` | Always |
| Noise-type cards | Set `noiseType` | Always |
| Sticky `Далее` | Go to Before/After | Enabled when `answers.current` is set |
| Sticky `Назад` | Go to Scenarios | Always |

### Validation messages

None beyond disabled Далее until current answers exist.

### Must NOT appear

«После» as primary hero (before is emphasized); lab certificates; Polyblock; walls.

---

## Screen 5 — Before / After (`beforeAfter`)

### Goal

Emotional contrast: ordinary stretch ceiling vs MultiFrame. Feeling primary; SimCompare secondary tone. Full pack on one scroll: **verdict strip on top**, numbers/charts/explanations below (owner Q4).

### Visible elements

- **Top:** short conclusion (class change / quieter story) before deep dive.
- Title, subtitle, Before card, After card, secondary SimCompare, numbers + chart block, honesty note, sticky CTA with next label override.
- **Charts block (C):** class scale А→Б→В with move arrow, then before/after bars (ΔRw / ΔLnw) with captions; both required.
- **Below fold OK:** detailed oriented numbers/charts — user scrolls as needed.

### Exact primary copy (RU)

| Role | Text |
| ---- | ---- |
| Title | `До и после` |
| Subtitle | `Эмоциональный контраст: обычный натяжной потолок и потолок с MultiFrame.` |
| Before tag | `Сейчас типично` |
| Before h2 | `Обычный потолок` |
| Before bullets | `Шум сверху остаётся «рядом»` · `Шаги и голоса легко читаются` · `Ощущение тонкой границы с соседями` · `Комфорт: {Тихо\|Терпимо\|Мешает}` (first segment of comfort label) |
| After tag | `С MultiFrame` |
| After h2 | `Бескаркасная акустика` |
| After bullets | `Тише. Спокойнее. Свой потолок.` · `Ударный и смешанный шум воспринимаются мягче` · `Без каркаса — бережём высоту комнаты` · `Готовит основу для натяжного полотна` |
| Numbers section title | `Ориентиры в цифрах — вторичны к ощущению` |
| Honesty note | `Цифры поддерживают ощущение, а не заменяют его. Ударный шум потолком смягчается, но часто нужен ещё пол у соседа сверху.` |
| Sticky next | `Услышать разницу` |

### Controls

| Control | Action | Enabled |
| ------- | ------ | ------- |
| Sticky `Услышать разницу` | Go to Audio | Always |
| Sticky `Назад` | Go to Current | Always |

### Validation messages

None.

### Must NOT appear

«вдвое спокойнее» on the impact channel; guaranteed SP compliance; framed-system comparison; Polyblock.

---

## Screen 6 — Audio (`audio`)

### Goal

Let the user **hear** the difference. Demo stubs OK; labeling mandatory. Large controls for phone/showroom.

### Visible elements

- Title, subtitle, contrast note + demo badges, pair blocks (steps / talk as applicable), play controls, compact audio disclaimer, sticky CTA.

### Exact primary copy (RU)

| Role | Text |
| ---- | ---- |
| Title | `Услышать разницу` |
| Subtitle | `Сравните «до» и «после». Крупные кнопки — удобно на телефоне.` |
| Contrast badge | `демо, контраст усилен для показа` |
| Contrast note | `«До» заметно громче, «После» — явно тише.` |
| Demo-set badge (fallback) | `демо-набор` |
| Demo-set note | `Фиксированный набор примеров для выбранных сценариев.` |
| Pair labels | `Шаги сверху` · `Разговор / ТВ` |
| Per-pair badge | `демо` |
| Before button | `До — громко` / sub `Обычный потолок` |
| After button | `После — тише` / sub `С MultiFrame` |
| Playing state | `Играет` · `нажмите — пауза` |
| Audio disclaimer | `Аудио демонстрационное: иллюстрирует ощущение контраста, а не лабораторный замер.` |
| Sticky next | `К профилю` |

### Controls

| Control | Action | Enabled |
| ------- | ------ | ------- |
| Before / After play buttons | Toggle play/pause for that stub | Always when pair present |
| Sticky `К профилю` | Go to Result | Always |
| Sticky `Назад` | Go to Before/After | Always |

**Audio rules**

- Mode: `demo_stub` (procedural Web Audio).
- Always show «демо»; if scenarios do not map to a pair, show «демо-набор» fallback.
- Exaggerated contrast allowed for showroom (before louder / after clearly quieter).
- Respect `prefers-reduced-motion` for non-essential motion (e.g. progress animation).
- Must sell difference; silence or identical before/after is a product bug.

### Validation messages

None.

### Must NOT appear

Claims of laboratory measurement; downloadable “certified” WAV as real lab proof; «вдвое» on impact-only messaging without air context.

---

## Screen 7 — Result / Profile (`result`)

### Goal

Summarize acoustic profile with **verdict first**, then the full evidence stack on one page (owner Q4: вывод сверху, данные ниже). Restate why MultiFrame fits; CTA to MultiFRAME calculator and demo lead.

### Visible elements

- **Top verdict:** personal one-liner + class before→after (А/Б/В) + what ~MultiFrame changes in plain language.
- Title, subtitle, Before/After summary cards, room/scenario profile, secondary SimCompare, numbers + charts + explanations, «Почему MultiFrame уместен», expert Disclaimer, calculator CTA, demo consultation (disabled), demo lead form, restart.
- **Charts block (C):** class scale А→Б→В first, then before/after bars (ΔRw / ΔLnw); captions + `pre_lab` badge; no frequency spectrum.
- Do **not** hide detail behind tabs/accordions as the primary pattern; scroll is the disclosure.

### Exact primary copy (RU)

| Role | Text |
| ---- | ---- |
| Title | `Акустический профиль` |
| Subtitle | `Сначала ощущение эффекта — цифры вторичны. Затем расчёт MultiFRAME.` |
| Before card | `Сейчас` · `Без MultiFrame` · `Шум сверху остаётся «рядом»` · `Ощущение: {full comfort label}` · `Тип: {noise type label}` |
| After card | `С MultiFrame` · `Эффект в ощущении` · `Тише. Спокойнее. Свой потолок.` · `Воздух: примерно вдвое спокойнее — шум как будто дальше` · `Удар: тише; норму часто закрывает пол у соседа` |
| Profile | `Комната` · `{room} · {N} м²` + scenario title chips |
| Numbers title | `Ориентиры в цифрах — вторичны к ощущению` |
| Why title | `Почему MultiFrame уместен` |
| Calculator CTA | `Открыть калькулятор` |
| Demo badge near secondary CTAs | `демо` |
| Demo contacts note | `Реальных контактов StP в этом MVP нет. «Консультация» и заявка — только демонстрационные заглушки.` |
| Consultation (disabled) | `Консультация (недоступно в демо)` |
| Lead open | `Оставить заявку (демо)` |
| Lead title | `Заявка · демо` |
| Lead help | Prefer clear RU: stub does not send data; no invented corporate email. **ASSUMPTION / current code quirk:** UI currently says `Не inventированный корпоративный email.` — product intent is “demo stub only, no real CRM email”. Spec normative help: `Никуда не отправляется — только демонстрация. Не используйте как реальную заявку StP.` |
| Name | `Имя` / placeholder `Как к вам обращаться` |
| Phone | `Телефон` / placeholder `+7 …` |
| Submit | `Отправить (демо)` → success `Принято (демо-stub)` |
| Payload caption | `CTA payload (schemaVersion 1)` |
| Restart | `Пройти ещё раз` |
| Sticky next | `Расчёт материалов` (opens calculator; always enabled) |

**Dynamic whyMultiFrame lines (up to ~4, from answers):** examples locked in code intent —

- impact/mixed: `Ударный шум сверху идёт через плиту — бескаркасная MultiFrame работает на потолке, без каркаса.`
- airborne/mixed: `Воздушный шум тоже проходит через перекрытие; акустика потолка смягчает «соседский фон».`
- steps/drop: `Шаги и падения — самые частые жалобы без акустической подготовки потолка.`
- bothers / quiet / else variants about comfort reserve without framed height loss.

### Controls

| Control | Action | Enabled |
| ------- | ------ | ------- |
| `Открыть калькулятор` / sticky `Расчёт материалов` | Open calculator URL in new tab | Always (area may be omitted only if invalid — MVP requires area from Room) |
| `Консультация (недоступно в демо)` | None | **Disabled** |
| `Оставить заявку (демо)` | Expand lead form | Always |
| Lead submit | `console` stub + show payload JSON | Name/phone filled per UI validation (**ASSUMPTION:** submit allowed when fields non-empty; exact client validation follows code) |
| `Пройти ещё раз` | Reset session → Start | Always |
| Sticky `Назад` | Go to Audio | Always |

### Validation messages

Lead: empty name/phone should not pretend a real CRM success. Demo success copy only: `Принято (демо-stub)`.

### Must NOT appear

Real StP phone/email presented as live; lab certificate; Polyblock upsell; walls/floors systems; guaranteed Lnw norm from ceiling alone.

---

## Empty / error / demo states (global)

| State | Behavior |
| ----- | -------- |
| Empty scenarios | Cannot proceed; show `выберите хотя бы один сценарий` |
| Empty room type / area | Cannot proceed; `выберите тип` / `укажите площадь` |
| Missing slab | Default solid **180 mm** silently for sim |
| Audio no matching pair | Fallback both pairs + `демо-набор` |
| Audio playing | Show `Играет` / pause affordance |
| Lead demo | Never network POST to CRM; `console` + on-screen JSON |
| Consultation | Always disabled in MVP |
| Theme | Light/dark client toggle; content identical |
| Reduced motion | Keep functionality; reduce decorative motion |

---

## Mobile rules

- First viewport and forms denser ≤520px (card grids, sticky question headers where used).
- Sticky header + progress + bottom CTA; content padded above footer (`safe-area` aware).
- Touch targets ≥44px on primary actions.
- Progress labels may hide; product name may hide ≤420px.
- SimCompare stacks to one column on narrow widths; audio Before/After stack on very narrow.
- No desktop-only tech dumps; same one flow for showroom phone handoff.

---

## SimCompare component contract

**Purpose:** show before→after comfort orientation with feeling primary and metrics tertiary.

**Inputs**

- `sim: DerivedSimulation` (before/after sides, delta, deltaRange, uiLabel, honestLines, feelings, slabKey, source, disclaimer)
- `emphasize?: 'before' | 'after' | 'both'` (default `both`)
- `tone?: 'primary' | 'secondary'` (secondary = quieter digits when emotion dual is on screen)

**Must render**

- Badge = `Оценка до лабораторных данных`
- Columns: `Сейчас` · `С MultiFrame`
- Feeling chips: `Тихо` · `Терпимо` · `Мешает`
- Class pills: `класс А|Б|В` · `частично` · `ниже класса`
- **Chart A — class scale:** visual А→Б→В (or equivalent) showing before→after move; primary scannable chart
- **Chart B — bars:** before/after bars for oriented ΔRw (воздух) and ΔLnw (удар); secondary to class scale; always captioned
- Channels: `Воздух` / `Удар` with tertiary dB + optional delta
- After heroes: air `примерно вдвое спокойнее` / `шум как будто дальше`; impact `тише` / `норму часто закрывает пол`
- Chips: `Воздух: {А|Б|В|вне нормы}` · `Удар: {…}`
- Range line: `ориентир Δ воздух +8…+12 · удар −6…−10`
- `honestLines` + `DISCLAIMER_SIMULATION`

**Must NOT render (MVP)**

- Frequency / spectrum charts as the primary evidence visual

**Must NOT**

- Present Δ as measured lab result
- Use «вдвое спокойнее» on impact hero
- Claim full Lnw norm from ceiling alone

**Effect model (normative numbers)**

| Item | Value |
| ---- | ----- |
| Default slab | 180 → Rw 54 / Lnw 76 (before) |
| Other slabs | 140→50/80; 160→52/78; 200→55/74; pk220→52/74; mono250→56/74 |
| DELTA | Rw +10, Lnw −8 |
| UI range | Rw [8,12], Lnw [6,10] |
| NORMS (Rw min / Lnw max) | A 54/55; B 52/58; V 50/60 |
| Grade labels | `премиум-комфорт` · `комфорт` · `базовый` · partial / below strings as in simulation |
| source | `marketing_placeholder` |
| disclaimer | `pre_lab` |

---

## Audio component contract

| Rule | Spec |
| ---- | ---- |
| Purpose | Sell audible before→after difference |
| Sources | Procedural stubs `stub:before|after:steps|talk` |
| Labels | Always `демо`; fallback set `демо-набор` |
| Contrast | Before clearly louder; after clearly quieter (showroom OK to exaggerate) |
| Pairs | Prefer scenarios; else fixed demo set |
| Controls | Large `До — громко` / `После — тише` with pause |
| Disclaimer | Demo sensation, not lab measurement |
| Accessibility | Meaningful aria for play/pause including pair name |

---

## CTA query params & demo lead

### Calculator URL

Base: `https://paulos99.github.io/MF_StP/`

| Param | Source |
| ----- | ------ |
| `area` | ceiling m² (> 0) |
| `roomType` | enum: `living` \| `bedroom` \| `kids` \| `kitchen` \| `office` \| `other` |
| `scenarios` | comma-joined enum keys |

**ASSUMPTION:** README historically mentioned only `?area=`; product contract includes `roomType` + `scenarios` as in current code — keep all three.

### Session / CTA payload (`schemaVersion: 1`)

Visible/export shape includes: `{ schemaVersion, answers, derived, audio, cta }` where `cta` carries `{ roomType, ceilingAreaM2, scenarios }`.

### Demo lead behavior

- Fields: name, phone.
- On submit: `console` stub (e.g. `[lead-demo]`) with `{ name, phone, cta, derived, note: 'demo-only stub — no real StP CRM endpoint' }`.
- Show success `Принято (демо-stub)` + JSON summary.
- No network CRM; do not invent StP corporate endpoints.

---

## Acceptance tests

### A — Solo homeowner

1. Open Start: see emotional H1, **no dB**, tap `Начать`.
2. Pick room + area > 0; optional slab; `Далее`.
3. Select ≥1 scenario; `Далее`.
4. Confirm comfort + noise type; see SimCompare before emphasis + disclaimer badge.
5. Before/After: feeling cards primary; numbers secondary; honesty note about floor for impact.
6. Audio: play До and После; hear clear difference; see `демо`.
7. Result: feeling summary; «вдвое» only on air line; open calculator with `area` (+ roomType/scenarios); optional demo lead does not claim real send.
8. Restart works.

**Pass:** completes without tech dumps; never promises Lnw norm from ceiling alone; sticky CTA usable on phone width.

### B — Showroom ≤ 3 minutes

Manager on phone/tablet walks customer Start→Result in **≤ 3 minutes**:

1. Skip deep slab debate (use default).
2. Pick 1–2 vivid scenarios (e.g. steps + talk).
3. Land on Audio quickly; customer hears До/После.
4. Open calculator CTA or show demo lead as “next step with manager”.

**Pass:** path reachable in ≤3 min; audio contrast obvious; CTA to MultiFRAME calculator works; consultation remains demo-disabled without looking broken as a “real missed contact”.

---

## Doc drift note

`README.md` historically said the qualitative model is without fake ΔRw/ΔLnw. **Product decision (this spec + checklist):** placeholders **are** shown as tertiary marketing_placeholder figures with pre_lab labeling. Prefer this spec over the older README phrasing when they conflict.
