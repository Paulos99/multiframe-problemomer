import styles from './AppShell.module.css';
import { Header } from './Header';
import { ProgressDots } from './ProgressDots';
import { StickyCta } from './StickyCta';
import { useSession } from '../state/SessionContext';
import { buildCalculatorUrl } from '../state/session';
import { StartScreen } from '../screens/Start/StartScreen';
import { RoomScreen } from '../screens/Room/RoomScreen';
import { BeforeAfterScreen } from '../screens/BeforeAfter/BeforeAfterScreen';
import { AudioDiffScreen } from '../screens/AudioDiff/AudioDiffScreen';
import { ResultScreen } from '../screens/Result/ResultScreen';

export function AppShell() {
  const { session, goNext, goBack, canGoNext } = useSession();
  const { step } = session;
  const showNav = step !== 'start';
  const isResult = step === 'result';

  let content = null;
  switch (step) {
    case 'start':
      content = <StartScreen />;
      break;
    case 'room':
      content = <RoomScreen />;
      break;
    case 'beforeAfter':
      content = <BeforeAfterScreen />;
      break;
    case 'audio':
      content = <AudioDiffScreen />;
      break;
    case 'result':
      content = <ResultScreen />;
      break;
  }

  const ctaLabel =
    step === 'beforeAfter'
      ? 'Услышать разницу'
      : step === 'audio'
        ? 'Смотреть итог'
        : step === 'result'
          ? 'Открыть калькулятор MultiFrame'
          : 'Далее';

  const calcUrl = isResult ? buildCalculatorUrl(session.cta) : null;

  return (
    <div className={`${styles.shell} ${showNav ? styles.withFooter : ''}`}>
      <Header />
      {step !== 'start' ? <ProgressDots /> : null}
      <main className={styles.main}>{content}</main>
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
