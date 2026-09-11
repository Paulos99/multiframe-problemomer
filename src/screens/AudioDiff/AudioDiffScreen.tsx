import { Screen } from '../../ui/Screen';
import { Badge } from '../../ui/Badge';
import { Disclaimer } from '../../ui/Disclaimer';
import { useSession } from '../../state/SessionContext';
import { useDemoPlayer } from '../../audio/useDemoPlayer';
import styles from './AudioDiffScreen.module.css';

export function AudioDiffScreen() {
  const { session } = useSession();
  const { activeId, play, stop } = useDemoPlayer();
  const isDemo = session.audio.mode === 'demo_stub';

  return (
    <Screen
      title="Услышать разницу"
      subtitle="Сравните ощущение «до» и «после». Крупные кнопки — удобно на телефоне."
    >
      {session.audio.pairs.map((pair) => (
        <article key={pair.id} className={styles.pair}>
          <header className={styles.pairHead}>
            <h2>{pair.label}</h2>
            {isDemo ? <Badge>демо</Badge> : null}
          </header>
          <div className={styles.controls}>
            <button
              type="button"
              className={`${styles.play} ${styles.before} ${
                activeId === `${pair.id}:before` ? styles.active : ''
              }`}
              onClick={() => {
                if (activeId === `${pair.id}:before`) stop();
                else void play(`${pair.id}:before`, pair.beforeSrc);
              }}
            >
              <span className={styles.icon} aria-hidden>
                ▶
              </span>
              <span className={styles.meta}>
                <strong>{pair.beforeLabel}</strong>
                <small>До</small>
              </span>
            </button>
            <button
              type="button"
              className={`${styles.play} ${styles.after} ${
                activeId === `${pair.id}:after` ? styles.active : ''
              }`}
              onClick={() => {
                if (activeId === `${pair.id}:after`) stop();
                else void play(`${pair.id}:after`, pair.afterSrc);
              }}
            >
              <span className={styles.icon} aria-hidden>
                ▶
              </span>
              <span className={styles.meta}>
                <strong>{pair.afterLabel}</strong>
                <small>После</small>
              </span>
            </button>
          </div>
        </article>
      ))}

      <Disclaimer
        compact
        text="Аудио демонстрационное: иллюстрирует ощущение контраста, а не лабораторный замер."
      />
    </Screen>
  );
}
