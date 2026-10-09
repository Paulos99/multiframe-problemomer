import { useEffect, useState, type ReactNode } from 'react';
import { CompactAudio } from '../../ui/CompactAudio';
import { EchoComfort } from '../../ui/EchoComfort';
import { SpectrumChart } from '../../ui/SpectrumChart';
import { SoundPressureHelpButton } from '../../ui/SoundPressureHelp';
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
import {
  downloadAcousticProfilePdf,
  prefetchAcousticProfilePdf,
  shareAcousticProfile,
} from '../../state/reportPdf';
import { wishScenarioLine, wishSoundCorrectionLine, stretchDrumLine } from '../../state/wish';
import styles from './resultShared.module.css';
import type { ResultLayout } from './useResultLayout';

/** Official SP thresholds А/Б/В + explicit «ниже допустимого» band. */
export const NORM_ROWS: { key: string; label: string; rw: string; lnw: string; muted?: boolean }[] =
  [
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
export const MULTIFRAME_PILLARS = [
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

export function optionLabel<T extends string>(
  options: { id: T; label: string }[],
  id: T | undefined,
): string {
  if (!id) return 'не указано';
  return options.find((o) => o.id === id)?.label ?? 'не указано';
}

function feltIndex(step: FeltStep): number {
  return FELT_STEPS.indexOf(step);
}

export function FeltScale({
  title,
  now,
  after,
  quieterPct,
  quieterDeltaDb,
  mode,
  indexKind,
  nowIndex,
  afterIndex,
}: {
  title: string;
  now: FeltStep;
  after?: FeltStep;
  quieterPct?: number;
  quieterDeltaDb?: number;
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
          ? `${title}: сейчас ${FELT_STEP_LABELS[now]}, ${indexKind} ≈ ${nowVal} дБ`
          : `${title}: сейчас ${FELT_STEP_LABELS[now]}, ${indexKind} ≈ ${nowVal} дБ; с MultiFrame ${
              after ? FELT_STEP_LABELS[after] : ''
            }${afterVal != null ? `, ${indexKind} ≈ ${afterVal} дБ` : ''}${
              quieterPct != null ? `, станет на ≈ ${quieterPct}% тише` : ''
            }`
      }
    >
      <div className={styles.feltHead}>
        <strong>{title}</strong>
        {mode === 'nowAndAfter' && quieterPct != null ? (
          <b className={styles.quieterLine}>
            станет на ≈ {quieterPct}% тише
            <SoundPressureHelpButton
              highlightDb={quieterDeltaDb}
              label={`Таблица снижения звукового давления для ${indexKind}`}
            />
          </b>
        ) : null}
      </div>

      <p className={styles.feltDb}>
        {mode === 'nowOnly' || afterVal == null ? (
          <>
            Сейчас: <b>{indexKind} ≈ {nowVal} дБ</b>
            <span> · {direction}</span>
          </>
        ) : (
          <>
            <b>{indexKind}</b>:{' '}
            <b>≈ {nowVal} дБ</b>
            <span aria-hidden> → </span>
            <b>≈ {afterVal} дБ</b>
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

export function ResultLayoutToggle({
  preference,
  onChange,
}: {
  preference: ResultLayout;
  onChange: (next: ResultLayout) => void;
}) {
  return (
    <div className={styles.layoutToggle} role="group" aria-label="Вид итогов">
      <button
        type="button"
        className={`${styles.layoutToggleBtn} ${preference === 'wide' ? styles.layoutToggleBtnActive : ''}`}
        aria-pressed={preference === 'wide'}
        onClick={() => onChange('wide')}
      >
        Широкий
      </button>
      <button
        type="button"
        className={`${styles.layoutToggleBtn} ${preference === 'classic' ? styles.layoutToggleBtnActive : ''}`}
        aria-pressed={preference === 'classic'}
        onClick={() => onChange('classic')}
      >
        Классический
      </button>
    </div>
  );
}

/** Shared derived data + actions for classic and wide Result screens. */
export function useResultProfile() {
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
  const soundCorrection = wishSoundCorrectionLine(wish);
  const drumLine = stretchDrumLine(room.plannedCeiling);
  const slabContext =
    room.slabType === 'unknown' && room.slabThickness === 'unknown'
      ? `ориентир по типу дома (${houseLabel}), ~${slab.thicknessMm} мм`
      : `${slabTypeLabel}, ${slabThickLabel}`;

  const airSpectrum = sim.airSpectrum;
  const impactSpectrum = sim.impactSpectrum;
  const calcUrl = buildCalculatorUrl(session.cta);
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
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    prefetchAcousticProfilePdf();
  }, []);

  function openCalc() {
    window.open(calcUrl, '_blank', 'noopener,noreferrer');
  }

  function openConsultation() {
    window.open(CONSULTATION_URL, '_blank', 'noopener,noreferrer');
  }

  async function onDownloadProfile() {
    if (pdfBusy) return;
    setPdfBusy(true);
    setPdfError(false);
    try {
      await downloadAcousticProfilePdf(session);
    } catch (err) {
      console.error('[pdf]', err);
      setPdfError(true);
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

  const airChart: ReactNode = (
    <SpectrumChart
      title="Воздушный шум (голоса и музыка)"
      subtitle="изоляция от голосов и музыки сверху"
      series={airSpectrum}
      yLabel="дБ"
      indexBadge={{ kind: 'Rw', before: sim.before.Rw, after: sim.after.Rw }}
      reductionDb={Math.abs(sim.delta.Rw)}
      reductionPct={sim.perceivedAirPct}
    />
  );
  const impactChart: ReactNode = (
    <SpectrumChart
      title="Ударный шум (шаги и падения)"
      subtitle="изоляция от шагов и падений"
      series={impactSpectrum}
      yLabel="дБ"
      indexBadge={{ kind: 'Lnw', before: sim.before.Lnw, after: sim.after.Lnw }}
      reductionDb={Math.abs(sim.delta.Lnw)}
      reductionPct={sim.perceivedImpactPct}
    />
  );

  const echoNode = <EchoComfort sim={sim} />;
  const audioNode = <CompactAudio pairs={session.audio.pairs} sim={sim} wish={wish} />;

  return {
    session,
    restart,
    room,
    sim,
    hybridBefore,
    hybridAfter,
    beforeOfficial,
    afterOfficial,
    airNowFelt,
    airAfterFelt,
    impactNowFelt,
    impactAfterFelt,
    roomLabel,
    houseLabel,
    wishLabel,
    wish,
    soundCorrection,
    drumLine,
    slabContext,
    showWishScenario,
    showScenarioAside,
    scenarioLine: showWishScenario ? wishScenarioLine(wish) : null,
    pdfBusy,
    pdfError,
    shareLabel,
    openCalc,
    openConsultation,
    onDownloadProfile,
    onShare,
    airChart,
    impactChart,
    echoNode,
    audioNode,
  };
}
