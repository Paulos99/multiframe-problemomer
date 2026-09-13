# PRODUCT_SPEC — MultiFrame Проблемомер

Screen-by-screen product contract for the MVP SPA. Exact Russian UI strings are normative. Engineering may rearrange markup, but must not change meaning, omit required copy, or reintroduce out-of-scope capabilities from `CHECKLIST.md` (Capability ledger).

**Related:** `CHECKLIST.md` (intake + ledger) · live context `https://paulos99.github.io/multiframe-problemomer/` (do not redesign from the live site alone).

**Audiences (confirmed 2026-09-13):** Start asks only **«Интересуюсь звукоизоляцией: для себя / для клиента»**. The long role/entry list is **not** a Start picker — it is the **JTBD map** for what purchase-justifying content the shared result must cover. **One diagnostic flow** → everyone gets the **full MultiFrame buy case** (baseline + acoustic effect + other advantages). No further role grilling on Start.

**Core value (owner-confirmed direction):** show that in *this* room comfort is lower than assumed; MultiFrame can raise comfort class (often by a step+); let user feel how much quieter; present system features (comfort, install, versatility, safety) so value is **inferred**, not priced aloud; give anyone helping a client a ready argument. Still **not** a materials calculator and **not** a lab certificate.

**Global product rules**

- Feeling + comfort-class story first on early screens; **no numbers on Start**.
- On Before/After + Profile: show the **full evidence pack** — personal room story, classes А/Б/В, numbers, charts, and plain-language explanations of each (owner 2026-09-12: «показать всё, аргументированно, понятно, персонально»).
- **Evidence layout (Q4, owner 2026-09-12):** everything on one scroll — **conclusion / verdict on top**, detailed data below. Not progressive disclosure; not audience-trimmed packs. Anyone skims what they need. Same full stack for all user models (context may still change copy/CTA emphasis).
- **Result must include (owner 2026-09-13):** (1) baseline state of *this* ceiling/room, (2) MultiFrame acoustic effect (full unconfirmed model), (3) **system features & reasons-to-believe** from MultiFRAME presentation/site (comfort, install, versatility, safety, patents) — plain language, **понятно + аргументированно**, **no price-forward copy**.
- **Charts (owner 2026-09-13):** **both** — comfort **class scale А→Б→В** (arrow “where we move”) **above**; **before/after bars** for oriented ΔRw / ΔLnw **below**. Not spectrum/frequency charts in MVP. Always with plain-language captions + `pre_lab` framing.
- **Numbers policy (owner 2026-09-13):** show a **full working MultiFrame effect model** with complete numbers now — currently **unconfirmed** (`marketing_placeholder` / `pre_lab`). After Trofimov (or lab) confirmation, **replace** values with correct ones; do not redesign the UX around hiding numbers. Never present placeholders as lab guarantees or certificates.
- Effect source: `marketing_placeholder`; disclaimer: `pre_lab` / expert qualitative — never lab guarantees. Charts/numbers are **oriented arguments**, not certificates.
- ΔRw center **+10** (show range **+8…+12**); ΔLnw center **−8** (show range **−6…−10** as absolute 6…10 in UI copy). **ASSUMPTION** until technical confirmation.
- Classes **А/Б/В** (Trofimov / SP-style): **А** = высокая комфортность, **Б** = комфортная, **В** = предельно допустимая. UI = **hybrid plain label + letter** (`Высокий комфорт (А)`, `Комфорт (Б)`, `Допустимый (В)`) plus below-scale **`Дискомфорт`** when even В is not reached (owner: this is common). Soft footnote **`Ориентир по шкале комфортности (норм. документы)`** — not a legal certificate. “пониженный → выше классом” remains required. **ASSUMPTION on everyday synonyms:** prefer Trofimov plain words; avoid mapping «эконом» to **А** (А is the top, not economy).
- «примерно вдвое спокойнее» **only for air (воздух)**; impact (удар) = quieter + floor often needed — never claim Lnw norm from ceiling alone.
- Audio must sell the difference; demo stubs allowed with clear «демо» labeling.
- Mobile: denser inputs + sticky question/CTA; pack stays one scroll with sticky verdict readable above the fold when possible. No raw tech dumps without explanation.
- **Premium tone (owner 2026-09-13):** never UI phrases like «за что платим», «за что ~500 тыс.», blunt cost/price push. Show features and effects so the user **infers** value. Soft B2B benefits OK («для клиента» path) without «средний чек» / money-first language.
- Out of scope: walls, partitions, floors systems, Polyblock, framed systems, fake lab guarantees, floor-level question.

### Workshop log (durable)

| Date | Decision |
| ---- | -------- |
| 2026-09-12 | Value ≈ «плёнка без акустики / шум останется» + class uplift + feel quieter + feature-based value (not price talk) + sales tool |
| 2026-09-12 | Audiences **C** (narrow binary) — **superseded 2026-09-13** |
| 2026-09-12 | Result depth: **full pack** — personal + classes + numbers + charts + explanations (not A/B-only; not “feeling only”) |
| 2026-09-12 | Evidence presentation **Q4**: all-at-once scroll; **вывод сверху, данные ниже**; self-select depth (not progressive disclosure; not audience-trimmed) |
| 2026-09-13 | Charts **C**: class scale А→Б→В on top + before/after bars (ΔRw/ΔLnw) below; no frequency spectrum in MVP |
| 2026-09-13 | Numbers: **show full unconfirmed model now**; after confirmation swap to correct values (do not hide numbers in MVP) |
| 2026-09-13 | User models = **JTBD content map** (not a long Start quiz); Start = only «для себя / для клиента»; no further Start clarification — full buy-case content covers all JTBD |
| 2026-09-13 | Tone: no «за что платим» / price-first copy; value inferred from features; MultiFRAME deck is primary product-feature source |
| 2026-09-13 | MultiFrame features on Result: **понятно + аргументированно** (plain language + why it matters; not bare bullet dump, not tech dump) |
| 2026-09-13 | Feature copy pattern confirmed: **claim + 1 short why/how** (e.g. drum-effect → MultiFrame dissipates); clear and argued |
| 2026-09-13 | Result feature order: **1 class of comfort/housing → 2 effectiveness → 3 drum-effect → 4 safety → 5 rest**. Install only as **fast / no long construction** — not tech details about mounting/comms unless needed |
| 2026-09-13 | Class labels: **hybrid** — plain name + letter (А/Б/В), soft link to normative doc (Trofimov/SP). Official: А высокая комфортность, Б комфортная, В предельно допустимая. Do not invert letters. |
| 2026-09-13 | Class V UI label = **Допустимый (В)**; below-scale state when even V not reached (common) — UI label **`Дискомфорт`** (confirmed) |
| 2026-09-13 | Result top class shift copy confirmed: e.g. `Сейчас: Дискомфорт → с MultiFrame: Комфорт (Б)` |
| 2026-09-13 | Norm footnote under class shift: **A** — `Ориентир по шкале комфортности (норм. документы)` |
| 2026-09-13 | Effectiveness block: **delta orientations first**, each with explaining caption + sensation (not feeling-only lead) |
| 2026-09-13 | Effectiveness: **always both** Δ channels (воздух + удар), each with caption + sensation |
| 2026-09-13 | **Remove Scenarios from survey** — client may not live there / not have thought about noise; asking «что мешает» risks «мне ничего не мешает». Audio uses default demo set |
| 2026-09-13 | **Remove Current complaint survey** with Scenarios (same anti-pattern). Flow: Start → Room → Before/After → Audio → Result |
| 2026-09-13 | Room = **primary diagnostic block** (comfort model input). Keep type + area + slab; propose high-impact extras (floor above, building type, object stage, planned ceiling) — owner to pick |
| 2026-09-13 | Room fields: keep type+area+slab; **add** floor-above, house type, object stage, planned ceiling; replace «кто сверху» with **noisy neighbors** check (not bother quiz) |
| 2026-09-13 | Year of build: **optional candidate** — useful as soft proxy for typical construction + normative context; weaker than slab/floor-above; owner to confirm |
| 2026-09-13 | Build year: **not in MVP**. Noisy neighbors options: drop «ещё не живу»; keep only `Не знаю` · `Обычно тихо` · `Соседи сверху шумные` |
| 2026-09-13 | Floor-above: **Не знаю is a first-class valid answer** — user often does not know; model uses conservative ASSUMPTION when unknown |
| 2026-09-13 | Room validation: **required only** room type + area. Floor-above, house type, stage, planned ceiling, noisy neighbors — each may be `Не знаю`; enough to proceed |
| 2026-09-13 | Room field order confirmed: type → area → slab type → slab thickness → floor above → house type → stage → planned ceiling → noisy neighbors |
| 2026-09-13 | Slab: **type and thickness as separate Room fields** (do not multiply type×mm cards). Thickness may be `Не знаю` |
| 2026-09-13 | Slab thickness UI = **ranges/buckets**, not single mm points (owner not in typical-thickness details) |
| 2026-09-13 | Slab thickness ranges confirmed: `До ~160` · `~160–200` · `~200–250` · `Толще ~250` · `Не знаю` |
| 2026-09-13 | Floor-above: remove `Пока без чистового пола` — not a floor-construction param (belongs to object stage if at all) |
| 2026-09-13 | Floor-above copy confirmed: `Не знаю` · `Обычный пол (без плавающей схемы)` · `Есть плавающий пол / шумоизоляция в полу` |
| 2026-09-13 | House type options expanded for common RU stock: add **Блочный**; monolith includes монолит-кирпич (note); keep Не знаю — confirmed |
| 2026-09-13 | House type options confirmed: `Панельный` · `Блочный` · `Кирпичный` · `Монолит` (в т.ч. монолит-кирпич) · `Деревянный / по балкам` · `Не знаю` |
| 2026-09-13 | Object stage confirmed: `Новостройка / до заселения` · `Идёт ремонт` · `Уже живут` · `Не знаю` |
| 2026-09-13 | Planned ceiling confirmed (B): `Планируем натяжной` · `Потолок уже есть` · `Не знаю` — plain language, no ГКЛ/черновой jargon |
| 2026-09-13 | Noisy neighbors confirmed (B): `Не знаю` · `Обычно тихо` · `Сверху бывает шумно` — softer third label; not a «does it bother you» quiz |

---

## User models (JTBD) & Start

### Why the long role list exists

Owner listed ads / search / MultiFrame site / partner site / sales manager / installer / measurer / designer **so the product content covers their jobs-to-be-done** — not so Start becomes a role catalog.

**Agent decision (product rationale):** further Start questions (sales vs site vs design…) are **not needed** if Result already ships one complete MultiFrame purchase justification that each helper can reuse with a client. Extra Start branching adds friction and fake precision without new facts. Soft hooks may still come from UTM/referrer (**ASSUMPTION**, no extra question).

### JTBD → content the Result must satisfy

| Who (examples) | Job to be done | Content the shared pack must deliver |
| -------------- | -------------- | ------------------------------------ |
| Client from ads «красивый → тихий» | Decide to add acoustics while choosing a nice ceiling | Baseline comfort risk without MultiFrame; feel quieter; beautiful+quiet story; ~value / non-dB pluses |
| Client from search «звукоизоляция потолка» | Check if ceiling MultiFrame is the right answer | Oriented effect model; class move; honesty on impact/floor; next step to calculator |
| Client from MultiFrame site | «Check my ceiling» self-diagnosis | Personal baseline → after MultiFrame; audio contrast |
| Client from partner ceiling site | Know if ЗИ is needed under stretch ceiling | Why film alone isn’t enough; MultiFrame under stretch; full effect + pluses |
| Sales manager | Upsell MultiFrame with a client | Ready argument: class + numbers + audio + non-dB benefits; skim-friendly verdict on top |
| Installer on site | Fast “why ЗИ” for the client | Same full pack, usable on phone in minutes |
| Measurer | Extra sale at measurement | Same pack + clear CTA to materials calc |
| Designer | Put ЗИ in the project and justify to client | Baseline vs MultiFrame story + advantages (height, frameless, speed) for project talk |

### Start segmentation (confirmed direction)

**Only one Start choice:**

`Интересуюсь звукоизоляцией:` · `для себя` · `для клиента`

| Choice | Meaning |
| ------ | ------- |
| `для себя` | End customer deciding for own room |
| `для клиента` | Anyone helping a client (sales, site, measure, design, …) |

May lightly change pronoun/CTA tone («вам» / «клиенту»). **Must not** trim evidence. **No Q2 role drill-down on Start.**


### Comfort class labels (hybrid — confirmed direction 2026-09-13)

| Letter (official, Trofimov/SP) | Meaning (official) | UI plain label (DRAFT) |
| ------------------------------ | ------------------ | ---------------------- |
| **А** | высокая комфортность | `Высокий комфорт (А)` |
| **Б** | комфортная | `Комфорт (Б)` |
| **В** | предельно допустимая | `Допустимый (В)` |
| — (below scale) | ниже предельно допустимой / вне категорий А–В | `Дискомфорт` |

- Owner (2026-09-13): **В** = only `Допустимый (В)` (not «Базовый»). Below V is common → always support a fourth UI state.
- Show **plain name + letter** together (below-scale has **no letter**).
- Soft footnote/link: e.g. `Ориентир по шкале комфортности (нормативные документы / материалы StP)` — not “мы сертифицировали вашу квартиру”.
- Owner intent: mix official scale with everyday words. **Do not** call **А** «эконом» — that would invert the official ladder (А is best).
- Chart still uses А→Б→В movement with these hybrid captions.

### MultiFrame features for Result (from owner presentation + stp-multiframe.ru)

**Tone:** present facts so the user concludes value themselves. **Forbidden in UI:** «за что платим», blunt price/cost framing, «средний чек».

**Presentation rule (confirmed 2026-09-13):** advantages **понятно, но аргументированно** — each point = **тезис + 1 короткая фраза why/how** (example OK’d: «Без системы под натяжным воздух работает как барабан. MultiFrame рассеивает эту энергию — в комнате спокойнее.»). Not a bare slogan list; not a datasheet dump.

**Result feature order (confirmed 2026-09-13)** — each item = тезис + 1 фраза why/how; no price talk:

1. **Класс комфорта жилья** — top verdict shift line confirmed: `Сейчас: {class} → с MultiFrame: {class}` (e.g. `Сейчас: Дискомфорт → с MultiFrame: Комфорт (Б)`); soft norm-doc hint.
2. **Эффективность** — **сначала ориентиры Δ** (воздух / удар) with **explaining captions + sensations** each; then class scale + bars as already decided. `pre_lab` framing; argument not certificate.

**Effectiveness block (confirmed 2026-09-13):** lead with **Δ orientations**, not a feeling-only headline.
**Always both channels** (воздух + удар), even if user never picked scenarios. For each: oriented Δ + short caption that *explains* the number + sensation phrase (claim+why pattern). Example shape: `Δ воздух +8…+12 дБ` — `шум как будто дальше` / plain why. Then charts (class scale + bars). Always `pre_lab`.

3. **Эффект барабана** — без системы воздух под натяжным «играет как барабан»; MultiFrame рассеивает энергию → в комнате спокойнее.
4. **Безопасность** — эко/здоровье, сертификаты как reason-to-believe (мягко).
5. **Остальное (коротко):** система нового поколения; Flat/Wave и совместимость с натяжным/ГКЛ по смыслу «красивый потолок + тишина»; при необходимости — патент/отличие мягко.

**Монтаж / коммуникации (owner nuance):** клиенту **не** разворачивать технику крепежа и прокладки коммуникаций. Достаточно смысла: **быстро, без долгой стройки** (vendor: 1 мастер, панель ≤1 мин — as soft claim). Details for «для клиента» / профи могут быть глубже later; MVP client-facing copy stays light.

**Для пути «для клиента» (мягко):** высокий спрос на услугу; лояльность; встраивается в монтаж потолка; низкий порог освоения — **без** формулировок про деньги/чек.

**Process story (optional short):** подготовка → MultiFrame → коммуникации → каркас → потолок → финиш/свет.

Acoustic diagnosis remains the core of Problemoмер; these features complete the buy-case without price talk.


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
| `beforeAfter` | Сравнение |
| `audio` | Звук |
| `result` | Профиль |

**Removed from survey (2026-09-13):** `scenarios` («что слышите/мешает») and `current` (complaint comfort quiz). Reason: many users have not lived in the flat or have not framed a noise problem; asking invites «мне ничего не мешает». Education of typical upstairs noise moves into Result/Before-After copy + default audio demo — not a quiz.

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

`Не замер и не гарантия Δ. Классы комфорта — ориентир по шкале комфортности (норм. документы); не сертификат и не полный расчёт по СП. Потолком нельзя заявлять полную норму по ударному шуму: часто нужен пол у соседа сверху.`

### Simulation badge

`Оценка до лабораторных данных`

---

## Screen 1 — Start (`start`)

### Goal

One light choice **для себя / для клиента** + emotional hook: create demand for acoustic comfort with a stretch ceiling. Push into the wizard. No numbers. Same full diagnostic and buy-case content for every JTBD.

### Visible elements

- Line + two options: `Интересуюсь звукоизоляцией:` `для себя` / `для клиента`
- Kicker, H1/lead, primary CTA `Начать`, three scope bullets
- Header (no progress, no sticky CTA)
- Optional UTM/referrer hook copy (**ASSUMPTION** — no extra question)

### Exact primary copy (RU)

| Role | Text |
| ---- | ---- |
| Kicker | `StP · MultiFRAME · потолок` |
| Interest | `Интересуюсь звукоизоляцией:` · `для себя` · `для клиента` |
| H1 | **DRAFT:** `Проверьте уровень акустического комфорта перед выбором натяжного потолка` (UTM may swap hook later without new questions) |
| Lead | `Проблемомер показывает исходное состояние потолка и эффект MultiFrame — по звуку и другим преимуществам, без сложных терминов.` |
| Bullet 1 | `Только потолок и шум сверху через перекрытие` |
| Bullet 2 | `Полная картина: комфорт сейчас → эффект MultiFrame → плюсы системы` |
| Bullet 3 | `Далее — расчёт материалов MultiFRAME` |
| Primary CTA | `Начать` |

### Controls

| Control | Action | Enabled |
| ------- | ------ | ------- |
| `для себя` / `для клиента` | Sets `interestFor: self \| client` (tone/CTA only; does **not** trim evidence) | Always; default **ASSUMPTION:** `для себя` or last used |
| `Начать` | Go to Room | Always |

### Validation messages

None.

### Must NOT appear

Long role catalog (sales / site / designer / …) on Start; further “уточняющие” role questions; Rw/Lnw, ΔdB, class chips, slab picker, lead form, Polyblock, walls, floor question, audio player, technical SP references.

---

## Screen 2 — Room (`room`)

### Goal

**Primary diagnostic block:** drives presumed comfort on the object. Locked: type + area + slab. Add: floor above, house type, object stage, planned ceiling, noisy-neighbors check (`Не знаю` · `Обычно тихо` · `Сверху бывает шумно`). Year of build: **not in MVP**.

### Visible elements

- Title, subtitle; then: room type → area → slab type → slab thickness → floor above → house type → stage → planned ceiling → noisy neighbors (`Не знаю` OK on optionals).
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
| Sticky `Далее` | Go to Before/After | Enabled iff room type selected **and** area > 0. Other Room fields optional / may be `Не знаю` |
| Sticky `Назад` | Go to Start | Always |

### Validation messages

When Далее disabled, status may show: `выберите тип` and/or `укажите площадь`.

### Must NOT appear

Этаж / номер этажа; wall materials; Polyblock; dB tables; lead form.

---


### Room as primary diagnostic (owner 2026-09-13)

Room answers drive the **presumed comfort class** on the object. Type + area + slab stay. Additional fields — only if they change the model; prefer «Не знаю» over forcing expertise.

**Room fields — direction (owner 2026-09-13)**

**Locked / keep:** тип помещения · площадь · **тип перекрытия** · **толщина перекрытия** (separate; both allow `Не знаю`).

**Add to Room (confirmed intent):**

| Field | Role in model | UI sketch (RU) | Notes |
| ----- | ------------- | -------------- | ----- |
| Тип перекрытия | Construction family for baseline | `Монолит / сплошная ж/б` · `Многопустотная (ПК)` · `Деревянное / по балкам` · `Не знаю` | No mm on these cards |
| Толщина перекрытия | Mass proxy for Rw / baseline | **Ranges **confirmed**:** `До ~160 мм` · `Около 160–200 мм` · `Около 200–250 мм` · `Толще ~250 мм` · `Не знаю` | Owner: give spreads, not expert single values. Map ranges → model mid ASSUMPTION internally. Type×mm matrix forbidden |

**Thickness copy rule:** show **разбросы** for non-experts; engineering may map bucket → mid value inside the model (ASSUMPTION), never force user to pick exact mm.

Owner: do **not** put «пока без чистового пола» under floor-above — applies across situations / belongs to **стадия объекта**, not floor construction.
| Пол сверху | Strongest impact on удар / Lnw baseline | `Не знаю` · `Обычный пол (без плавающей схемы)` · `Есть плавающий пол / шумоизоляция в полу` | **Не знаю = valid** (owner). When unknown → conservative model ASSUMPTION (typical ordinary floor / no floating). Do not block Далее. |
**House-type coverage (confirmed):** most frequent apartment cases = panel / block / brick / monolith (+ clad monolith). Wood/beam for private or old beam floors. Do not add separate «сталинка» / «хрущёвка» cards — those are eras, partly covered by type (+ deferred year).
| Тип дома | Proxy when slab unknown; typical construction | `Панельный` · `Блочный` · `Кирпичный` · `Монолит` (в т.ч. монолит-кирпич) · `Деревянный / по балкам` · `Не знаю` | Common RU apartment stock. Сталинка → usually `Кирпичный` (hint, not separate card). Skip rare types. | `Панельный` · `Блочный` · `Кирпичный` · `Монолит` (в т.ч. монолит-кирпич) · `Деревянный / по балкам` · `Не знаю` | |
| Стадия объекта | Narrative without «мешает ли» | `Новостройка / до заселения` · `Идёт ремонт` · `Уже живут` · `Не знаю` | Confirmed | `Новостройка / до заселения` · `Идёт ремонт` · `Уже живут` · `Не знаю` | |
| Планируемый потолок | Fit story for MultiFrame under finish | `Планируем натяжной` · `Потолок уже есть` · `Не знаю` | Owner chose plain **B** — no ГКЛ/«черновой» jargon | `Планируем натяжной` · `Потолок уже есть` · `Не знаю` | |
| Шумные соседи сверху | Expectation of upstairs activity (not “does it bother you”) | `Не знаю` · `Обычно тихо` · `Сверху бывает шумно` | Owner chose **B** — softer third label. Replaces «кто сверху». Must **not** sound like complaint quiz |

**Field order on Room (confirmed):** тип → площадь → **тип перекрытия** → **толщина перекрытия** → пол сверху → тип дома → стадия → планируемый потолок → шумные соседи.

**Room required vs optional (confirmed 2026-09-13):**
- **Required to proceed:** `roomType` + `area` (> 0).
- **Optional (any may be `Не знаю`, still proceed):** slab type, slab thickness, floor above, house type, object stage, planned ceiling, noisy neighbors.
- Missing optional / `Не знаю` → model ASSUMPTIONs (conservative where it affects class/Δ; default slab ASSUMPTION remains e.g. solid 180 mm until tuned).

**Unknown floor-above (confirmed):** choosing `Не знаю` is normal and sufficient to proceed. Sim uses a declared conservative default (ASSUMPTION: treat as ordinary floor without floating scheme unless later tuned).

**Dropped:** «Кто сверху» (жилая/нежилое) — replaced by noisy-neighbors check.

**Year of construction — deferred (owner 2026-09-13: not in MVP):**

- **Can help:** (1) soft proxy for typical slab/era (хрущёвка / 90s panel / modern monolith); (2) framing that expectations/norms and build practice differ by generation; (3) when user picks «не знаю» on slab + house type.
- **Limits:** Russian residential acoustic limits are mainly by **building category А/Б/В** and construction type, not a simple “year → other Lnw number” table in the MVP model. Year ≠ substitute for slab + floor-above.
- **Decision:** do **not** add year/period in current MVP. Revisit later if slab+house type leave too much ambiguity.


## Screens removed from survey (2026-09-13)

### ~~Scenarios (`scenarios`)~~ — **removed**

Do **not** ask «Что слышите сверху?» / multi-select of bothersome noises. Owner: client may not live in the apartment yet or may not have thought about noise; the quiz can push them to conclude nothing bothers them.

Typical upstairs noises (steps, talk, TV, …) may appear as **illustrations** in Before/After, Audio demo, or Result — not as required answers.

### ~~Current state (`current`)~~ — **removed**

Do **not** ask complaint-framed «Как сейчас?» / «мешает ли». Same anti-pattern as Scenarios. Comfort class before→after is **derived** by the expert/placeholder model from room (+ optional slab), not from a self-reported bother score.

---

## Screen 3 — Before / After (`beforeAfter`)

### Goal

Emotional contrast: ordinary stretch ceiling vs MultiFrame. Feeling primary; SimCompare secondary tone. Full pack on one scroll: **verdict strip on top**, numbers/charts/explanations below (owner Q4).

### Visible elements

- **Top:** short conclusion with class shift `Сейчас: … → с MultiFrame: …` before deep dive.
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
| Sticky `Назад` | Go to Room | Always |

### Validation messages

None.

### Must NOT appear

«вдвое спокойнее» on the impact channel; guaranteed SP compliance; framed-system comparison; Polyblock.

---

## Screen 4 — Audio (`audio`)

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
- Always show «демо»; use **default demo set** (no scenario quiz). Optional later: UTM may bias demo pair (**ASSUMPTION**).
- Exaggerated contrast allowed for showroom (before louder / after clearly quieter).
- Respect `prefers-reduced-motion` for non-essential motion (e.g. progress animation).
- Must sell difference; silence or identical before/after is a product bug.

### Validation messages

None.

### Must NOT appear

Claims of laboratory measurement; downloadable “certified” WAV as real lab proof; «вдвое» on impact-only messaging without air context.

---

## Screen 5 — Result / Profile (`result`)

### Goal

Summarize acoustic profile with **verdict first**, then the full evidence stack on one page (owner Q4: вывод сверху, данные ниже). Restate why MultiFrame fits; CTA to MultiFRAME calculator and demo lead.

### Visible elements

- **Top verdict:** personal one-liner + class shift line `Сейчас: {label} → с MultiFrame: {label}` (hybrid labels / `Дискомфорт`) + what ~MultiFrame changes in plain language.
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
| Profile | `Комната` · `{room} · {N} м²` (no scenario chips) |
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
| Empty scenarios | **N/A** — screen removed |
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
- Class pills (hybrid): `Высокий комфорт (А)` · `Комфорт (Б)` · `Допустимый (В)` · `Дискомфорт` · optional `частично` — plus soft norm hint
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
| Pairs | Fixed default demo set (scenarios removed) |
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
| `scenarios` | **removed from survey** — do not require; omit from handoff or send empty (**ASSUMPTION:** omit) |

**ASSUMPTION:** handoff = `area` + `roomType`; `scenarios` no longer collected — omit.

### Session / CTA payload (`schemaVersion: 1`)

Visible/export shape includes: `{ schemaVersion, answers, derived, audio, cta }` where `cta` carries `{ roomType, ceilingAreaM2 }` (no scenarios).

### Demo lead behavior

- Fields: name, phone.
- On submit: `console` stub (e.g. `[lead-demo]`) with `{ name, phone, cta, derived, note: 'demo-only stub — no real StP CRM endpoint' }`.
- Show success `Принято (демо-stub)` + JSON summary.
- No network CRM; do not invent StP corporate endpoints.

---

## Acceptance tests

### A — Client for themselves

1. Open Start: pick `для себя`, emotional H1, **no dB**, tap `Начать`.
2. Room + area > 0; optional slab; `Далее`.
3. Before/After: class shift + **both** Δ (воздух/удар) with captions/sensations; charts; floor honesty for impact. **No** «что мешает» quiz.
4. Audio: default demo До/После; clear difference; `демо`.
5. Result: full pack; both Δ; «вдвое» only on air; calculator `area` (+ `roomType`); optional demo lead.
6. Restart works.
7. Must **not** present Scenarios or Current complaint screens.

**Pass:** completes without tech dumps; never promises Lnw norm from ceiling alone; sticky CTA OK on phone.

### B — Pro with client ≤ 3 minutes

1. Pick `для клиента`; default slab OK.
2. Room → Before/After (both Δ) → Audio quickly.
3. Result full pack; CTA calculator or demo lead.
4. ≤3 min without scenario/complaint quiz.

**Pass:** path ≤3 min; audio contrast obvious; full evidence under verdict; calculator CTA works.

---

## Doc drift note

`README.md` historically said the qualitative model is without fake ΔRw/ΔLnw. **Product decision (this spec + checklist):** placeholders **are** shown as tertiary marketing_placeholder figures with pre_lab labeling. Prefer this spec over the older README phrasing when they conflict.