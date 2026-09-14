import { useDemoPlayer } from '../audio/useDemoPlayer';
import { AUDIO_GROUP_LABELS } from '../audio/demoAudio';
import { LOG_DB_FOOTNOTE, type AudioPair, type DerivedSimulation } from '../state/types';
import styles from './CompactAudio.module.css';

function PlayIcon({ playing }: { playing: boolean }) {
  if (playing) {
    return (
      <span className={styles.pauseGlyph} aria-hidden>
        <i />
        <i />
      </span>
    );
  }
  return <span className={styles.playGlyph} aria-hidden />;
}

function reductionLine(group: AudioPair['group'], sim: DerivedSimulation): string {
  const airPct = sim.perceivedAirPct;
  const impactPct = sim.perceivedImpactPct;
  const airDb = Math.abs(sim.delta.Rw);
  const impactDb = Math.abs(sim.delta.Lnw);

  if (group === 'air') return `≈ −${airPct}% · −${airDb} дБ`;
  if (group === 'impact') return `≈ −${impactPct}% · −${impactDb} дБ`;
  const pct = Math.round((airPct + impactPct) / 2);
  const db = Math.round((airDb + impactDb) / 2);
  return `≈ −${pct}% · −${db} дБ`;
}

const GROUPS: Array<AudioPair['group']> = ['air', 'impact', 'mixed'];

type Props = {
  pairs: AudioPair[];
  sim: DerivedSimulation;
};

export function CompactAudio({ pairs, sim }: Props) {
  const { activeId, progress, playCompare, stop } = useDemoPlayer();

  return (
    <section className={styles.wrap} aria-label="Услышать разницу">
      <header className={styles.head}>
        <h2>Услышать разницу</h2>
        <p>Один пример на каждый вид шума — сначала «до», затем «после»</p>
      </header>

      <div className={styles.list}>
        {GROUPS.map((group) => {
          const pair = pairs.find((p) => p.group === group);
          if (!pair) return null;
          const meta = AUDIO_GROUP_LABELS[group];
          const playing = activeId === pair.id;
          return (
            <button
              key={pair.id}
              type="button"
              className={`${styles.row} ${playing ? styles.playing : ''}`}
              aria-pressed={playing}
              aria-label={
                playing
                  ? `Пауза: ${meta.title}, ${pair.label}`
                  : `Слушать до и после: ${meta.title}, ${pair.label}`
              }
              onClick={() => {
                if (playing) stop();
                else void playCompare(pair.id, pair.beforeSrc, pair.afterSrc);
              }}
            >
              <span className={styles.icon}>
                <PlayIcon playing={playing} />
              </span>
              <span className={styles.copy}>
                <strong>{meta.title}</strong>
                <span className={styles.example}>{pair.label}</span>
              </span>
              <span className={styles.reduction}>{reductionLine(group, sim)}</span>
              {playing ? (
                <span className={styles.bar} aria-hidden>
                  <span style={{ width: `${Math.round(progress * 100)}%` }} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className={styles.footnote}>{LOG_DB_FOOTNOTE}</p>
    </section>
  );
}
