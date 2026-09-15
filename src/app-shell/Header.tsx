import { useEffect, useState } from 'react';
import styles from './Header.module.css';

const BASE = import.meta.env.BASE_URL;

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="currentColor"
        d="M16.5 3.2a8.8 8.8 0 1 0 4.3 15.1 7.2 7.2 0 0 1-9-9.7 7.4 7.4 0 0 1 4.7-5.4Z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 3.2v2.2M12 18.6v2.2M3.2 12h2.2M18.6 12h2.2M5.7 5.7l1.6 1.6M16.7 16.7l1.6 1.6M5.7 18.3l1.6-1.6M16.7 7.3l1.6-1.6" />
      </g>
    </svg>
  );
}

export function Header() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('theme-dark', dark);
  }, [dark]);

  return (
    <header className={`${styles.header} ${dark ? styles.dark : ''}`}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img
            className={styles.stp}
            src={`${BASE}logo-stp.png`}
            alt="StP"
            width={40}
            height={40}
          />
          <img
            className={styles.mf}
            src={`${BASE}logo-multiframe.png`}
            alt="MultiFRAME"
            height={28}
          />
          <span className={styles.product}>Проблемомер</span>
        </div>
        <button
          type="button"
          className={styles.theme}
          onClick={() => setDark((v) => !v)}
          aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
          title={dark ? 'Светлая тема' : 'Тёмная тема'}
        >
          <span className={styles.themeIcon}>{dark ? <SunIcon /> : <MoonIcon />}</span>
        </button>
      </div>
    </header>
  );
}
