import { useDemoPlayer } from '../audio/useDemoPlayer';
import { buildRoomAudioShapeForPair } from '../audio/roomAudioShape';
import type { AudioPair, DerivedSimulation } from '../state/types';
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

const GROUPS: Array<AudioPair['group']> = ['air', 'impact', 'mixed'];
const GROUP_TITLES: Record<AudioPair['group'], string> = {
  air: 'Воздушный шум',
  impact: 'Ударный шум',
  mixed: 'Смешанный шум',
};

type Props = {
  pairs: AudioPair[];
  sim: DerivedSimulation;
};

export function CompactAudio({ pairs, sim }: Props) {
  const { activeId, progress, play, stop } = useDemoPlayer();

  return (
    <section className={styles.wrap} aria-label="Сравнить звук до и после">
      <header className={styles.head}>
        <h3>Послушайте «До» и «После»</h3>
        <p>
          Один и тот же звук, приведённый к уровню и спектру этой комнаты — до и после
          MultiFrame.
        </p>
      </header>

      <div className={styles.groups}>
        {GROUPS.map((group) => {
          const groupPairs = pairs.filter((p) => p.group === group);
          if (!groupPairs.length) return null;
          return (
            <div key={group} className={styles.group}>
              <strong className={styles.groupTitle}>{GROUP_TITLES[group]}</strong>

              <div className={styles.examples}>
                {groupPairs.map((pair) => {
                  const beforeId = `${pair.id}:before`;
                  const afterId = `${pair.id}:after`;
                  const beforeOn = activeId === beforeId;
                  const afterOn = activeId === afterId;
                  const shape = buildRoomAudioShapeForPair(sim, pair);
                  return (
                    <div key={pair.id} className={styles.example}>
                      <span className={styles.exampleLabel}>{pair.label}</span>
                      <div className={styles.controls}>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.before} ${
                            beforeOn ? styles.playing : ''
                          }`}
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
                                shape,
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
                          className={`${styles.btn} ${styles.after} ${
                            afterOn ? styles.playing : ''
                          }`}
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
                                shape,
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
      </div>
    </section>
  );
}
