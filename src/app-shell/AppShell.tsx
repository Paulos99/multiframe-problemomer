import { useEffect } from 'react';
import { useLenis } from 'lenis/react';
import styles from './AppShell.module.css';
import { Header } from './Header';
import { ProgressDots } from './ProgressDots';
import { StickyCta } from './StickyCta';
import { useSession } from '../state/SessionContext';
import { buildCalculatorUrl } from '../state/session';
import { StartScreen } from '../screens/Start/StartScreen';
import { RoomScreen } from '../screens/Room/RoomScreen';
import { ProcessingScreen } from '../screens/Processing/ProcessingScreen';
import { ResultScreen } from '../screens/Result/ResultScreen';
import { ResultWideScreen } from '../screens/Result/ResultWideScreen';
import { useResultLayout } from '../screens/Result/useResultLayout';

function useScrollReveal(deps: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    for (const node of nodes) {
      node.classList.remove('is-revealed');
      io.observe(node);
    }

    return () => io.disconnect();
  }, [deps]);
}

function useScrollTopOnStep(step: string) {
  const lenis = useLenis();
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [step, lenis]);
}

export function AppShell() {
  const { session, goNext, goBack, canGoNext } = useSession();
  const { step } = session;
  const { layout, preference, setLayout, isDesktop } = useResultLayout();
  const isProcessing = step === 'processing';
  const isResult = step === 'result';
  const isResultWide = isResult && layout === 'wide';
  const revealKey = `${step}:${isResult ? layout : ''}`;
  useScrollReveal(revealKey);
  useScrollTopOnStep(revealKey);
  const showNav = step !== 'start' && !isProcessing && !isResultWide;
  const showProgress = step !== 'start' && !isProcessing;
  const showHeader = !isProcessing;

  let content = null;
  switch (step) {
    case 'start':
      content = <StartScreen />;
      break;
    case 'room':
      content = <RoomScreen />;
      break;
    case 'processing':
      content = <ProcessingScreen />;
      break;
    case 'result':
      content =
        layout === 'wide' ? (
          <ResultWideScreen layoutPreference={preference} onLayoutChange={setLayout} />
        ) : (
          <ResultScreen
            showLayoutToggle={isDesktop}
            layoutPreference={preference}
            onLayoutChange={setLayout}
          />
        );
      break;
  }

  const ctaLabel = isResult ? 'Рассчитать количество MultiFrame' : 'Далее';
  const calcUrl = isResult ? buildCalculatorUrl(session.cta) : null;

  return (
    <div
      className={`${styles.shell} ${showNav ? styles.withFooter : ''} ${isProcessing ? styles.processing : ''} ${isResultWide ? styles.shellWide : ''}`}
    >
      {showHeader ? <Header /> : null}
      {showProgress ? <ProgressDots /> : null}
      <main
        className={`${styles.main} ${isProcessing ? styles.mainProcessing : ''} ${isResultWide ? styles.mainWide : ''}`}
      >
        {content}
      </main>
      {showNav ? (
        <StickyCta
          onBack={goBack}
          onNext={() => {
            if (isResult && calcUrl) {
              window.open(calcUrl, '_blank', 'noopener,noreferrer');
              return;
            }
            goNext();
          }}
          nextDisabled={isResult ? false : !canGoNext}
          nextLabel={ctaLabel}
        />
      ) : null}
    </div>
  );
}
