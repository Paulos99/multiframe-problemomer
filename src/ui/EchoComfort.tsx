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
  const deltaComfort = rev.comfortAfter - rev.comfortBefore;

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

      <div
        className={styles.comfortBlock}
        role="img"
        aria-label={`Комфорт от эха: сейчас ${rev.comfortBefore}%, с MultiFrame ${rev.comfortAfter}%. Выше — меньше порхания.`}
      >
        <div className={styles.comfortHead}>
          <span className={styles.comfortKicker}>Комфорт от эха в комнате</span>
          <p className={styles.comfortHint}>
            Не громкость эха — насколько спокойно звучит помещение. Чем выше, тем меньше гулкости и
            порхания.
          </p>
        </div>

        <p className={styles.comfortJump}>
          <span className={styles.comfortNow}>{rev.comfortBefore}%</span>
          <span className={styles.comfortArrow} aria-hidden>
            →
          </span>
          <span className={styles.comfortMf}>{rev.comfortAfter}%</span>
          {deltaComfort > 0 ? (
            <span className={styles.comfortDelta}>+{deltaComfort} к комфорту</span>
          ) : null}
        </p>

        <div className={styles.rangeTrack} aria-hidden>
          <span className={styles.rangeAxis} />
          <span
            className={styles.rangeMarkBefore}
            style={{ left: `${rev.comfortBefore}%` }}
            title={`Сейчас: ${rev.comfortBefore}%`}
          />
          <span
            className={styles.rangeMarkAfter}
            style={{ left: `${rev.comfortAfter}%` }}
            title={`С MultiFrame: ${rev.comfortAfter}%`}
          />
          {deltaComfort > 0 ? (
            <span
              className={styles.rangeSpan}
              style={{
                left: `${rev.comfortBefore}%`,
                width: `${deltaComfort}%`,
              }}
            />
          ) : null}
        </div>

        <div className={styles.rangeLegend}>
          <span>
            <i className={styles.dotBefore} aria-hidden /> Сейчас · {rev.comfortBefore}%
          </span>
          <span>
            <i className={styles.dotAfter} aria-hidden /> С MultiFrame · {rev.comfortAfter}%
          </span>
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
