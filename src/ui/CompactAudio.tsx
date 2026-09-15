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

  if (group === 'air') return `≈ на ${airPct}% тише`;
  if (group === 'impact') return `≈ на ${impactPct}% тише`;
  const pct = Math.round((airPct + impactPct) / 2);
  return `≈ на ${pct}% тише`;
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
                          else
                            void play(beforeId, pair.beforeSrc, {
                              side: 'before',
                              group: pair.group,
                              deltaRw: sim.delta.Rw,
                              deltaLnw: Math.abs(sim.delta.Lnw),
                            });
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
                          else
                            void play(afterId, pair.afterSrc, {
                              side: 'after',
                              group: pair.group,
                              deltaRw: sim.delta.Rw,
                              deltaLnw: Math.abs(sim.delta.Lnw),
                            });
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
      <p className={styles.disclaimer}>
        Аудио — иллюстрация эффекта модели для этой комнаты, не лабораторный замер.
        Срезаются громкость и частоты по ориентиру MultiFrame.
      </p>
    </section>
  );
}
