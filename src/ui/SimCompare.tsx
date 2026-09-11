import type { ComfortLevel, SimulationEstimate, SimulationSide } from '../state/types';
import { COMFORT_FEELING, DISCLAIMER_SIMULATION } from '../state/types';
import styles from './SimCompare.module.css';

interface Props {
  sim: SimulationEstimate;
  emphasize?: 'before' | 'after' | 'both';
}

function airLabel(side: SimulationSide): string {
  return side.airClass === 'below' ? 'вне нормы' : side.airClass;
}

function impactLabel(side: SimulationSide): string {
  // Design: «вне нормы» ONLY when Lnw > 60
  if (side.impactOutOfNorm) return 'вне нормы';
  return side.impactClass === 'below' ? 'вне нормы' : side.impactClass;
}

function Feeling({ level }: { level: ComfortLevel }) {
  return <span className={`${styles.feeling} ${styles[level]}`}>{COMFORT_FEELING[level]}</span>;
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
        <Feeling level={feeling} />
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
        <span className={`${styles.chip} ${side.impactOutOfNorm ? styles.chipWarn : ''}`}>
          Удар: {impactLabel(side)}
        </span>
      </div>
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
