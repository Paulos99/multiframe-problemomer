import { useEffect, useRef, useState } from 'react';
import { DEMO_STEM_URLS } from '../../audio/demoAudio';
import { preloadDemoAudio, unlockDemoAudio } from '../../audio/useDemoPlayer';
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
const EXIT_MS = 780;
const REDUCED_MS = 400;
const LINE_MS = TOTAL_MS / STATUS_LINES.length;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Soft ease-in-out so the bar never feels jerky. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function ProcessingScreen() {
  const { goTo } = useSession();
  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'enter' | 'run' | 'exit'>('enter');
  const finished = useRef(false);
  const exitTimer = useRef(0);

  const finish = (opts?: { unlock?: boolean }) => {
    if (finished.current) return;
    finished.current = true;
    if (opts?.unlock) unlockDemoAudio();
    setProgress(100);
    setPhase('exit');
    const delay = prefersReducedMotion() ? 0 : EXIT_MS;
    exitTimer.current = window.setTimeout(() => goTo('result'), delay);
  };

  useEffect(() => {
    void preloadDemoAudio(DEMO_STEM_URLS);
  }, []);

  useEffect(() => {
    const enterFrame = window.requestAnimationFrame(() => setPhase('run'));

    if (prefersReducedMotion()) {
      const t = window.setTimeout(() => finish(), REDUCED_MS);
      return () => {
        cancelAnimationFrame(enterFrame);
        window.clearTimeout(t);
        window.clearTimeout(exitTimer.current);
      };
    }

    const timers: number[] = [];
    for (let i = 1; i < STATUS_LINES.length; i++) {
      timers.push(window.setTimeout(() => setLineIndex(i), i * LINE_MS));
    }

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      if (finished.current) return;
      const raw = Math.min(1, (now - start) / TOTAL_MS);
      setProgress(easeInOutCubic(raw) * 100);
      if (raw < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(enterFrame);
      timers.forEach((id) => window.clearTimeout(id));
      cancelAnimationFrame(raf);
      window.clearTimeout(exitTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-once ceremony
  }, []);

  const status = STATUS_LINES[lineIndex] ?? STATUS_LINES[0]!;
  const overlayClass = [
    styles.overlay,
    phase === 'run' || phase === 'exit' ? styles.entered : '',
    phase === 'exit' ? styles.exiting : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={overlayClass} role="status" aria-busy={phase !== 'exit'} aria-live="polite">
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
          <span
            className={styles.fill}
            style={{ transform: `scaleX(${Math.max(0.02, progress / 100)})` }}
          />
        </div>
      </div>
      <button
        type="button"
        className={styles.skip}
        onClick={() => finish({ unlock: true })}
        disabled={phase === 'exit'}
      >
        Пропустить
      </button>
    </div>
  );
}
