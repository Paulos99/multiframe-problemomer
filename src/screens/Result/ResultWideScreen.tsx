import { useCallback, useState } from 'react';
import { Button } from '../../ui/Button';
import { CompactAudio } from '../../ui/CompactAudio';
import { EchoComfort, EchoComfortRings } from '../../ui/EchoComfort';
import { SpectrumChart, type SpectrumSeriesMode } from '../../ui/SpectrumChart';
import { useSession } from '../../state/SessionContext';
import type { ClassLabel } from '../../state/types';
import { officialComfortLabel } from '../../state/simulation';
import {
  FeltScale,
  MULTIFRAME_PILLARS,
  NORM_ROWS,
  useResultProfile,
} from './resultShared';
import styles from './ResultWideScreen.module.css';

/** Worse → better along the SP hybrid ladder. */
const RAIL_STEPS: { id: ClassLabel; letter: string; name: string }[] = [
  { id: 'below', letter: 'ниже', name: 'Ниже' },
  { id: 'V', letter: 'В', name: 'Допустимый' },
  { id: 'B', letter: 'Б', name: 'Комфорт' },
  { id: 'A', letter: 'А', name: 'Высокий' },
];

function stepIndex(cls: ClassLabel): number {
  return RAIL_STEPS.findIndex((s) => s.id === cls);
}

function ComfortRail({
  before,
  after,
  compact,
}: {
  before: ClassLabel;
  after: ClassLabel;
  compact?: boolean;
}) {
  const beforeLabel = officialComfortLabel(before);
  const afterLabel = officialComfortLabel(after);
  const same = before === after;
  const bi = stepIndex(before);
  const ai = stepIndex(after);
  const fillTo = Math.max(bi, ai);

  return (
    <div
      className={`${styles.rail} ${compact ? styles.railCompact : ''}`}
      role="img"
      aria-label={
        same
          ? `Класс комфорта: ${beforeLabel}`
          : `Класс комфорта: сейчас ${beforeLabel}, с MultiFrame ${afterLabel}`
      }
    >
      <div className={styles.railHead}>
        <strong>Класс комфорта помещения</strong>
        <p className={styles.railShift}>
          {same ? (
            <>
              Остаётся <b className={styles.to}>«{afterLabel}»</b>
            </>
          ) : (
            <>
              <span className={styles.railPillMuted}>Сейчас · {beforeLabel}</span>
              <span className={styles.railPill}>После · {afterLabel}</span>
            </>
          )}
        </p>
      </div>

      <div className={styles.railTrack} aria-hidden>
        <span
          className={styles.railFill}
          style={{ width: `${((fillTo + 0.5) / RAIL_STEPS.length) * 100}%` }}
        />
        {RAIL_STEPS.map((step, i) => {
          const isBefore = step.id === before;
          const isAfter = step.id === after;
          const reached = i <= fillTo;
          return (
            <div
              key={step.id}
              className={`${styles.railSeg} ${reached ? styles.railSegOn : ''} ${isBefore || isAfter ? styles.railSegFocus : ''}`}
            >
              <span
                className={styles.railDot}
                data-before={isBefore ? '' : undefined}
                data-after={isAfter ? '' : undefined}
              />
              <span className={styles.railLetter}>{step.letter}</span>
              <span className={styles.railName}>{step.name}</span>
              <div className={styles.railMarks}>
                {isBefore && isAfter && same ? (
                  <span className={styles.markNow}>Сейчас · После</span>
                ) : (
                  <>
                    {isBefore ? <span className={styles.markNow}>Сейчас</span> : null}
                    {isAfter && !same ? <span className={styles.markAfter}>После</span> : null}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DeltaBars({ before, after, invert }: { before: number; after: number; invert?: boolean }) {
  const max = Math.max(before, after, 1);
  const bH = Math.round((before / max) * 100);
  const aH = Math.round((after / max) * 100);
  const better = invert ? after < before : after > before;
  const beforeDb = Math.round(before);
  const afterDb = Math.round(after);
  return (
    <div className={styles.kpiBars} aria-hidden>
      <span className={styles.kpiBarWrap}>
        <span className={styles.kpiBar} style={{ height: `${Math.max(18, bH)}%` }} />
        <span className={styles.kpiBarTip}>Сейчас · {beforeDb} дБ</span>
      </span>
      <span className={styles.kpiBarWrap}>
        <span
          className={`${styles.kpiBar} ${styles.kpiBarAfter} ${better ? styles.kpiBarBetter : ''}`}
          style={{ height: `${Math.max(18, aH)}%` }}
        />
        <span className={styles.kpiBarTip}>MultiFrame · {afterDb} дБ</span>
      </span>
    </div>
  );
}

function QuietRing({ pct }: { pct: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const dash = (clamped / 100) * c;
  return (
    <div className={styles.kpiRing} aria-hidden>
      <svg viewBox="0 0 56 56" className={styles.kpiRingSvg}>
        <circle className={styles.kpiRingTrack} cx="28" cy="28" r={r} />
        <circle
          className={styles.kpiRingValue}
          cx="28"
          cy="28"
          r={r}
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 28 28)"
        />
      </svg>
      <span className={styles.kpiRingPct}>{pct}%</span>
    </div>
  );
}

function MiniClassRail({ before, after }: { before: ClassLabel; after: ClassLabel }) {
  const bi = stepIndex(before);
  const ai = stepIndex(after);
  return (
    <div className={styles.kpiMiniRail} aria-hidden>
      {RAIL_STEPS.map((step, i) => {
        const on = i <= Math.max(bi, ai);
        const isBefore = step.id === before;
        const isAfter = step.id === after;
        return (
          <span
            key={step.id}
            className={`${styles.kpiMiniSeg} ${on ? styles.kpiMiniSegOn : ''} ${isBefore ? styles.kpiMiniBefore : ''} ${isAfter ? styles.kpiMiniAfter : ''}`}
          />
        );
      })}
    </div>
  );
}

export function ResultWideScreen() {
  const { goBack } = useSession();
  const p = useResultProfile();
  const [seriesMode, setSeriesMode] = useState<SpectrumSeriesMode>('both');
  const [hoverHz, setHoverHz] = useState<number | null>(null);
  const onHzHover = useCallback((hz: number | null) => {
    setHoverHz(hz);
  }, []);

  const deltaRw = Math.abs(Math.round(p.sim.delta.Rw));
  const deltaLnw = Math.abs(Math.round(p.sim.delta.Lnw));
  const quieterAir = p.sim.perceivedAirPct;
  const quieterImpact = p.sim.perceivedImpactPct;
  const quieterMax = Math.max(quieterAir, quieterImpact);

  const objectCells: { label: string; value: string }[] = [
    { label: 'Перекрытие', value: p.slabContext },
    { label: 'Тип дома', value: p.houseLabel },
  ];
  if (p.roomLabel) objectCells.push({ label: 'Комната', value: p.roomLabel });
  if (p.room.ceilingAreaM2) {
    objectCells.push({ label: 'Площадь', value: `${p.room.ceilingAreaM2} м²` });
  }
  objectCells.push({ label: 'Задача', value: p.wishLabel });

  return (
    <div className={styles.root}>
      <header className={styles.titleBar} data-reveal>
        <h1>Акустический профиль помещения</h1>
      </header>

      <section className={styles.objectSpec} data-reveal aria-label="Объект">
        <div className={styles.objectSpecLabel}>
          <span>Параметры</span>
          <strong>Объект</strong>
        </div>
        <dl className={styles.objectSpecGrid}>
          {objectCells.map((cell) => (
            <div key={cell.label}>
              <dt>{cell.label}</dt>
              <dd>{cell.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.kpiRow} data-reveal aria-label="Ключевые показатели">
        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Δ Rw · воздух</span>
          <div className={styles.kpiMain}>
            <strong className={styles.kpiValue}>
              +{deltaRw}
              <em>дБ</em>
            </strong>
            <DeltaBars before={p.sim.before.Rw} after={p.sim.after.Rw} />
          </div>
          <span className={styles.kpiPill}>изоляция ↑</span>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Δ Lnw · удар</span>
          <div className={styles.kpiMain}>
            <strong className={styles.kpiValue}>
              −{deltaLnw}
              <em>дБ</em>
            </strong>
            <DeltaBars before={p.sim.before.Lnw} after={p.sim.after.Lnw} invert />
          </div>
          <span className={styles.kpiPill}>шум ↓</span>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Акустический комфорт</span>
          <EchoComfortRings
            before={p.sim.reverb.echoInRoomBefore}
            after={p.sim.reverb.echoInRoomAfter}
            compact
          />
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Тише на слух</span>
          <div className={styles.kpiMain}>
            <strong className={styles.kpiValue}>
              ≈{quieterMax}
              <em>%</em>
            </strong>
            <QuietRing pct={quieterMax} />
          </div>
          <span className={styles.kpiPill}>
            воздух {quieterAir}% · удар {quieterImpact}%
          </span>
        </article>
        <article className={`${styles.kpiCard} ${styles.kpiCardAccent} ${styles.kpiCardClass}`}>
          <span className={styles.kpiLabel}>Класс комфорта</span>
          <div className={styles.kpiClassCompare}>
            <div className={styles.kpiClassCol}>
              <span className={styles.kpiClassTag}>Сейчас</span>
              <strong className={styles.kpiValueClassMuted}>«{p.beforeOfficial}»</strong>
            </div>
            <div className={styles.kpiClassCol}>
              <span className={styles.kpiClassTagAccent}>MultiFrame</span>
              <strong className={styles.kpiValueClass}>«{p.afterOfficial}»</strong>
            </div>
          </div>
          <MiniClassRail before={p.hybridBefore} after={p.hybridAfter} />
        </article>
      </section>

      <section className={styles.panel} data-reveal aria-label="Нормы комфорта для жилья">
        <div className={styles.normsHead}>
          <h2>Нормы комфорта жилья</h2>
          <p className={styles.normDefs}>
            <b>Rw</b> воздух · больше лучше &nbsp;·&nbsp; <b>Lnw</b> удар · меньше лучше
          </p>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.normTable}>
            <thead>
              <tr>
                <th>Уровень</th>
                <th>Rw</th>
                <th>Lnw</th>
              </tr>
            </thead>
            <tbody>
              {NORM_ROWS.map((r) => (
                <tr key={r.key} className={r.muted ? styles.normBelow : undefined}>
                  <td>
                    <span className={styles.normLevel}>
                      <span className={styles.normDot} data-muted={r.muted ? '' : undefined} />
                      {r.label}
                    </span>
                  </td>
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

      <section className={styles.effectListen} data-reveal aria-label="Эффективность и сравнение на слух">
        <div className={styles.effectCol}>
          <header className={styles.effectTop}>
            <h2>Эффективность MultiFrame</h2>
          </header>

          {p.showScenarioAside ? (
            <aside className={styles.scenario} aria-label="Ваша задача">
              {p.scenarioLine ? <p>{p.scenarioLine}</p> : null}
              {p.drumLine ? <p className={styles.scenarioExtra}>{p.drumLine}</p> : null}
              {p.soundCorrection ? <p className={styles.scenarioExtra}>{p.soundCorrection}</p> : null}
            </aside>
          ) : null}

          <div className={styles.feltStack}>
            <FeltScale
              title="Воздушный шум (голоса и музыка)"
              now={p.airNowFelt}
              after={p.airAfterFelt}
              indexKind="Rw"
              nowIndex={p.sim.before.Rw}
              afterIndex={p.sim.after.Rw}
              quieterPct={p.sim.perceivedAirPct}
              quieterDeltaDb={Math.abs(p.sim.delta.Rw)}
              mode="nowAndAfter"
            />
            <FeltScale
              title="Ударный шум (шаги и падения)"
              now={p.impactNowFelt}
              after={p.impactAfterFelt}
              indexKind="Lnw"
              nowIndex={p.sim.before.Lnw}
              afterIndex={p.sim.after.Lnw}
              quieterPct={p.sim.perceivedImpactPct}
              quieterDeltaDb={Math.abs(p.sim.delta.Lnw)}
              mode="nowAndAfter"
            />
          </div>

          <ComfortRail before={p.hybridBefore} after={p.hybridAfter} compact />
        </div>

        <div className={styles.listenSide} aria-label="Сравнить на слух">
          <header className={styles.listenSideHead}>
            <h2>Сравнить на слух</h2>
            <p className={styles.panelLead}>Эхо в комнате и звук сверху — до и после.</p>
          </header>
          <div className={styles.listenSideBody}>
            <div className={styles.listenCol}>
              <header className={styles.listenColHead}>
                <h3>
                  Эхо в комнате <span>(акустический комфорт)</span>
                </h3>
              </header>
              <EchoComfort sim={p.sim} variant="dashboard" showGauges={false} hideHead />
            </div>
            <div className={styles.listenCol}>
              <header className={styles.listenColHead}>
                <h3>
                  Звукоизоляция <span>(снижение шума)</span>
                </h3>
              </header>
              <CompactAudio
                pairs={p.session.audio.pairs}
                sim={p.sim}
                wish={p.wish}
                hideHead
                stacked
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.charts} data-reveal aria-label="Изоляция по частотам">
        <header className={styles.chartsHead}>
          <div>
            <h2>Изоляция по частотам</h2>
            <p className={styles.panelLead}>
              Чем выше линия, тем лучше перекрытие изолирует шум на этой частоте.
            </p>
          </div>
          <div className={styles.chartsToggles} role="group" aria-label="Серии графиков">
            {(
              [
                ['both', 'Обе'],
                ['before', 'Сейчас'],
                ['after', 'MultiFrame'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`${styles.chartsToggle} ${seriesMode === id ? styles.chartsToggleOn : ''}`}
                aria-pressed={seriesMode === id}
                onClick={() => setSeriesMode(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </header>
        <div className={styles.chartsGrid}>
          <SpectrumChart
            tall
            seriesMode={seriesMode}
            externalHz={hoverHz}
            onHzHover={onHzHover}
            title="Воздушный шум (голоса и музыка)"
            subtitle="изоляция от голосов и музыки сверху"
            series={p.sim.airSpectrum}
            yLabel="дБ"
            indexBadge={{ kind: 'Rw', before: p.sim.before.Rw, after: p.sim.after.Rw }}
            reductionDb={Math.abs(p.sim.delta.Rw)}
            reductionPct={p.sim.perceivedAirPct}
          />
          <SpectrumChart
            tall
            seriesMode={seriesMode}
            externalHz={hoverHz}
            onHzHover={onHzHover}
            title="Ударный шум (шаги и падения)"
            subtitle="изоляция от шагов и падений"
            series={p.sim.impactSpectrum}
            yLabel="дБ"
            indexBadge={{ kind: 'Lnw', before: p.sim.before.Lnw, after: p.sim.after.Lnw }}
            reductionDb={Math.abs(p.sim.delta.Lnw)}
            reductionPct={p.sim.perceivedImpactPct}
          />
        </div>
      </section>

      <div className={styles.closeRow}>
        <section className={styles.panel} data-reveal aria-label="Уникальность системы MultiFrame">
          <h2>Уникальность MultiFrame</h2>
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

        <section
          className={`${styles.panel} ${styles.nextPanel}`}
          data-reveal
          aria-label="Следующий шаг"
        >
          <h2>Следующий шаг</h2>
          <p className={styles.panelLead}>
            Подберите комплектацию MultiFrame или запросите консультацию.
          </p>
          <div className={styles.nextActions}>
            <Button fullWidth onClick={p.openCalc}>
              Рассчитать количество MultiFrame
            </Button>
            <Button variant="secondary" fullWidth onClick={p.openConsultation}>
              Запросить консультацию или подбор
            </Button>
            <div className={styles.splitActions}>
              <Button
                variant="ghost"
                disabled={p.pdfBusy}
                onClick={() => void p.onDownloadProfile()}
              >
                {p.pdfBusy ? 'Готовим PDF…' : 'Скачать PDF'}
              </Button>
              <Button variant="ghost" onClick={() => void p.onShare()}>
                {p.shareLabel}
              </Button>
            </div>
            {p.pdfError ? (
              <p className={styles.pdfError} role="alert">
                Не удалось скачать. Разрешите всплывающие окна и нажмите ещё раз.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <div className={styles.footerActions}>
        <Button variant="ghost" onClick={goBack}>
          Назад
        </Button>
        <Button variant="ghost" onClick={p.restart}>
          Пройти ещё раз
        </Button>
      </div>
    </div>
  );
}
