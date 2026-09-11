import type { ComfortLevel, DerivedSimSide, DerivedSimulation } from '../state/types';
import { COMFORT_FEELING, DISCLAIMER_SIMULATION } from '../state/types';
import { airChip, classCyr, impactChip } from '../state/simulation';
import styles from './SimCompare.module.css';

interface Props {
  sim: DerivedSimulation;
  emphasize?: 'before' | 'after' | 'both';
  /** Quieter digits when emotion dual is primary (comparison screen). */
  tone?: 'primary' | 'secondary';
}

/** Effect heroes — air may say «вдвое»; impact never. */
const AIR_HERO = {
  lead: 'примерно вдвое спокойнее',
  sub: 'шум как будто дальше',
} as const;

const IMPACT_HERO = {
  lead: 'тише',
  sub: 'норму часто закрывает пол',
} as const;

function Feeling({ level }: { level: ComfortLevel }) {
  return <span className={`${styles.feeling} ${styles[level]}`}>{COMFORT_FEELING[level]}</span>;
}

function ClassPill({ side }: { side: DerivedSimSide }) {
  if (side.classStatus === 'partial') {
    return <span className={styles.statusPartial}>частично</span>;
  }
  if (side.classStatus === 'below' || side.classLabel === 'below') {
    return <span className={styles.statusBelow}>ниже класса</span>;
  }
  return <span className={styles.classPill}>класс {classCyr(side.classLabel)}</span>;
}

function MetricTertiary({
  label,
  value,
  delta,
}: {
  label: string;
  value: number;
  delta?: number;
}) {
  return (
    <p className={styles.metricTertiary}>
      <span className={styles.key}>{label}</span>
      <span className={styles.metricNums}>
        <strong>{value}</strong>
        <span className={styles.unit}>дБ</span>
        {delta != null ? (
          <span className={styles.delta}>
            {delta > 0 ? '+' : ''}
            {delta}
          </span>
        ) : null}
      </span>
    </p>
  );
}

function EffectBlock({
  channel,
  hero,
  metricLabel,
  value,
  delta,
  showHero,
}: {
  channel: string;
  hero: { lead: string; sub: string };
  metricLabel: string;
  value: number;
  delta?: number;
  showHero: boolean;
}) {
  return (
    <div className={styles.effectBlock}>
      <span className={styles.channel}>{channel}</span>
      {showHero ? (
        <div className={styles.hero}>
          <p className={styles.heroLead}>{hero.lead}</p>
          <p className={styles.heroSub}>{hero.sub}</p>
        </div>
      ) : null}
      <MetricTertiary label={metricLabel} value={value} delta={delta} />
    </div>
  );
}

function Column({
  title,
  side,
  feeling,
  delta,
  showEffectHero,
}: {
  title: string;
  side: DerivedSimSide;
  feeling: ComfortLevel;
  delta?: { Rw: number; Lnw: number };
  showEffectHero: boolean;
}) {
  const impact = impactChip(side);
  const showNote =
    side.classStatus === 'partial' || side.classStatus === 'below'
      ? side.label
      : null;

  return (
    <div className={styles.col}>
      <div className={styles.colHead}>
        <h3>{title}</h3>
        <div className={styles.headMeta}>
          <ClassPill side={side} />
          <Feeling level={feeling} />
        </div>
      </div>

      <div className={styles.effects}>
        <EffectBlock
          channel="Воздух"
          hero={AIR_HERO}
          metricLabel="воздух"
          value={side.Rw}
          delta={delta?.Rw}
          showHero={showEffectHero}
        />
        <EffectBlock
          channel="Удар"
          hero={IMPACT_HERO}
          metricLabel="удар"
          value={side.Lnw}
          delta={delta?.Lnw}
          showHero={showEffectHero}
        />
      </div>

      <div className={styles.chips}>
        <span className={styles.chip}>Воздух: {airChip(side)}</span>
        <span className={`${styles.chip} ${impact === 'вне нормы' ? styles.chipWarn : ''}`}>
          Удар: {impact}
        </span>
      </div>
      {showNote ? <p className={styles.partialNote}>{showNote}</p> : null}
    </div>
  );
}

export function SimCompare({ sim, emphasize = 'both', tone = 'primary' }: Props) {
  const [rwLo, rwHi] = sim.deltaRange.Rw;
  const [lnwLo, lnwHi] = sim.deltaRange.Lnw;
  const showAfter = emphasize !== 'before';
  const showBefore = emphasize !== 'after';

  return (
    <section
      className={`${styles.card} ${tone === 'secondary' ? styles.secondary : ''}`}
      aria-label={sim.uiLabel}
    >
      <header className={styles.head}>
        <span className={styles.badge}>{sim.uiLabel}</span>
      </header>

      <div className={styles.grid}>
        {showBefore ? (
          <Column
            title="Сейчас"
            side={sim.before}
            feeling={sim.feelingBefore}
            showEffectHero={false}
          />
        ) : null}
        {showAfter ? (
          <Column
            title="С MultiFrame"
            side={sim.after}
            feeling={sim.feelingAfter}
            delta={sim.delta}
            showEffectHero
          />
        ) : null}
      </div>

      <p className={styles.range}>
        ориентир Δ воздух +{rwLo}…+{rwHi} · удар −{lnwLo}…−{lnwHi}
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
