import { useEffect, useRef, useState } from 'react';
import { useSession } from '../../state/SessionContext';
import styles from './ProcessingScreen.module.css';

const STATUS_LINES = [
  'Собираем модель вашего помещения',
  'Считываем перекрытие и тип дома',
  'Оцениваем, как слышно сверху сейчас',
  'Считаем эффект MultiFrame',
  'Собираем акустический профиль',
  'Почти готово…',
] as const;

const TOTAL_MS = 7000;
const REDUCED_MS = 400;
/** Crossfade every status; last line holds until finish */
const LINE_MS = TOTAL_MS / STATUS_LINES.length;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function ProcessingScreen() {
  const { goTo } = useSession();
  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [entered, setEntered] = useState(false);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    goTo('result');
  };

  useEffect(() => {
    const enter = window.requestAnimationFrame(() => setEntered(true));

    if (prefersReducedMotion()) {
      const t = window.setTimeout(finish, REDUCED_MS);
      return () => {
        cancelAnimationFrame(enter);
        window.clearTimeout(t);
      };
    }

    const timers: number[] = [];
    for (let i = 1; i < STATUS_LINES.length; i++) {
      timers.push(window.setTimeout(() => setLineIndex(i), i * LINE_MS));
    }

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / TOTAL_MS);
      setProgress(p * 100);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        timers.push(window.setTimeout(finish, 220));
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(enter);
      timers.forEach((id) => window.clearTimeout(id));
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-once ceremony
  }, []);

  const status = STATUS_LINES[lineIndex] ?? STATUS_LINES[0]!;

  return (
    <div
      className={`${styles.overlay} ${entered ? styles.entered : ''}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className={styles.glow} aria-hidden />
      <div className={styles.center}>
        <p key={lineIndex} className={styles.status}>
          {status}
        </p>
        <div
          className={styles.bar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Прогресс расчёта"
        >
          <span className={styles.fill} style={{ width: `${progress}%` }} />
        </div>
      </div>
      <button type="button" className={styles.skip} onClick={finish}>
        Пропустить
      </button>
    </div>
  );
}
