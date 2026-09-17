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

export function AppShell() {
  const { session, goNext, goBack, canGoNext } = useSession();
  const { step } = session;
  const isProcessing = step === 'processing';
  const showNav = step !== 'start' && !isProcessing;
  const showProgress = step !== 'start' && !isProcessing;
  const showHeader = !isProcessing;
  const isResult = step === 'result';

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
      content = <ResultScreen />;
      break;
  }

  const ctaLabel = isResult ? 'Открыть калькулятор MultiFrame' : 'Далее';
  const calcUrl = isResult ? buildCalculatorUrl(session.cta) : null;

  return (
    <div
      className={`${styles.shell} ${showNav ? styles.withFooter : ''} ${isProcessing ? styles.processing : ''}`}
    >
      {showHeader ? <Header /> : null}
      {showProgress ? <ProgressDots /> : null}
      <main className={`${styles.main} ${isProcessing ? styles.mainProcessing : ''}`}>
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
