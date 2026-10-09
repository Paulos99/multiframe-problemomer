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
  const highlight =
    highlightDb != null && highlightDb > 0
      ? Math.min(20, Math.max(1, Math.round(Math.abs(highlightDb))))
      : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <dialog
        className={styles.dialog}
        open
        aria-labelledby={titleId}
        onCancel={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <header className={styles.head}>
          <h2 id={titleId}>Разница уровней звукового давления</h2>
          <p>
            Процент «тише» в Проблемомере берётся из столбца «уменьшение звукового давления» по
            разнице в дБ между «сейчас» и «с MultiFrame».
          </p>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  Разница в уровнях
                  <br />
                  звукового давления, дБ
                </th>
                <th>
                  Уменьшение уровней
                  <br />
                  звукового давления в разах
                </th>
                <th>Уменьшение звукового давления</th>
                <th>Увеличение звукового давления</th>
                <th>
                  Увеличение уровней
                  <br />
                  звукового давления в разах
                </th>
              </tr>
            </thead>
            <tbody>
              {SOUND_PRESSURE_TABLE.map((row) => (
                <tr
                  key={row.db}
                  className={highlight === row.db ? styles.highlight : undefined}
                >
                  <td className={styles.colDb}>{row.db} дБ</td>
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

        <footer className={styles.foot}>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Закрыть
          </button>
        </footer>
      </dialog>
    </div>
  );
}
