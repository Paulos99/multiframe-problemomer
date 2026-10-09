import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../ui/Button';
import { CompactAudio } from '../../ui/CompactAudio';
import { EchoComfort, EchoComfortRings } from '../../ui/EchoComfort';
import { SpectrumChart } from '../../ui/SpectrumChart';
import { useSession } from '../../state/SessionContext';
import type { ClassLabel } from '../../state/types';
import {
  FeltScale,
  MULTIFRAME_PILLARS,
  NORM_ROWS,
  useResultProfile,
} from './resultShared';
import styles from './ResultWideScreen.module.css';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Count 0 → target; parent bumps `replayKey` on card hover. */
function CountUpValue({
  value,
  prefix = '',
  suffix,
  className,
  replayKey = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: ReactNode;
  className?: string;
  replayKey?: number;
}) {
  const [display, setDisplay] = useState(value);
  const cancelRef = useRef<() => void>(() => {});

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  useEffect(() => () => cancelRef.current(), []);

  useEffect(() => {
    if (replayKey === 0) return;
    cancelRef.current();
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    setDisplay(0);
    const start = performance.now();
    const dur = 720;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else cancelRef.current = () => {};
    };
    raf = requestAnimationFrame(tick);
    cancelRef.current = () => cancelAnimationFrame(raf);
  }, [replayKey, value]);

  return (
    <strong className={className}>
      {prefix}
      {display}
      {suffix}
    </strong>
  );
}

function useHoverReplay() {
  const [replayKey, setReplayKey] = useState(0);
  return {
    replayKey,
    onMouseEnter: () => setReplayKey((n) => n + 1),
  };
}

function KpiRow({
  deltaRw,
  deltaLnw,
  quieterAir,
  quieterImpact,
  quieterMax,
  echoBefore,
  echoAfter,
  rwBefore,
  rwAfter,
  lnwBefore,
  lnwAfter,
}: {
  deltaRw: number;
  deltaLnw: number;
  quieterAir: number;
  quieterImpact: number;
  quieterMax: number;
  echoBefore: number;
  echoAfter: number;
  rwBefore: number;
  rwAfter: number;
  lnwBefore: number;
  lnwAfter: number;
}) {
  const rw = useHoverReplay();
  const lnw = useHoverReplay();
  const comfort = useHoverReplay();
  const quieter = useHoverReplay();

  return (
    <section
      className={`${styles.kpiRow} ${styles.driftSoft}`}
      data-reveal
      aria-label="Ключевые показатели"
    >
      <article className={styles.kpiCard} onMouseEnter={rw.onMouseEnter}>
        <span className={styles.kpiLabel}>Δ Rw · изоляция воздушного шума</span>
        <div className={styles.kpiMain}>
          <CountUpValue
            className={styles.kpiValue}
            value={deltaRw}
            prefix="+"
            suffix={<em>дБ</em>}
            replayKey={rw.replayKey}
          />
          <DeltaBars before={rwBefore} after={rwAfter} />
        </div>
        {quieterAir > 0 ? (
          <span className={styles.kpiPill}>≈ на {quieterAir}% тише</span>
        ) : (
          <span className={styles.kpiPillLight}>без заметного снижения</span>
        )}
      </article>
      <article className={styles.kpiCard} onMouseEnter={lnw.onMouseEnter}>
        <span className={styles.kpiLabel}>Δ Lnw · уровень ударного шума</span>
        <div className={styles.kpiMain}>
          <CountUpValue
            className={styles.kpiValue}
            value={deltaLnw}
            prefix="−"
            suffix={<em>дБ</em>}
            replayKey={lnw.replayKey}
          />
          <DeltaBars before={lnwBefore} after={lnwAfter} invert />
        </div>
        {quieterImpact > 0 ? (
          <span className={styles.kpiPill}>≈ на {quieterImpact}% тише</span>
        ) : (
          <span className={styles.kpiPillLight}>без заметного снижения</span>
        )}
      </article>
      <article className={styles.kpiCard} onMouseEnter={comfort.onMouseEnter}>
        <span className={styles.kpiLabel}>Акустический комфорт</span>
        <EchoComfortRings
          before={echoBefore}
          after={echoAfter}
          compact
          hoverPlay={comfort.replayKey}
        />
      </article>
      <article className={styles.kpiCard} onMouseEnter={quieter.onMouseEnter}>
        <span className={styles.kpiLabel}>Тише на слух</span>
        <CountUpValue
          className={styles.kpiValue}
          value={quieterMax}
          prefix="≈"
          suffix={<em>%</em>}
          replayKey={quieter.replayKey}
        />
        <span className={styles.kpiPill}>
          воздух {quieterAir}% · удар {quieterImpact}%
        </span>
      </article>
    </section>
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
        <span
          className={styles.kpiBar}
          style={{ ['--bar-h' as string]: `${Math.max(18, bH)}%` }}
        />
        <span className={styles.kpiBarTip}>Сейчас · {beforeDb} дБ</span>
      </span>
      <span className={styles.kpiBarWrap}>
        <span
          className={`${styles.kpiBar} ${styles.kpiBarAfter} ${better ? styles.kpiBarBetter : ''}`}
          style={{ ['--bar-h' as string]: `${Math.max(18, aH)}%` }}
        />
        <span className={styles.kpiBarTip}>MultiFrame · {afterDb} дБ</span>
      </span>
    </div>
  );
}

/** Soft depth drift while scrolling — desktop only (skip touch / narrow). */
function useScrollDrift() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 900px)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        root.style.setProperty('--drift', `${Math.min(28, y * 0.035)}px`);
        root.style.setProperty('--drift-soft', `${Math.min(14, y * 0.018)}px`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return rootRef;
}

export function ResultWideScreen() {
  const { goBack } = useSession();
  const p = useResultProfile();
  const rootRef = useScrollDrift();
  const [hoverHz, setHoverHz] = useState<number | null>(null);
  const onHzHover = useCallback((hz: number | null) => {
    setHoverHz(hz);
  }, []);

  const deltaRw = Math.abs(Math.round(p.sim.delta.Rw));
  const deltaLnw = Math.abs(Math.round(p.sim.delta.Lnw));
  const quieterAir = p.sim.perceivedAirPct;
  const quieterImpact = p.sim.perceivedImpactPct;
  const quieterMax = Math.max(quieterAir, quieterImpact);
  const classNow = p.hybridBefore as ClassLabel;
  const classMf = p.hybridAfter as ClassLabel;

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
    <div className={styles.root} ref={rootRef}>
      <header className={styles.titleBar} data-reveal>
        <h1>Акустический профиль помещения</h1>
      </header>

      <section className={`${styles.objectSpec} ${styles.driftSlow}`} data-reveal aria-label="Объект">
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

      <KpiRow
        deltaRw={deltaRw}
        deltaLnw={deltaLnw}
        quieterAir={quieterAir}
        quieterImpact={quieterImpact}
        quieterMax={quieterMax}
        echoBefore={p.sim.reverb.echoInRoomBefore}
        echoAfter={p.sim.reverb.echoInRoomAfter}
        rwBefore={p.sim.before.Rw}
        rwAfter={p.sim.after.Rw}
        lnwBefore={p.sim.before.Lnw}
        lnwAfter={p.sim.after.Lnw}
      />

      <section className={`${styles.panel} ${styles.driftSoft}`} data-reveal aria-label="Нормы комфорта для жилья">
        <div className={styles.normsHead}>
          <h2>
            Нормы комфорта жилья{' '}
            <span className={styles.normsSp}>по СП 51.13330.2011</span>
          </h2>
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
              {NORM_ROWS.map((r) => {
                const isNow = r.key === classNow;
                const isMf = r.key === classMf;
                return (
                  <tr
                    key={r.key}
                    className={`${r.muted ? styles.normBelow : ''} ${isNow || isMf ? styles.normRowMarked : ''}`}
                  >
                    <td>
                      <span className={styles.normLevel}>
                        <span className={styles.normDots} aria-hidden>
                          {isNow ? <span className={`${styles.normDot} ${styles.normDotNow}`} /> : null}
                          {isMf ? <span className={`${styles.normDot} ${styles.normDotMf}`} /> : null}
                          {!isNow && !isMf ? (
                            <span className={`${styles.normDot} ${styles.normDotIdle}`} />
                          ) : null}
                        </span>
                        <span className={styles.normLevelLabel}>{r.label}</span>
                        {isNow ? <span className={styles.normPillNow}>Сейчас</span> : null}
                        {isMf ? <span className={styles.normPillMf}>MultiFrame</span> : null}
                      </span>
                    </td>
                    <td>
                      {r.rw} <em>дБ</em>
                    </td>
                    <td>
                      {r.lnw} <em>дБ</em>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`${styles.effectListen} ${styles.driftSlow}`} data-reveal aria-label="Эффективность и сравнение на слух">
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

      <section className={`${styles.charts} ${styles.driftSoft}`} data-reveal aria-label="Изоляция по частотам">
        <header className={styles.chartsHead}>
          <div>
            <h2>Изоляция по частотам</h2>
            <p className={styles.panelLead}>
              Чем выше линия, тем лучше перекрытие изолирует шум на этой частоте.
            </p>
          </div>
          <div className={styles.chartsLegend} aria-hidden>
            <span>
              <i className={styles.legNow} /> Сейчас
            </span>
            <span>
              <i className={styles.legAfter} /> MultiFrame
            </span>
          </div>
        </header>
        <div className={styles.chartsGrid}>
          <SpectrumChart
            tall
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

      <nav className={styles.footerActions} aria-label="Действия после расчёта">
        <button type="button" className={styles.footerBtn} onClick={goBack}>
          <span className={styles.footerBtnIcon} aria-hidden>
            ←
          </span>
          Назад
        </button>
        <button type="button" className={styles.footerBtnAccent} onClick={p.restart}>
          Пройти ещё раз
        </button>
      </nav>
    </div>
  );
}
