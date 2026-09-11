import { Screen } from '../../ui/Screen';
import { Badge } from '../../ui/Badge';
import { Disclaimer } from '../../ui/Disclaimer';
import { useSession } from '../../state/SessionContext';
import { useDemoPlayer } from '../../audio/useDemoPlayer';
import styles from './AudioDiffScreen.module.css';

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
              <button
                type="button"
                className={`${styles.play} ${styles.before} ${beforeOn ? styles.active : ''}`}
                onClick={() => {
                  if (beforeOn) stop();
                  else void play(beforeId, pair.beforeSrc);
                }}
              >
                <span className={styles.icon} aria-hidden>
                  {beforeOn ? '❚❚' : '▶'}
                </span>
                <span className={styles.meta}>
                  <strong>{pair.beforeLabel}</strong>
                  <small>До</small>
                </span>
                {beforeOn ? (
                  <span className={styles.bar} aria-hidden>
                    <span style={{ width: `${Math.round(progress * 100)}%` }} />
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className={`${styles.play} ${styles.after} ${afterOn ? styles.active : ''}`}
                onClick={() => {
                  if (afterOn) stop();
                  else void play(afterId, pair.afterSrc);
                }}
              >
                <span className={styles.icon} aria-hidden>
                  {afterOn ? '❚❚' : '▶'}
                </span>
                <span className={styles.meta}>
                  <strong>{pair.afterLabel}</strong>
                  <small>После</small>
                </span>
                {afterOn ? (
                  <span className={styles.bar} aria-hidden>
                    <span style={{ width: `${Math.round(progress * 100)}%` }} />
                  </span>
                ) : null}
              </button>
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
