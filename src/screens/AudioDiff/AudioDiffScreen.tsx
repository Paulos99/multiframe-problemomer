import { Screen } from '../../ui/Screen';
import { Badge } from '../../ui/Badge';
import { Disclaimer } from '../../ui/Disclaimer';
import { useSession } from '../../state/SessionContext';
import { useDemoPlayer } from '../../audio/useDemoPlayer';
import styles from './AudioDiffScreen.module.css';

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

function NowPlaying({ progress }: { progress: number }) {
  return (
    <>
      <span className={styles.nowPlaying} aria-live="polite">
        <span className={styles.eq} aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.nowPlayingText}>
          <strong>Играет</strong>
          <span>нажмите — пауза</span>
        </span>
      </span>
      <span className={styles.bar} aria-hidden>
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </span>
    </>
  );
}

type SideProps = {
  playing: boolean;
  progress: number;
  side: 'before' | 'after';
  title: string;
  subtitle: string;
  ariaLabel: string;
  onToggle: () => void;
};

function SideButton({
  playing,
  progress,
  side,
  title,
  subtitle,
  ariaLabel,
  onToggle,
}: SideProps) {
  return (
    <button
      type="button"
      className={`${styles.play} ${styles[side]} ${playing ? styles.playing : ''}`}
      aria-pressed={playing}
      aria-label={ariaLabel}
      onClick={onToggle}
    >
      <span className={`${styles.icon} ${playing ? styles.iconPlaying : ''}`}>
        <PlayIcon playing={playing} />
      </span>
      <span className={styles.meta}>
        <strong className={side === 'before' ? styles.loudLabel : styles.quietLabel}>
          {title}
        </strong>
        <small>{subtitle}</small>
        {playing ? <NowPlaying progress={progress} /> : null}
      </span>
    </button>
  );
}

export function AudioDiffScreen() {
  const { session } = useSession();
  const { activeId, progress, play, stop } = useDemoPlayer();
  const isDemo = session.audio.mode === 'demo_stub';
  const demoSet = session.audio.demoSet;

  return (
    <Screen
      title="Услышать разницу"
      subtitle="Сравните «до» и «после». Крупные кнопки — удобно на телефоне."
    >
      {isDemo ? (
        <p className={styles.contrastNote}>
          <Badge>демо, контраст усилен для показа</Badge>
          <span>«До» заметно громче, «После» — явно тише.</span>
        </p>
      ) : null}

      {demoSet ? (
        <p className={styles.demoSet}>
          <Badge>демо-набор</Badge>
          <span>Фиксированный набор примеров для выбранных сценариев.</span>
        </p>
      ) : null}

      {session.audio.pairs.map((pair) => {
        const beforeId = `${pair.id}:before`;
        const afterId = `${pair.id}:after`;
        const beforeOn = activeId === beforeId;
        const afterOn = activeId === afterId;
        return (
          <article key={pair.id} className={styles.pair}>
            <header className={styles.pairHead}>
              <h2>{pair.label}</h2>
              {isDemo ? <Badge>демо</Badge> : null}
            </header>
            <div className={styles.controls}>
              <SideButton
                side="before"
                playing={beforeOn}
                progress={progress}
                title="До — громко"
                subtitle={pair.beforeLabel}
                ariaLabel={
                  beforeOn
                    ? `Пауза: До — громко, ${pair.beforeLabel}`
                    : `Слушать До — громко: ${pair.beforeLabel}`
                }
                onToggle={() => {
                  if (beforeOn) stop();
                  else void play(beforeId, pair.beforeSrc);
                }}
              />
              <SideButton
                side="after"
                playing={afterOn}
                progress={progress}
                title="После — тише"
                subtitle={pair.afterLabel}
                ariaLabel={
                  afterOn
                    ? `Пауза: После — тише, ${pair.afterLabel}`
                    : `Слушать После — тише: ${pair.afterLabel}`
                }
                onToggle={() => {
                  if (afterOn) stop();
                  else void play(afterId, pair.afterSrc);
                }}
              />
            </div>
          </article>
        );
      })}

      <Disclaimer
        compact
        text="Аудио демонстрационное: иллюстрирует ощущение контраста, а не лабораторный замер."
      />
    </Screen>
  );
}
