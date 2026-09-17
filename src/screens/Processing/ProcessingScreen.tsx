import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../ui/Button';
import { useSession } from '../../state/SessionContext';
import {
  HOUSE_TYPE_OPTIONS,
  ROOM_TYPE_LABELS,
  SLAB_THICKNESS_OPTIONS,
  SLAB_TYPE_OPTIONS,
} from '../../state/types';
import styles from './ProcessingScreen.module.css';

const STEPS = [
  { id: 'model', label: 'Собираем модель помещения', at: 0 },
  { id: 'noise', label: 'Оцениваем шум сверху сейчас', at: 1400 },
  { id: 'multiframe', label: 'Считаем эффект MultiFrame', at: 3200 },
  { id: 'profile', label: 'Собираем профиль комфорта', at: 5000 },
] as const;

const TOTAL_MS = 6200;
const REDUCED_MS = 400;

const BEFORE_BARS = [0.55, 0.78, 0.42, 0.92, 0.68, 0.5, 0.85, 0.6];
const AFTER_BARS = [0.28, 0.36, 0.22, 0.4, 0.32, 0.24, 0.38, 0.3];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function optionLabel<T extends string>(
  options: { id: T; label: string }[],
  id: T,
): string {
  return options.find((o) => o.id === id)?.label ?? id;
}

export function ProcessingScreen() {
  const { session, goTo } = useSession();
  const room = session.answers.room;
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const finished = useRef(false);

  const loudNeighbors =
    room.noisyNeighbors === 'often_noisy' ||
    room.noisyNeighbors === 'sometimes_noisy';

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    goTo('result');
  };

  const chips = useMemo(() => {
    const list: string[] = [];
    list.push(optionLabel(HOUSE_TYPE_OPTIONS, room.houseType));
    list.push(optionLabel(SLAB_TYPE_OPTIONS, room.slabType));
    list.push(optionLabel(SLAB_THICKNESS_OPTIONS, room.slabThickness));
    if (room.roomType) list.push(ROOM_TYPE_LABELS[room.roomType]);
    if (room.ceilingAreaM2 != null && room.ceilingAreaM2 > 0) {
      list.push(`${room.ceilingAreaM2} м²`);
    }
    return list;
  }, [room]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const t = window.setTimeout(finish, REDUCED_MS);
      return () => window.clearTimeout(t);
    }

    const timers: number[] = [];
    STEPS.forEach((step, i) => {
      if (i === 0) return;
      timers.push(window.setTimeout(() => setPhase(i), step.at));
    });

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / TOTAL_MS);
      setProgress(Math.round(p * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
        timers.push(window.setTimeout(finish, 280));
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-once ceremony
  }, []);

  const stageClass =
    phase >= 3
      ? styles.stageProfile
      : phase >= 2
        ? styles.stageMf
        : phase >= 1
          ? styles.stageNoise
          : styles.stageModel;

  return (
    <section className={styles.screen} aria-busy={!done} aria-live="polite">
      <div className={`${styles.card} ${stageClass}`}>
        <div className={styles.scan} aria-hidden />
        <div className={styles.rings} aria-hidden>
          <span className={styles.ring} />
          <span className={`${styles.ring} ${styles.ringMid}`} />
          <span className={`${styles.ring} ${styles.ringOuter}`} />
        </div>

        <header className={styles.head}>
          <p className={styles.eyebrow}>Расчёт</p>
          <h1 className={styles.title}>Считаем акустический профиль</h1>
          <p className={styles.lead}>
            Собираем модель вашей комнаты — как слышно сейчас и как станет с MultiFrame.
          </p>
        </header>

        <div className={styles.eqRow} aria-hidden>
          <div className={`${styles.eqPanel} ${styles.eqBefore}`}>
            <span className={styles.eqLabel}>Сейчас</span>
            <div
              className={`${styles.bars} ${loudNeighbors ? styles.barsLoud : ''}`}
            >
              {BEFORE_BARS.map((h, i) => (
                <span
                  key={`b-${i}`}
                  className={styles.bar}
                  style={{ ['--h' as string]: String(h), ['--i' as string]: String(i) }}
                />
              ))}
            </div>
          </div>
          <div className={`${styles.eqPanel} ${styles.eqAfter}`}>
            <span className={styles.eqLabel}>С MultiFrame</span>
            <div className={styles.layers}>
              <span className={styles.layer} />
              <span className={styles.layer} />
              <span className={styles.layer} />
            </div>
            <div className={styles.bars}>
              {AFTER_BARS.map((h, i) => (
                <span
                  key={`a-${i}`}
                  className={styles.bar}
                  style={{ ['--h' as string]: String(h), ['--i' as string]: String(i) }}
                />
              ))}
            </div>
          </div>
        </div>

        <ul className={styles.chips} aria-label="Параметры комнаты">
          {chips.map((chip, i) => (
            <li
              key={chip}
              className={styles.chip}
              style={{ ['--i' as string]: String(i) }}
            >
              {chip}
            </li>
          ))}
        </ul>

        <ol className={styles.checklist}>
          {STEPS.map((step, i) => {
            const active = phase === i && !done;
            const complete = phase > i || done;
            return (
              <li
                key={step.id}
                className={`${styles.checkItem} ${active ? styles.checkActive : ''} ${complete ? styles.checkDone : ''}`}
              >
                <span className={styles.checkMark} aria-hidden>
                  {complete ? '✓' : ''}
                </span>
                <span>{step.label}</span>
              </li>
            );
          })}
        </ol>

        <div className={styles.progressWrap}>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Прогресс расчёта"
          >
            <span className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={styles.status}>
            {done ? 'Профиль готов' : STEPS[phase]?.label}
          </p>
        </div>

        <p className={styles.honesty}>
          Ориентир по модели комнаты, не лабораторный замер.
        </p>

        <div className={styles.skip}>
          <Button variant="ghost" onClick={finish}>
            Пропустить
          </Button>
        </div>
      </div>
    </section>
  );
}
