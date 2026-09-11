import type { ComfortLevel, SimulationEstimate, SimulationSide } from '../state/types';
import { COMFORT_FEELING, DISCLAIMER_SIMULATION } from '../state/types';
import { impactChipLabel } from '../state/simulation';
import styles from './SimCompare.module.css';

interface Props {
  sim: SimulationEstimate;
  emphasize?: 'before' | 'after' | 'both';
}

function airLabel(side: SimulationSide): string {
  return side.airClass === 'below' ? 'вне нормы' : side.airClass;
}

function Feeling({ level }: { level: ComfortLevel }) {
  return <span className={`${styles.feeling} ${styles[level]}`}>{COMFORT_FEELING[level]}</span>;
}

function StatusPill({ side }: { side: SimulationSide }) {
  if (side.status === 'partial') {
    return <span className={styles.statusPartial}>частично</span>;
  }
  if (side.status === 'below') {
    return <span className={styles.statusBelow}>ниже базы</span>;
  }
  return null;
}

function Column({
  title,
  side,
  feeling,
  delta,
}: {
  title: string;
  side: SimulationSide;
  feeling: ComfortLevel;
  delta?: { Rw: number; Lnw: number };
}) {
  return (
    <div className={styles.col}>
      <div className={styles.colHead}>
        <h3>{title}</h3>
        <div className={styles.headMeta}>
          <StatusPill side={side} />
          <Feeling level={feeling} />
        </div>
      </div>
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.key}>Rw</span>
          <strong>{side.Rw}</strong>
          <span className={styles.unit}>дБ</span>
          {delta ? (
            <span className={styles.delta}>
              {delta.Rw > 0 ? '+' : ''}
              {delta.Rw}
            </span>
          ) : null}
        </div>
        <div className={styles.metric}>
          <span className={styles.key}>Lnw</span>
          <strong>{side.Lnw}</strong>
          <span className={styles.unit}>дБ</span>
          {delta ? (
            <span className={styles.delta}>
              {delta.Lnw > 0 ? '+' : ''}
              {delta.Lnw}
            </span>
          ) : null}
        </div>
      </div>
      <div className={styles.chips}>
        <span className={styles.chip}>Воздух: {airLabel(side)}</span>
        <span className={`${styles.chip} ${side.impactOutOfNorm || side.ceilingOnly ? styles.chipWarn : ''}`}>
          Удар: {impactChipLabel(side)}
        </span>
      </div>
      {side.status === 'partial' ? (
        <p className={styles.partialNote}>
          {side.ceilingOnly
            ? 'Rw лучше, Lnw потолком не нормируется — пол у соседа сверху часто нужен.'
            : 'Rw тянет на класс, Lnw ещё нет — ударный путь через плиту/соседа.'}
        </p>
      ) : null}
    </div>
  );
}

export function SimCompare({ sim, emphasize = 'both' }: Props) {
  const [rwLo, rwHi] = sim.deltaRange.Rw;
  const [lnwLo, lnwHi] = sim.deltaRange.Lnw;

  return (
    <section className={styles.card} aria-label={sim.uiLabel}>
      <header className={styles.head}>
        <span className={styles.badge}>{sim.uiLabel}</span>
      </header>

      <div className={styles.grid}>
        {emphasize !== 'after' ? (
          <Column title="Сейчас" side={sim.before} feeling={sim.feelingBefore} />
        ) : null}
        {emphasize !== 'before' ? (
          <Column
            title="С MultiFrame"
            side={sim.after}
            feeling={sim.feelingAfter}
            delta={sim.delta}
          />
        ) : null}
      </div>

      <p className={styles.range}>
        ΔRw +{rwLo}…+{rwHi} · ΔLnw −{lnwLo}…−{lnwHi}
        <span className={styles.rangeMeta}>
          {' '}
          · {sim.source} · {sim.disclaimer}
        </span>
      </p>

      <ul className={styles.lines}>
        {sim.honestLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <aside className={styles.ibox} role="note">
        <span className={styles.imark} aria-hidden>
          i
        </span>
        <p>{DISCLAIMER_SIMULATION}</p>
      </aside>
    </section>
  );
}
