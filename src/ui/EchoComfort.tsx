import { useEffect } from 'react';
import { preloadDemoAudio, useDemoPlayer } from '../audio/useDemoPlayer';
import { ECHO_CLAP_PAIR } from '../audio/demoAudio';
import { buildRoomAudioShapeForPair } from '../audio/roomAudioShape';
import type { DerivedSimulation } from '../state/types';
import styles from './EchoComfort.module.css';

type Props = {
  sim: DerivedSimulation;
};

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

export function EchoComfort({ sim }: Props) {
  const { activeId, progress, play, stop } = useDemoPlayer();
  const rev = sim.reverb;
  const pair = ECHO_CLAP_PAIR;
  const shape = buildRoomAudioShapeForPair(sim, pair);
  const beforeId = `${pair.id}:before`;
  const afterId = `${pair.id}:after`;
  const beforeOn = activeId === beforeId;
  const afterOn = activeId === afterId;

  useEffect(() => {
    void preloadDemoAudio([pair.beforeSrc]);
  }, [pair.beforeSrc]);

  return (
    <section className={styles.wrap} aria-label="Эхо в самой комнате">
      <header className={styles.head}>
        <h3>Эхо в самой комнате</h3>
        <p>
          MultiFrame — не только изоляция сверху. Перфорация снимает порхающее эхо в помещении.
        </p>
      </header>

      <div className={styles.scale} role="img" aria-label={`Комфорт от эха: сейчас ${rev.comfortBefore}%, с MultiFrame ${rev.comfortAfter}%`}>
        <div className={styles.scaleRow}>
          <span className={styles.scaleLabel}>Сейчас</span>
          <div className={styles.track}>
            <span className={styles.fillBefore} style={{ width: `${rev.comfortBefore}%` }} />
          </div>
          <b className={styles.pct}>{rev.comfortBefore}%</b>
        </div>
        <div className={styles.scaleRow}>
          <span className={styles.scaleLabel}>С MultiFrame</span>
          <div className={styles.track}>
            <span className={styles.fillAfter} style={{ width: `${rev.comfortAfter}%` }} />
          </div>
          <b className={styles.pctMf}>{rev.comfortAfter}%</b>
        </div>
      </div>

      <div className={styles.player}>
        <strong className={styles.playerTitle}>{pair.label}</strong>
        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.btn} ${styles.before} ${beforeOn ? styles.playing : ''}`}
            aria-pressed={beforeOn}
            aria-label={beforeOn ? `Пауза: До, ${pair.label}` : `Слушать До: ${pair.label}`}
            onClick={() => {
              if (beforeOn) stop();
              else
                void play(beforeId, pair.beforeSrc, {
                  side: 'before',
                  group: 'echo',
                  shape,
                });
            }}
          >
            <span className={styles.icon}>
              <PlayIcon playing={beforeOn} />
            </span>
            <span className={styles.meta}>
              <strong>До</strong>
              <small>с эхом</small>
              {beforeOn ? (
                <span className={styles.bar} aria-hidden>
                  <span style={{ width: `${Math.round(progress * 100)}%` }} />
                </span>
              ) : null}
            </span>
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.after} ${afterOn ? styles.playing : ''}`}
            aria-pressed={afterOn}
            aria-label={afterOn ? `Пауза: После, ${pair.label}` : `Слушать После: ${pair.label}`}
            onClick={() => {
              if (afterOn) stop();
              else
                void play(afterId, pair.afterSrc, {
                  side: 'after',
                  group: 'echo',
                  shape,
                });
            }}
          >
            <span className={styles.icon}>
              <PlayIcon playing={afterOn} />
            </span>
            <span className={styles.meta}>
              <strong>После</strong>
              <small>меньше эха</small>
              {afterOn ? (
                <span className={styles.bar} aria-hidden>
                  <span style={{ width: `${Math.round(progress * 100)}%` }} />
                </span>
              ) : null}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
