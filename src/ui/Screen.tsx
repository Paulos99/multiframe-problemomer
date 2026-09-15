import styles from './Screen.module.css';
import type { ReactNode } from 'react';

export function Screen({
  title,
  subtitle,
  children,
  hero,
  stickyHead,
  dense,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  hero?: boolean;
  /** Keep question header visible while scrolling options (mobile input steps) */
  stickyHead?: boolean;
  /** Tighter vertical rhythm (Result evidence pack) */
  dense?: boolean;
}) {
  return (
    <section
      className={`${styles.screen} ${hero ? styles.hero : ''} ${dense ? styles.dense : ''}`}
    >
      {title ? (
        <header className={`${styles.head} ${stickyHead ? styles.headSticky : ''}`}>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
