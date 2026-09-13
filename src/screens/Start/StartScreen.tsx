import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { CardSelect } from '../../ui/CardSelect';
import { useSession } from '../../state/SessionContext';
import styles from './StartScreen.module.css';

export function StartScreen() {
  const { session, goNext, setInterestFor } = useSession();
  const interest = session.answers.interestFor;

  return (
    <Screen hero>
      <div className={styles.hero}>
        <div className={styles.glow} aria-hidden />
        <p className={styles.interestLabel}>Интересуюсь звукоизоляцией:</p>
        <div className={styles.interest}>
          <CardSelect
            dense
            title="для себя"
            selected={interest === 'self'}
            onClick={() => setInterestFor('self')}
          />
          <CardSelect
            dense
            title="для клиента"
            selected={interest === 'client'}
            onClick={() => setInterestFor('client')}
          />
        </div>
        <h1 className={styles.title}>
          Проверьте уровень акустического комфорта перед выбором натяжного потолка
        </h1>
        <p className={styles.lead}>
          Проблемомер показывает исходное состояние потолка и эффект MultiFrame —
          уровень комфорта сейчас, ожидаемый эффект после и что важно учесть до выбора
          потолка.
        </p>
        <div className={styles.cta}>
          <Button onClick={goNext} fullWidth>
            Начать
          </Button>
        </div>
        <ul className={styles.points}>
          <li>Только потолок и шум сверху через перекрытие</li>
          <li>Полная картина: комфорт сейчас → эффект MultiFrame → плюсы системы</li>
          <li>Далее — расчёт материалов MultiFRAME</li>
        </ul>
      </div>
    </Screen>
  );
}
