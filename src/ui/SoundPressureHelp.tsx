import { useEffect, useId, useRef, useState } from 'react';
import {
  formatTimesRu,
  SOUND_PRESSURE_TABLE,
} from '../state/acoustic/soundPressureTable';
import styles from './SoundPressureHelp.module.css';

type ButtonProps = {
  /** Подсветить строку таблицы (округление до целого дБ). */
  highlightDb?: number;
  /** Для screen readers. */
  label?: string;
  className?: string;
};

export function SoundPressureHelpButton({
  highlightDb,
  label = 'Таблица: разница уровней звукового давления',
  className,
}: ButtonProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`${styles.helpBtn} ${className ?? ''}`}
        aria-label={label}
        onClick={() => setOpen(true)}
      >
        ?
      </button>
      {open ? (
        <SoundPressureHelpDialog
          highlightDb={highlightDb}
          onClose={() => {
            setOpen(false);
            btnRef.current?.focus();
          }}
        />
      ) : null}
    </>
  );
}

type DialogProps = {
  highlightDb?: number;
  onClose: () => void;
};

function SoundPressureHelpDialog({ highlightDb, onClose }: DialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const highlight =
    highlightDb != null && highlightDb > 0
      ? Math.min(20, Math.max(1, Math.round(Math.abs(highlightDb))))
      : null;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (highlight == null) return;
    const row = document.getElementById(`sp-row-${highlight}`);
    row?.scrollIntoView({ block: 'nearest' });
  }, [highlight]);

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.head}>
          <div className={styles.headText}>
            <h2 id={titleId}>Разница уровней звукового давления</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.closeX}
            aria-label="Закрыть"
            onClick={onClose}
          >
            <span aria-hidden>×</span>
          </button>
        </header>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">
                  Разница
                  <span>дБ</span>
                </th>
                <th scope="col">
                  Уменьшение
                  <span>в разах</span>
                </th>
                <th scope="col">
                  Уменьшение
                  <span>%</span>
                </th>
                <th scope="col">
                  Увеличение
                  <span>%</span>
                </th>
                <th scope="col">
                  Увеличение
                  <span>в разах</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {SOUND_PRESSURE_TABLE.map((row) => (
                <tr
                  key={row.db}
                  id={`sp-row-${row.db}`}
                  className={highlight === row.db ? styles.highlight : undefined}
                >
                  <td className={styles.colDb}>{row.db}</td>
                  <td className={styles.colDec}>{formatTimesRu(row.decreaseTimes)}</td>
                  <td>
                    <span className={styles.pillDec}>{row.decreasePct}%</span>
                  </td>
                  <td>
                    <span className={styles.pillInc}>{row.increasePct}%</span>
                  </td>
                  <td className={styles.colInc}>{formatTimesRu(row.increaseTimes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.footnote}>
          дБ — логарифмическая величина: шаг в дБ не равен шагу в процентах. Например, −2 дБ — это
          уже ≈21% тише, а не 2%.
        </p>
      </div>
    </div>
  );
}
