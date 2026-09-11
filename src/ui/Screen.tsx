import styles from './Screen.module.css';
import type { ReactNode } from 'react';

export function Screen({
  title,
  subtitle,
  children,
  hero,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  hero?: boolean;
}) {
  return (
    <section className={`${styles.screen} ${hero ? styles.hero : ''}`}>
      {title ? (
        <header className={styles.head}>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
