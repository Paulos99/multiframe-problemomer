import { Screen } from '../../ui/Screen';
import { SimCompare } from '../../ui/SimCompare';
import { useSession } from '../../state/SessionContext';
import { deriveSimulation } from '../../state/simulation';
import styles from './BeforeAfterScreen.module.css';

export function BeforeAfterScreen() {
  const { session } = useSession();
  const sim = session.derived?.simulation ?? deriveSimulation(session.answers);

  return (
    <Screen
      title="До и после"
      subtitle="Ориентиры «сейчас» и «с MultiFrame» рядом с ощущением Тихо / Терпимо / Мешает."
    >
      <SimCompare sim={sim} />
      <div className={styles.note}>
        <p>
          Цифры поддерживают ощущение, а не заменяют его. Ударный шум потолком
          смягчается, но часто нужен ещё пол у соседа сверху.
        </p>
      </div>
    </Screen>
  );
}
