import { useState } from 'react';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { CompactAudio } from '../../ui/CompactAudio';
import { SpectrumChart } from '../../ui/SpectrumChart';
import { useSession } from '../../state/SessionContext';
import {
  CONSULTATION_URL,
  HOUSE_TYPE_OPTIONS,
  ROOM_TYPE_LABELS,
  ROOM_WISH_OPTIONS,
  SLAB_THICKNESS_OPTIONS,
  SLAB_TYPE_OPTIONS,
  type ClassLabel,
} from '../../state/types';
import {
  FELT_STEP_LABELS,
  FELT_STEPS,
  NORMS,
  airFeltFromIndex,
  comfortClassFor,
  deriveSimulation,
  impactFeltFromIndex,
  officialComfortLabel,
  type FeltStep,
} from '../../state/simulation';
import { resolveSlab } from '../../state/acoustic/construction';
import { buildCalculatorUrl, buildClientSummary } from '../../state/session';
import { wishPrimaryGroup, wishScenarioLine, wishSoundCorrectionLine, stretchDrumLine } from '../../state/wish';
import styles from './ResultScreen.module.css';

/** Official SP thresholds only (А/Б/В) — no fictional «Д». */
const NORM_ROWS: { cls: Exclude<ClassLabel, 'below'>; label: string; rw: string; lnw: string }[] =
  [
    { cls: 'A', label: 'Высокий комфорт (А)', rw: `≥ ${NORMS.A.Rw}`, lnw: `≤ ${NORMS.A.Lnw}` },
    { cls: 'B', label: 'Комфорт (Б)', rw: `≥ ${NORMS.B.Rw}`, lnw: `≤ ${NORMS.B.Lnw}` },
    { cls: 'V', label: 'Допустимый (В)', rw: `≥ ${NORMS.V.Rw}`, lnw: `≤ ${NORMS.V.Lnw}` },
  ];

/** StP site pillars — title + one line, no vs-comparison with plain stretch film. */
const MULTIFRAME_PILLARS = [
  {
    title: 'Звукоизоляция и акустический комфорт',
    text: 'Снижает воздушный и ударный шум — в комнате спокойнее и ровнее по ощущению.',
  },
  {
    title: 'Безопасность',
    text: 'Материалы для жилых помещений: спальня, детская, кухня и ванная.',
  },
  {
    title: 'Экологичность',
    text: 'Без минеральной ваты и строительной пыли на объекте.',
  },
  {
    title: 'Быстрый монтаж',
    text: 'Панели до полотна: без долгой каркасной стройки и лишней потери высоты.',
  },
  {
    title: 'Универсальность',
    text: 'Подходит к любому перекрытию и к любой стадии ремонта.',
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
  indexKind,
  nowIndex,
  afterIndex,
}: {
  title: string;
  now: FeltStep;
  after?: FeltStep;
  quieterPct?: number;
  mode: 'nowOnly' | 'nowAndAfter';
  /** SP construction index shown on this axis (not room L2). */
  indexKind: 'Rw' | 'Lnw';
  nowIndex: number;
  afterIndex?: number;
}) {
  const nowIdx = feltIndex(now);
  const afterIdx = after ? feltIndex(after) : -1;
  const same = mode === 'nowAndAfter' && after && now === after;
  const nowVal = Math.round(nowIndex);
  const afterVal = afterIndex != null ? Math.round(afterIndex) : null;
  const direction =
    indexKind === 'Rw' ? 'изоляция, больше — лучше' : 'индекс удара, меньше — лучше';

  return (
    <div
      className={styles.feltScale}
      role="img"
      aria-label={
        mode === 'nowOnly'
          ? `${title}: сейчас ${FELT_STEP_LABELS[now]}, ${indexKind} ≈ ${nowVal}`
          : `${title}: сейчас ${FELT_STEP_LABELS[now]}, ${indexKind} ≈ ${nowVal}; с MultiFrame ${
              after ? FELT_STEP_LABELS[after] : ''
            }${afterVal != null ? `, ${indexKind} ≈ ${afterVal}` : ''}${
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
        {mode === 'nowOnly' || afterVal == null ? (
          <>
            Сейчас: <b>{indexKind} ≈ {nowVal}</b>
            <span> · {direction}</span>
          </>
        ) : (
          <>
            <b>{indexKind}</b>:{' '}
            <b>≈ {nowVal}</b>
            <span aria-hidden> → </span>
            <b>≈ {afterVal}</b>
            <span> · {direction}</span>
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

  const airNowFelt = airFeltFromIndex(sim.before.Rw);
  const airAfterFelt = airFeltFromIndex(sim.after.Rw);
  const impactNowFelt = impactFeltFromIndex(sim.before.Lnw);
  const impactAfterFelt = impactFeltFromIndex(sim.after.Lnw);

  const roomLabel = room.roomType ? ROOM_TYPE_LABELS[room.roomType] : null;
  const slab = resolveSlab(room);
  const slabTypeLabel = optionLabel(SLAB_TYPE_OPTIONS, room.slabType);
  const slabThickLabel = optionLabel(SLAB_THICKNESS_OPTIONS, room.slabThickness);
  const houseLabel = optionLabel(HOUSE_TYPE_OPTIONS, room.houseType);
  const wishLabel = optionLabel(ROOM_WISH_OPTIONS, room.roomWish);
  const wish = room.roomWish;
  const impactFirst = wishPrimaryGroup(wish) === 'impact';
  const soundCorrection = wishSoundCorrectionLine(wish);
  const drumLine = stretchDrumLine(room.plannedCeiling);
  const slabContext =
    room.slabType === 'unknown' && room.slabThickness === 'unknown'
      ? `ориентир по типу дома (${houseLabel}), ~${slab.thicknessMm} мм`
      : `${slabTypeLabel}, ${slabThickLabel}`;

  const airSpectrum = sim.airSpectrum;
  const impactSpectrum = sim.impactSpectrum;
  const calcUrl = buildCalculatorUrl(session.cta);

  const [copied, setCopied] = useState(false);

  function openCalc() {
    window.open(calcUrl, '_blank', 'noopener,noreferrer');
  }

  function openConsultation() {
    window.open(CONSULTATION_URL, '_blank', 'noopener,noreferrer');
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
            Чтобы понять, насколько тихо в вашей комнате, сравниваем <b>перекрытие</b> с
            официальной шкалой акустического комфорта жилья — классами <b>А / Б / В</b> по СП
            51.13330.2011. Ниже — пороги этой шкалы; дальше по ним отметим, где вы сейчас и куда
            можно выйти с MultiFrame.
          </p>
          <p>
            <b>Rw</b> — изоляция от воздушного шума (голоса, музыка): <b>больше — лучше</b>.{' '}
            <b>Lnw</b> — индекс ударного шума (шаги, падения): <b>меньше — лучше</b>.
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
          {` · задача: ${wishLabel}`}
        </p>
      </section>

      <section className={styles.block} aria-label="Текущая ситуация">
        <header className={styles.sectionHead}>
          <h2>Текущая ситуация</h2>
          <p>
            Ориентир по нормам СП для этого перекрытия — до монтажа MultiFrame. Шкала и цифры{' '}
            <b>Rw / Lnw</b> — про изоляцию конструкции.
          </p>
          <p className={styles.officialHead}>
            Сейчас: уровень комфорта по нормам «{beforeOfficial}»
          </p>
        </header>

        <div className={styles.feltStack}>
          {impactFirst ? (
            <>
              <FeltScale
                title="Ударный шум (шаги и падения)"
                now={impactNowFelt}
                indexKind="Lnw"
                nowIndex={sim.before.Lnw}
                mode="nowOnly"
              />
              <FeltScale
                title="Воздушный шум (голоса и музыка)"
                now={airNowFelt}
                indexKind="Rw"
                nowIndex={sim.before.Rw}
                mode="nowOnly"
              />
            </>
          ) : (
            <>
              <FeltScale
                title="Воздушный шум (голоса и музыка)"
                now={airNowFelt}
                indexKind="Rw"
                nowIndex={sim.before.Rw}
                mode="nowOnly"
              />
              <FeltScale
                title="Ударный шум (шаги и падения)"
                now={impactNowFelt}
                indexKind="Lnw"
                nowIndex={sim.before.Lnw}
                mode="nowOnly"
              />
            </>
          )}
        </div>
      </section>

      <section className={styles.block} aria-label="С MultiFrame">
        <header className={styles.sectionHead}>
          <h2>С MultiFrame</h2>
          <p>
            Тот же ориентир по нормам после монтажа: куда сдвинутся <b>Rw / Lnw</b> и бытовая
            шкала.
          </p>
          <p className={styles.officialHead}>
            С MultiFrame: уровень комфорта по нормам «{afterOfficial}»
          </p>
        </header>

        <aside className={styles.scenario} aria-label="Ваша задача">
          <p>{wishScenarioLine(wish)}</p>
          {drumLine ? <p className={styles.scenarioExtra}>{drumLine}</p> : null}
          {soundCorrection ? <p className={styles.scenarioExtra}>{soundCorrection}</p> : null}
        </aside>

        <div className={styles.feltStack}>
          {impactFirst ? (
            <>
              <FeltScale
                title="Ударный шум (шаги и падения)"
                now={impactNowFelt}
                after={impactAfterFelt}
                indexKind="Lnw"
                nowIndex={sim.before.Lnw}
                afterIndex={sim.after.Lnw}
                quieterPct={sim.perceivedImpactPct}
                mode="nowAndAfter"
              />
              <FeltScale
                title="Воздушный шум (голоса и музыка)"
                now={airNowFelt}
                after={airAfterFelt}
                indexKind="Rw"
                nowIndex={sim.before.Rw}
                afterIndex={sim.after.Rw}
                quieterPct={sim.perceivedAirPct}
                mode="nowAndAfter"
              />
            </>
          ) : (
            <>
              <FeltScale
                title="Воздушный шум (голоса и музыка)"
                now={airNowFelt}
                after={airAfterFelt}
                indexKind="Rw"
                nowIndex={sim.before.Rw}
                afterIndex={sim.after.Rw}
                quieterPct={sim.perceivedAirPct}
                mode="nowAndAfter"
              />
              <FeltScale
                title="Ударный шум (шаги и падения)"
                now={impactNowFelt}
                after={impactAfterFelt}
                indexKind="Lnw"
                nowIndex={sim.before.Lnw}
                afterIndex={sim.after.Lnw}
                quieterPct={sim.perceivedImpactPct}
                mode="nowAndAfter"
              />
            </>
          )}
        </div>

        <CompactAudio pairs={session.audio.pairs} sim={sim} wish={wish} />

        <div className={styles.charts}>
          <header>
            <h3>Изоляция по частотам</h3>
            <p>Чем выше линия, тем лучше конструкция сдерживает соответствующие частоты шума.</p>
          </header>
          {impactFirst ? (
            <>
              <SpectrumChart
                title="Ударный шум (шаги и падения)"
                subtitle="Изоляция по полосам Гц · ударный шум"
                series={impactSpectrum}
                yLabel="дБ"
              />
              <SpectrumChart
                title="Воздушный шум (голоса и музыка)"
                subtitle="R(f), дБ · воздушный шум сверху"
                series={airSpectrum}
                yLabel="дБ"
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>

      <section className={styles.reasons} aria-label="Уникальность системы MultiFrame">
        <header className={styles.sectionHead}>
          <h2>Уникальность системы MultiFrame</h2>
          <p>Эффективно. Безопасно. Без долгой стройки.</p>
        </header>

        <ul className={styles.uniqGrid}>
          {MULTIFRAME_PILLARS.map((item) => (
            <li key={item.title} className={styles.uniqPillar}>
              <span className={styles.uniqPillarMark} aria-hidden />
              <div className={styles.uniqPillarBody}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
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
          <Button variant="secondary" fullWidth onClick={openConsultation}>
            Запросить консультацию или подбор
          </Button>
          <Button variant="ghost" fullWidth onClick={() => void onCopySummary()}>
            {copied ? 'Сводка скопирована' : 'Скопировать сводку'}
          </Button>
        </div>
      </section>

      <Button variant="ghost" onClick={restart}>
        Пройти ещё раз
      </Button>
    </Screen>
  );
}
