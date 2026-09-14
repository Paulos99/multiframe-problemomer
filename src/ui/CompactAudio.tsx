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
  const { activeId, progress, play, stop } = useDemoPlayer();

  return (
    <section className={styles.wrap} aria-label="Услышать разницу">
      <header className={styles.head}>
        <div>
          <h2>Услышать разницу</h2>
          <p>До и после — ориентир для вашей комнаты</p>
        </div>
      </header>

      {GROUPS.map((group) => {
        const groupPairs = pairs.filter((p) => p.group === group);
        if (!groupPairs.length) return null;
        const meta = AUDIO_GROUP_LABELS[group];
        return (
          <div key={group} className={styles.group}>
            <div className={styles.groupHead}>
              <strong>{meta.title}</strong>
              <span className={styles.reduction}>{reductionLine(group, sim)}</span>
            </div>

            <div className={styles.examples}>
              {groupPairs.map((pair) => {
                const beforeId = `${pair.id}:before`;
                const afterId = `${pair.id}:after`;
                const beforeOn = activeId === beforeId;
                const afterOn = activeId === afterId;
                return (
                  <div key={pair.id} className={styles.example}>
                    <span className={styles.exampleLabel}>{pair.label}</span>
                    <div className={styles.controls}>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.before} ${beforeOn ? styles.playing : ''}`}
                        aria-pressed={beforeOn}
                        aria-label={
                          beforeOn ? `Пауза: До, ${pair.label}` : `Слушать До: ${pair.label}`
                        }
                        onClick={() => {
                          if (beforeOn) stop();
                          else void play(beforeId, pair.beforeSrc);
                        }}
                      >
                        <PlayIcon playing={beforeOn} />
                        <span>До</span>
                        {beforeOn ? (
                          <span className={styles.bar} aria-hidden>
                            <span style={{ width: `${Math.round(progress * 100)}%` }} />
                          </span>
                        ) : null}
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.after} ${afterOn ? styles.playing : ''}`}
                        aria-pressed={afterOn}
                        aria-label={
                          afterOn
                            ? `Пауза: После, ${pair.label}`
                            : `Слушать После: ${pair.label}`
                        }
                        onClick={() => {
                          if (afterOn) stop();
                          else void play(afterId, pair.afterSrc);
                        }}
                      >
                        <PlayIcon playing={afterOn} />
                        <span>После</span>
                        {afterOn ? (
                          <span className={styles.bar} aria-hidden>
                            <span style={{ width: `${Math.round(progress * 100)}%` }} />
                          </span>
                        ) : null}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className={styles.footnote}>{LOG_DB_FOOTNOTE}</p>
    </section>
  );
}
