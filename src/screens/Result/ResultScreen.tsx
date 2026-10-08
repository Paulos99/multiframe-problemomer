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
import { buildCalculatorUrl } from '../../state/session';
import { downloadAcousticProfilePdf, shareAcousticProfile } from '../../state/reportPdf';
import { wishPrimaryGroup, wishScenarioLine, wishSoundCorrectionLine, stretchDrumLine } from '../../state/wish';
import styles from './ResultScreen.module.css';

/** Official SP thresholds А/Б/В + explicit «ниже допустимого» band. */
const NORM_ROWS: { key: string; label: string; rw: string; lnw: string; muted?: boolean }[] = [
  { key: 'A', label: 'Высокий комфорт (А)', rw: `≥ ${NORMS.A.Rw}`, lnw: `≤ ${NORMS.A.Lnw}` },
  { key: 'B', label: 'Комфорт (Б)', rw: `≥ ${NORMS.B.Rw}`, lnw: `≤ ${NORMS.B.Lnw}` },
  { key: 'V', label: 'Допустимый (В)', rw: `≥ ${NORMS.V.Rw}`, lnw: `≤ ${NORMS.V.Lnw}` },
  {
    key: 'below',
    label: 'Ниже допустимого',
    rw: `< ${NORMS.V.Rw}`,
    lnw: `> ${NORMS.V.Lnw}`,
    muted: true,
  },
];

/** StP site pillars — title + one line, no vs-comparison with plain stretch film. */
const MULTIFRAME_PILLARS = [
  {
    title: 'Звукоизоляция и акустический комфорт',
    text: 'Снижает воздушный и ударный шум — в комнате становится спокойнее.',
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
    text: 'Сначала панели, потом натяжное полотно. Без каркаса и без лишней потери высоты.',
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
    indexKind === 'Rw' ? 'чем больше число, тем лучше' : 'чем меньше число, тем лучше';

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
              quieterPct != null ? `, станет на ≈ ${quieterPct}% тише` : ''
            }`
      }
    >
      <div className={styles.feltHead}>
        <strong>{title}</strong>
        {mode === 'nowAndAfter' && quieterPct != null ? (
          <b>станет на ≈ {quieterPct}% тише</b>
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
  // «Другая задача» / сплошные «Не знаю» по объекту — без персонального блока задачи.
  const objectAllUnknown =
    room.houseType === 'unknown' &&
    room.slabType === 'unknown' &&
    room.slabThickness === 'unknown' &&
    room.floorAbove === 'unknown' &&
    room.noisyNeighbors === 'unknown' &&
    room.objectStage === 'unknown' &&
    room.plannedCeiling === 'unknown';
  const showWishScenario = wish !== 'other' && !objectAllUnknown;
  const showScenarioAside = showWishScenario || Boolean(drumLine) || Boolean(soundCorrection);

  const [shareState, setShareState] = useState<'idle' | 'shared' | 'copied' | 'failed'>('idle');

  function openCalc() {
    window.open(calcUrl, '_blank', 'noopener,noreferrer');
  }

  function openConsultation() {
    window.open(CONSULTATION_URL, '_blank', 'noopener,noreferrer');
  }

  const [pdfBusy, setPdfBusy] = useState(false);

  async function onDownloadProfile() {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      await downloadAcousticProfilePdf(session);
    } catch (err) {
      console.error('[pdf]', err);
    } finally {
      setPdfBusy(false);
    }
  }

  async function onShare() {
    const result = await shareAcousticProfile(session);
    setShareState(result === 'failed' ? 'failed' : result);
    window.setTimeout(() => setShareState('idle'), 2500);
  }

  const shareLabel =
    shareState === 'shared'
      ? 'Отправлено'
      : shareState === 'copied'
        ? 'Ссылка скопирована'
        : shareState === 'failed'
          ? 'Не удалось поделиться'
          : 'Поделиться';

  const airChart = (
    <SpectrumChart
      title="Воздушный шум (голоса и музыка)"
      subtitle="изоляция от голосов и музыки сверху"
      series={airSpectrum}
      yLabel="дБ"
      indexBadge={{ kind: 'Rw', before: sim.before.Rw, after: sim.after.Rw }}
    />
  );
  const impactChart = (
    <SpectrumChart
      title="Ударный шум (шаги и падения)"
      subtitle="изоляция от шагов и падений"
      series={impactSpectrum}
      yLabel="дБ"
      indexBadge={{ kind: 'Lnw', before: sim.before.Lnw, after: sim.after.Lnw }}
    />
  );

  return (
    <Screen dense title="Акустический профиль помещения">
      <section className={styles.block} aria-label="Нормы комфорта для жилья">
        <header className={styles.sectionHead}>
          <h2>Нормы комфорта для жилья</h2>
          <p>
            Сравниваем ваше <b>перекрытие</b> с нормой комфорта жилья по СП 51.13330.2011.
          </p>
          <ul className={styles.normLeadList}>
            <li>
              <b>А / Б / В</b> — уровни комфорта из нормы
            </li>
            <li>Дальше покажем, где вы сейчас и что даёт MultiFrame</li>
          </ul>
          <div className={styles.indexDefs}>
            <p>
              <b>Rw</b> — изоляция от воздушного шума (голоса, музыка): <b>больше — лучше</b>
            </p>
            <p>
              <b>Lnw</b> — ударный шум (шаги, падения): <b>меньше — лучше</b>
            </p>
          </div>
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
                <tr key={r.key} className={r.muted ? styles.normBelow : undefined}>
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
      </section>

      <section className={styles.block} aria-label="Текущая ситуация">
        <header className={styles.sectionHead}>
          <h2>Текущая ситуация</h2>
        </header>

        <div className={styles.objectCard} aria-label="Объект">
          <h3>Объект</h3>
          <dl className={styles.objectGrid}>
            <div>
              <dt>Перекрытие</dt>
              <dd>{slabContext}</dd>
            </div>
            <div>
              <dt>Тип дома</dt>
              <dd>{houseLabel}</dd>
            </div>
            {roomLabel ? (
              <div>
                <dt>Комната</dt>
                <dd>{roomLabel}</dd>
              </div>
            ) : null}
            {room.ceilingAreaM2 ? (
              <div>
                <dt>Площадь</dt>
                <dd>{room.ceilingAreaM2} м²</dd>
              </div>
            ) : null}
            <div>
              <dt>Задача</dt>
              <dd>{wishLabel}</dd>
            </div>
          </dl>
        </div>

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

        <p className={styles.comfortClass}>
          <span>Класс комфорта помещения</span>
          <b>«{beforeOfficial}»</b>
        </p>
      </section>

      <section className={styles.block} aria-label="С MultiFrame">
        <header className={styles.sectionHead}>
          <h2>С MultiFrame</h2>
        </header>

        {showScenarioAside ? (
          <aside className={styles.scenario} aria-label="Ваша задача">
            {showWishScenario ? <p>{wishScenarioLine(wish)}</p> : null}
            {drumLine ? <p className={styles.scenarioExtra}>{drumLine}</p> : null}
            {soundCorrection ? <p className={styles.scenarioExtra}>{soundCorrection}</p> : null}
          </aside>
        ) : null}

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
            <p>Чем выше линия, тем лучше потолок держит шум на этой частоте.</p>
          </header>
          {impactFirst ? (
            <>
              {impactChart}
              {airChart}
            </>
          ) : (
            <>
              {airChart}
              {impactChart}
            </>
          )}
        </div>

        <p className={styles.comfortClass}>
          <span>Класс комфорта помещения</span>
          <b>«{afterOfficial}»</b>
        </p>
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
          <p>Профиль комнаты готов. В калькуляторе можно подобрать комплектацию MultiFrame.</p>
        </header>

        <div className={styles.nextActions}>
          <Button fullWidth onClick={openCalc}>
            Рассчитать количество MultiFrame
          </Button>
          <Button variant="secondary" fullWidth onClick={openConsultation}>
            Запросить консультацию или подбор
          </Button>
          <div className={styles.splitActions}>
            <Button
              variant="ghost"
              className={styles.splitBtn}
              disabled={pdfBusy}
              onClick={() => void onDownloadProfile()}
            >
              {pdfBusy ? 'Готовим PDF…' : 'Скачать результаты'}
            </Button>
            <Button
              variant="ghost"
              className={styles.splitBtn}
              onClick={() => void onShare()}
            >
              {shareLabel}
            </Button>
          </div>
        </div>
      </section>

      <Button variant="ghost" onClick={restart}>
        Пройти ещё раз
      </Button>
    </Screen>
  );
}
