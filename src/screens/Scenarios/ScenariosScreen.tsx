import { Screen } from '../../ui/Screen';
import { CardSelect } from '../../ui/CardSelect';
import { useSession } from '../../state/SessionContext';
import { SCENARIO_LABELS, type NoiseScenario } from '../../state/types';
import styles from './ScenariosScreen.module.css';

const ORDER = Object.keys(SCENARIO_LABELS) as NoiseScenario[];

export function ScenariosScreen() {
  const { session, toggleScenario } = useSession();
  const selected = session.answers.scenarios;

  return (
    <Screen
      title="Что слышите сверху?"
      subtitle="Выберите все подходящие сценарии. Можно несколько."
    >
      <div className={styles.list}>
        {ORDER.map((id) => (
          <CardSelect
            key={id}
            multi
            title={SCENARIO_LABELS[id].title}
            hint={SCENARIO_LABELS[id].hint}
            selected={selected.includes(id)}
            onClick={() => toggleScenario(id)}
          />
        ))}
      </div>
      <p className={styles.count}>
        Выбрано: <strong>{selected.length}</strong>
      </p>
    </Screen>
  );
}
