import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { useSession } from '../../state/SessionContext';
import styles from './StartScreen.module.css';

export function StartScreen() {
  const { goNext } = useSession();

  return (
    <Screen hero>
      <div className={styles.hero}>
        <div className={styles.glow} aria-hidden />
        <p className={styles.kicker}>StP · MultiFRAME · потолок</p>
        <h1 className={styles.title}>
          Проверьте уровень акустического комфорта перед выбором натяжного потолка
        </h1>
        <p className={styles.lead}>
          Проблемомер помогает почувствовать разницу: обычный потолок и потолок с
          бескаркасной системой MultiFrame — без сложных терминов.
        </p>
        <div className={styles.cta}>
          <Button onClick={goNext} fullWidth>
            Начать
          </Button>
        </div>
        <ul className={styles.points}>
          <li>Только потолок и шум сверху через перекрытие</li>
          <li>Экспертная оценка с понятными ориентирами</li>
          <li>Далее — расчёт материалов MultiFRAME</li>
        </ul>
      </div>
    </Screen>
  );
}
