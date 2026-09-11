import { Screen } from '../../ui/Screen';
import { Disclaimer } from '../../ui/Disclaimer';
import { useSession } from '../../state/SessionContext';
import { COMFORT_LABELS } from '../../state/types';
import styles from './BeforeAfterScreen.module.css';

export function BeforeAfterScreen() {
  const { session } = useSession();
  const comfort = session.derived?.comfortLevel ?? session.answers.current?.comfortLevel ?? 'ok';

  return (
    <Screen
      title="До и после"
      subtitle="Эмоциональный контраст: обычный натяжной потолок и потолок с MultiFrame."
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
            <li>Ударный и смешанный шум воспринимаются мягче</li>
            <li>Без каркаса — бережём высоту комнаты</li>
            <li>Готовит основу для натяжного полотна</li>
          </ul>
        </article>
      </div>

      <Disclaimer />
    </Screen>
  );
}
