import { useState, type FormEvent } from 'react';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { Field, TextInput } from '../../ui/Field';
import { CompactAudio } from '../../ui/CompactAudio';
import { SpectrumChart } from '../../ui/SpectrumChart';
import { useSession } from '../../state/SessionContext';
import {
  HOUSE_TYPE_OPTIONS,
  ROOM_TYPE_LABELS,
  SLAB_THICKNESS_OPTIONS,
  SLAB_TYPE_OPTIONS,
  type ClassLabel,
} from '../../state/types';
import {
  FELT_STEP_LABELS,
  FELT_STEPS,
  NORMS,
  airFeltStep,
  comfortClassFor,
  deriveSimulation,
  impactFeltStep,
  officialComfortLabel,
  type FeltStep,
} from '../../state/simulation';
import { resolveSlab } from '../../state/acoustic/construction';
import {
  buildCalculatorUrl,
  buildClientSummary,
  buildLeadHandoff,
} from '../../state/session';
import styles from './ResultScreen.module.css';

/** Official SP thresholds only (А/Б/В) — no fictional «Д». */
const NORM_ROWS: { cls: Exclude<ClassLabel, 'below'>; label: string; rw: string; lnw: string }[] =
  [
    { cls: 'A', label: 'Высокий комфорт (А)', rw: `≥ ${NORMS.A.Rw}`, lnw: `≤ ${NORMS.A.Lnw}` },
    { cls: 'B', label: 'Комфорт (Б)', rw: `≥ ${NORMS.B.Rw}`, lnw: `≤ ${NORMS.B.Lnw}` },
    { cls: 'V', label: 'Допустимый (В)', rw: `≥ ${NORMS.V.Rw}`, lnw: `≤ ${NORMS.V.Lnw}` },
  ];

/** Site positioning: эффективно / быстро / экологично — claim + why, no mount tech. */
const MULTIFRAME_ADVANTAGES = [
  {
    n: '01',
    title: 'Тише за счёт панели, а не плёнки',
    text: 'Обычный натяжной почти не изолирует: воздух в зазоре усиливает шаги и голоса, как полотно барабана. MultiFrame рассеивает эту энергию в панели и работает сразу по воздушному и ударному шуму.',
  },
  {
    n: '02',
    title: 'Быстро, без тяжёлого каркаса',
    text: 'Панели ставятся в темпе натяжного потолка: без двух дней каркасной стройки и без лишней потери высоты. Система подходит к любому перекрытию и к любой стадии ремонта.',
  },
  {
    n: '03',
    title: 'Безопасно для жилой комнаты',
    text: 'Без минеральной ваты и строительной пыли. Материалы сертифицированы и рассчитаны на жилые помещения — в том числе кухню и ванную.',
  },
] as const;

function optionLabel<T extends string>(
  options: { id: T; label: string }[],
  id: T | undefined,
): string {
  if (!id) return 'не указано';
  return options.find((o) => o.id === id)?.label ?? 'не указано';
}

function feltIndex(step: FeltStep): number {
  return FELT_STEPS.indexOf(step);
}

function FeltScale({
  title,
  now,
  after,
  quieterPct,
  mode,
  nowDb,
  afterDb,
}: {
  title: string;
  now: FeltStep;
  after?: FeltStep;
  quieterPct?: number;
  mode: 'nowOnly' | 'nowAndAfter';
  nowDb: number;
  afterDb?: number;
}) {
  const nowIdx = feltIndex(now);
  const afterIdx = after ? feltIndex(after) : -1;
  const same = mode === 'nowAndAfter' && after && now === after;
  const nowDbLabel = Math.round(nowDb);
  const afterDbLabel = afterDb != null ? Math.round(afterDb) : null;

  return (
    <div
      className={styles.feltScale}
      role="img"
      aria-label={
        mode === 'nowOnly'
          ? `${title}: сейчас ${FELT_STEP_LABELS[now]}, около ${nowDbLabel} дБ`
          : `${title}: сейчас ${FELT_STEP_LABELS[now]}, около ${nowDbLabel} дБ; с MultiFrame ${
              after ? FELT_STEP_LABELS[after] : ''
            }${afterDbLabel != null ? `, около ${afterDbLabel} дБ` : ''}${
              quieterPct != null ? `, примерно на ${quieterPct}% тише` : ''
            }`
      }
    >
      <div className={styles.feltHead}>
        <strong>{title}</strong>
        {mode === 'nowAndAfter' && quieterPct != null ? (
          <b>≈ {quieterPct}% тише</b>
        ) : null}
      </div>

      <p className={styles.feltDb}>
        {mode === 'nowOnly' || afterDbLabel == null ? (
          <>
            Сейчас в комнате: <b>≈ {nowDbLabel} дБ</b>
          </>
        ) : (
          <>
            Сейчас: <b>≈ {nowDbLabel} дБ</b>
            <span aria-hidden> → </span>
            с MultiFrame: <b>≈ {afterDbLabel} дБ</b>
          </>
        )}
      </p>

      <div className={styles.feltTrack} aria-hidden>
        <span className={styles.feltLine} />
        {FELT_STEPS.map((step, i) => {
          const isNow = i === nowIdx;
          const isAfter = mode === 'nowAndAfter' && i === afterIdx;
          const both = same && isNow;
          const edge = i === 0 ? 'start' : i === FELT_STEPS.length - 1 ? 'end' : 'mid';
          return (
            <span
              key={step}
              className={`${styles.feltStep} ${isNow || isAfter || both ? styles.feltStepActive : ''}`}
              data-edge={edge}
              style={{ left: `${(i / (FELT_STEPS.length - 1)) * 100}%` }}
            >
              {both ? (
                <span className={`${styles.feltMark} ${styles.feltMarkBoth}`}>Сейчас · После</span>
              ) : (
                <>
                  {isNow ? <span className={styles.feltMark}>Сейчас</span> : null}
                  {isAfter ? (
                    <span className={`${styles.feltMark} ${styles.feltMarkMf}`}>После</span>
                  ) : null}
                </>
              )}
              <span className={styles.feltDot} data-danger={step === 'danger' ? '' : undefined} />
              <span className={styles.feltLabel}>{FELT_STEP_LABELS[step]}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function ResultScreen() {
  const { session, restart } = useSession();
  const room = session.answers.room;
  const sim = session.derived?.simulation ?? deriveSimulation(session.answers);
  const hybridBefore = comfortClassFor(sim.before.Rw, sim.before.Lnw);
  const hybridAfter = comfortClassFor(sim.after.Rw, sim.after.Lnw);
  const beforeOfficial = officialComfortLabel(hybridBefore);
  const afterOfficial = officialComfortLabel(hybridAfter);

  const airNowFelt = airFeltStep(sim.before.Rw);
  const airAfterFelt = airFeltStep(sim.after.Rw);
  const impactNowFelt = impactFeltStep(sim.before.Lnw);
  const impactAfterFelt = impactFeltStep(sim.after.Lnw);

  const roomLabel = room.roomType ? ROOM_TYPE_LABELS[room.roomType] : null;
  const slab = resolveSlab(room);
  const slabTypeLabel = optionLabel(SLAB_TYPE_OPTIONS, room.slabType);
  const slabThickLabel = optionLabel(SLAB_THICKNESS_OPTIONS, room.slabThickness);
  const houseLabel = optionLabel(HOUSE_TYPE_OPTIONS, room.houseType);
  const slabContext =
    room.slabType === 'unknown' && room.slabThickness === 'unknown'
      ? `ориентир по типу дома (${houseLabel}), ~${slab.thicknessMm} мм`
      : `${slabTypeLabel}, ${slabThickLabel}`;

  const airSpectrum = sim.airSpectrum;
  const impactSpectrum = sim.impactSpectrum;
  const calcUrl = buildCalculatorUrl(session.cta);

  const [showLead, setShowLead] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);

  function openCalc() {
    window.open(calcUrl, '_blank', 'noopener,noreferrer');
  }

  function onLead(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const handoff = buildLeadHandoff(session, { name: name.trim(), phone: phone.trim() });
    console.info('[lead-demo]', handoff);
    setSent(true);
  }

  async function onCopySummary() {
    const text = buildClientSummary(session);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.info('[summary-copy-fallback]', text);
    }
  }

  return (
    <Screen
      dense
      title="Акустический профиль помещения"
      subtitle="Ориентир комфорта для вашего объекта и следующий шаг к расчёту"
    >
      <section className={styles.block} aria-label="Нормы комфорта в стройке">
        <header className={styles.sectionHead}>
          <h2>Нормы комфорта в стройке</h2>
          <p>
            Чтобы понять, насколько тихо в вашей комнате, сравниваем её с официальной шкалой
            акустического комфорта жилья — классами <b>А / Б / В</b> по СП 51.13330.2011. Ниже —
            пороги этой шкалы; дальше по ним отметим, где вы сейчас и куда можно выйти с
            MultiFrame.
          </p>
          <p>
            <b>Rw</b> — насколько перекрытие держит воздушный шум (голоса, музыка): больше —
            лучше. <b>Lnw</b> — насколько громко проходят шаги и удары: меньше — лучше.
          </p>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.normTableSimple}>
            <thead>
              <tr>
                <th>Уровень</th>
                <th>
                  Воздушный шум, Rw
                  <span>голоса и музыка · больше — лучше</span>
                </th>
                <th>
                  Ударный шум, Lnw
                  <span>шаги и падения · меньше — лучше</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {NORM_ROWS.map((r) => (
                <tr key={r.cls}>
                  <td>{r.label}</td>
                  <td>
                    {r.rw} <em>дБ</em>
                  </td>
                  <td>
                    {r.lnw} <em>дБ</em>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.contextLine}>
          Для вашего перекрытия: {slabContext}
          {' · '}
          тип дома: {houseLabel}
          {roomLabel ? ` · ${roomLabel}` : ''}
          {room.ceilingAreaM2 ? ` · ${room.ceilingAreaM2} м²` : ''}
        </p>
      </section>

      <section className={styles.block} aria-label="Текущая ситуация">
        <header className={styles.sectionHead}>
          <h2>Текущая ситуация</h2>
          <p>
            Ориентир того, как сейчас слышны голоса и шаги сверху в этой комнате — до монтажа
            MultiFrame. Цифры в дБ — ориентировочная громкость в помещении; шкала рядом — бытовая
            оценка по тем же нормам А/Б/В.
          </p>
          <p className={styles.officialHead}>
            Сейчас: уровень комфорта по нормам «{beforeOfficial}»
          </p>
        </header>

        <div className={styles.feltStack}>
          <FeltScale
            title="Воздушный шум (голоса и музыка)"
            now={airNowFelt}
            nowDb={sim.receivedAirDb.before}
            mode="nowOnly"
          />
          <FeltScale
            title="Ударный шум (шаги и падения)"
            now={impactNowFelt}
            nowDb={sim.receivedImpactDb.before}
            mode="nowOnly"
          />
        </div>
      </section>

      <section className={styles.block} aria-label="С MultiFrame">
        <header className={styles.sectionHead}>
          <h2>С MultiFrame</h2>
          <p>
            Тот же ориентир после монтажа системы: насколько тише станет в комнате и куда
            сдвинется класс по нормам. Сравните дБ «сейчас» и «после» на каждом канале.
          </p>
          <p className={styles.officialHead}>
            С MultiFrame: уровень комфорта по нормам «{afterOfficial}»
          </p>
        </header>

        <div className={styles.feltStack}>
          <FeltScale
            title="Воздушный шум (голоса и музыка)"
            now={airNowFelt}
            after={airAfterFelt}
            nowDb={sim.receivedAirDb.before}
            afterDb={sim.receivedAirDb.after}
            quieterPct={sim.perceivedAirPct}
            mode="nowAndAfter"
          />
          <FeltScale
            title="Ударный шум (шаги и падения)"
            now={impactNowFelt}
            after={impactAfterFelt}
            nowDb={sim.receivedImpactDb.before}
            afterDb={sim.receivedImpactDb.after}
            quieterPct={sim.perceivedImpactPct}
            mode="nowAndAfter"
          />
        </div>

        <CompactAudio pairs={session.audio.pairs} sim={sim} />

        <div className={styles.charts}>
          <header>
            <h3>Изоляция по частотам</h3>
            <p>Чем выше линия, тем лучше конструкция сдерживает соответствующие частоты шума.</p>
          </header>
          <SpectrumChart
            title="Воздушный шум (голоса и музыка)"
            subtitle="R(f), дБ · воздушный шум сверху"
            series={airSpectrum}
            yLabel="дБ"
          />
          <SpectrumChart
            title="Ударный шум (шаги и падения)"
            subtitle="Изоляция по полосам Гц · ударный шум"
            series={impactSpectrum}
            yLabel="дБ"
          />
        </div>
      </section>

      <section className={styles.reasons} aria-label="Уникальность системы MultiFrame">
        <header className={styles.sectionHead}>
          <h2>Уникальность системы MultiFrame</h2>
          <p>
            Модульная система StP: снижает воздушный и ударный шум, ставится в темпе натяжного
            потолка и без минеральной ваты.
          </p>
        </header>

        <div className={styles.reasonList}>
          {MULTIFRAME_ADVANTAGES.map((item) => (
            <article key={item.n}>
              <span>{item.n}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>

        <p className={styles.reasonConclusion}>
          Для этой комнаты это привычный формат натяжного потолка — с акустикой внутри
          системы, а не надеждой на одну плёнку.
        </p>
      </section>

      <section className={styles.nextStep} aria-label="Следующий шаг">
        <header>
          <h2>Следующий шаг</h2>
          <p>Вы уже видите профиль объекта — в калькуляторе останется уточнить комплектацию.</p>
        </header>

        <div className={styles.nextActions}>
          <Button fullWidth onClick={openCalc}>
            Открыть калькулятор MultiFrame
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setShowLead((v) => !v)}>
            Запросить консультацию или подбор
          </Button>
          <Button variant="ghost" fullWidth onClick={() => void onCopySummary()}>
            {copied ? 'Сводка скопирована' : 'Скопировать сводку'}
          </Button>
        </div>

        {showLead ? (
          <form className={styles.form} onSubmit={onLead}>
            <h3>Заявка на консультацию</h3>
            <p>Разберём ваш объект, подберём материал.</p>
            <Field label="Имя">
              <TextInput
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как к вам обращаться"
              />
            </Field>
            <Field label="Телефон">
              <TextInput
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 …"
              />
            </Field>
            <Button type="submit" fullWidth disabled={sent}>
              {sent ? 'Заявка принята' : 'Отправить'}
            </Button>
            {sent ? (
              <div className={styles.leadSuccess}>
                <button type="button" className={styles.inlineLink} onClick={openCalc}>
                  Открыть калькулятор MultiFrame
                </button>
              </div>
            ) : null}
          </form>
        ) : null}
      </section>

      <Button variant="ghost" onClick={restart}>
        Пройти ещё раз
      </Button>
    </Screen>
  );
}
