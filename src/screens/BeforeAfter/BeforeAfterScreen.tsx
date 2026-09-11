import { Screen } from '../../ui/Screen';
import { SimCompare } from '../../ui/SimCompare';
import { useSession } from '../../state/SessionContext';
import { COMFORT_LABELS } from '../../state/types';
import { deriveSimulation } from '../../state/simulation';
import styles from './BeforeAfterScreen.module.css';

export function BeforeAfterScreen() {
  const { session } = useSession();
  const sim = session.derived?.simulation ?? deriveSimulation(session.answers);
  const comfort =
    session.derived?.comfortLevel ?? session.answers.current?.comfortLevel ?? 'ok';

  return (
    <Screen
      title="До и после"
      subtitle="Сначала ощущение — цифры только поддерживают."
    >
      <div className={styles.dual}>
        <article className={`${styles.card} ${styles.before}`}>
          <span className={styles.tag}>Сейчас типично</span>
          <h2>Обычный потолок</h2>
          <p className={styles.emotion}>Шум сверху остаётся «рядом»</p>
          <ul>
            <li>Шаги и голоса легко читаются</li>
            <li>Ощущение тонкой границы с соседями</li>
            <li>Комфорт: {COMFORT_LABELS[comfort].split('—')[0]?.trim()}</li>
          </ul>
        </article>

        <article className={`${styles.card} ${styles.after}`}>
          <span className={styles.tag}>С MultiFrame</span>
          <h2>Бескаркасная акустика</h2>
          <p className={styles.emotion}>Тише. Спокойнее. Свой потолок.</p>
          <ul>
            <li>Воздух: примерно вдвое спокойнее — шум как будто дальше</li>
            <li>Удар: тише; норму часто закрывает пол у соседа</li>
            <li>Без каркаса — бережём высоту комнаты</li>
          </ul>
        </article>
      </div>

      <div className={styles.simSecondary}>
        <p className={styles.simLead}>Ориентиры в цифрах — вторичны к ощущению</p>
        <SimCompare sim={sim} tone="secondary" />
      </div>

      <div className={styles.note}>
        <p>
          Цифры поддерживают ощущение, а не заменяют его. Ударный шум потолком
          смягчается, но часто нужен ещё пол у соседа сверху.
        </p>
      </div>
    </Screen>
  );
}
