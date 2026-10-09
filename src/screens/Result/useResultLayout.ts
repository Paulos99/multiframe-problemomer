import { useEffect, useState } from 'react';

export type ResultLayout = 'wide' | 'classic';

const STORAGE_KEY = 'problemomer.resultLayout';
const DESKTOP_MQ = '(min-width: 1024px)';

function readPreference(): ResultLayout {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'classic' || stored === 'wide') return stored;
  } catch {
    /* ignore */
  }
  return 'wide';
}

function writePreference(value: ResultLayout) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

export function useResultLayout() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_MQ).matches : false,
  );
  const [preference, setPreference] = useState<ResultLayout>(() =>
    typeof window !== 'undefined' ? readPreference() : 'wide',
  );

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_MQ);
    const onChange = () => setIsDesktop(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const layout: ResultLayout = isDesktop ? preference : 'classic';

  function setLayout(next: ResultLayout) {
    setPreference(next);
    writePreference(next);
  }

  return { layout, preference, setLayout, isDesktop };
}
