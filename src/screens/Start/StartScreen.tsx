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
        <h1 className={styles.title}>
          Проверьте уровень акустического комфорта на своём объекте
        </h1>
        <p className={styles.lead}>
          Проблемомер показывает средний уровень шума исходя из типа перекрытия и
          строительных материалов, а также внутренних и внешних факторов.
        </p>
        <p className={styles.lead}>
          Следующий расчет показывает, как изменится звукоизоляция и акустический комфорт
          после монтажа системы MultiFrame.
        </p>
        <div className={styles.cta}>
          <Button onClick={goNext} fullWidth>
            Начать
          </Button>
        </div>
      </div>
    </Screen>
  );
}
