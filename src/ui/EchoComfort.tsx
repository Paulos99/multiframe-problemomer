import { useEffect } from 'react';
import { preloadDemoAudio, useDemoPlayer } from '../audio/useDemoPlayer';
import { ECHO_CLAP_PAIR } from '../audio/demoAudio';
import { buildRoomAudioShapeForPair } from '../audio/roomAudioShape';
import type { DerivedSimulation } from '../state/types';
import styles from './EchoComfort.module.css';

type Props = {
  sim: DerivedSimulation;
  /** Wide dashboard: ring gauges instead of horizontal bars. */
  variant?: 'default' | 'dashboard';
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

function EchoRing({
  pct,
  label,
  accent,
}: {
  pct: number;
  label: string;
  accent?: boolean;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const dash = (clamped / 100) * c;
  return (
    <div className={`${styles.ring} ${accent ? styles.ringAccent : ''}`}>
      <svg viewBox="0 0 80 80" className={styles.ringSvg} aria-hidden>
        <circle className={styles.ringTrack} cx="40" cy="40" r={r} />
        <circle
          className={styles.ringValue}
          cx="40"
          cy="40"
          r={r}
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 40 40)"
        />
      </svg>
      <div className={styles.ringCenter}>
        <b>{pct}%</b>
        <span>{label}</span>
      </div>
    </div>
  );
}

export function EchoComfort({ sim, variant = 'default' }: Props) {
  const { activeId, progress, play, stop } = useDemoPlayer();
  const rev = sim.reverb;
  const pair = ECHO_CLAP_PAIR;
  const shape = buildRoomAudioShapeForPair(sim, pair);
  const beforeId = `${pair.id}:before`;
  const afterId = `${pair.id}:after`;
  const beforeOn = activeId === beforeId;
  const afterOn = activeId === afterId;
  const echoDrop = rev.echoInRoomBefore - rev.echoInRoomAfter;
  const dashboard = variant === 'dashboard';

  useEffect(() => {
    void preloadDemoAudio([pair.beforeSrc]);
  }, [pair.beforeSrc]);

  return (
    <section
      className={`${styles.wrap} ${dashboard ? styles.wrapDash : ''}`}
      aria-label="Эхо в комнате (акустический комфорт)"
    >
      <header className={styles.head}>
        <h3>Эхо в комнате (акустический комфорт)</h3>
        <p>
          MultiFrame — не только изоляция сверху. Перфорация гасит эхо в самой комнате.
        </p>
      </header>

      {dashboard ? (
        <div
          className={styles.rings}
          role="img"
          aria-label={`Эхо в помещении: сейчас ${rev.echoInRoomBefore}%, с MultiFrame ${rev.echoInRoomAfter}%. Меньше — лучше.`}
        >
          <EchoRing pct={rev.echoInRoomBefore} label="Сейчас" />
          <EchoRing pct={rev.echoInRoomAfter} label="После" accent />
          {echoDrop > 0 ? (
            <p className={styles.scaleDelta}>≈ на {echoDrop}% меньше эха в помещении</p>
          ) : null}
        </div>
      ) : (
        <div
          className={styles.scale}
          role="img"
          aria-label={`Эхо в помещении: сейчас ${rev.echoInRoomBefore}%, с MultiFrame ${rev.echoInRoomAfter}%. Меньше — лучше.`}
        >
          <p className={styles.scaleCaption}>
            Порхающее эхо в комнате · чем меньше процент, тем суше звук
          </p>
          <div className={styles.scaleRow}>
            <span className={styles.scaleLabel}>Сейчас</span>
            <div className={styles.track}>
              <span className={styles.fillBefore} style={{ width: `${rev.echoInRoomBefore}%` }} />
            </div>
            <b className={styles.pct}>{rev.echoInRoomBefore}%</b>
          </div>
          <div className={styles.scaleRow}>
            <span className={styles.scaleLabel}>С MultiFrame</span>
            <div className={styles.track}>
              <span className={styles.fillAfter} style={{ width: `${rev.echoInRoomAfter}%` }} />
            </div>
            <b className={styles.pctMf}>{rev.echoInRoomAfter}%</b>
          </div>
          {echoDrop > 0 ? (
            <p className={styles.scaleDelta}>≈ на {echoDrop}% меньше эха в помещении</p>
          ) : null}
        </div>
      )}

      <div className={styles.player}>
        <strong className={styles.playerTitle}>{pair.label}</strong>
        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.btn} ${styles.before} ${beforeOn ? styles.playing : ''} ${dashboard ? styles.btnChip : ''}`}
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
            className={`${styles.btn} ${styles.after} ${afterOn ? styles.playing : ''} ${dashboard ? styles.btnChip : ''}`}
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
