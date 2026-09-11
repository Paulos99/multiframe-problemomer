import { useEffect } from 'react';
import { Screen } from '../../ui/Screen';
import { CardSelect } from '../../ui/CardSelect';
import { useSession } from '../../state/SessionContext';
import {
  COMFORT_LABELS,
  NOISE_TYPE_LABELS,
  type ComfortLevel,
  type NoiseType,
} from '../../state/types';
import { classifyFromScenarios } from './suggest';
import styles from './CurrentStateScreen.module.css';

const COMFORT: ComfortLevel[] = ['quiet', 'ok', 'bothers'];
const NOISE: NoiseType[] = ['impact', 'airborne', 'mixed'];

export function CurrentStateScreen() {
  const { session, setCurrentState } = useSession();
  const current = session.answers.current;

  useEffect(() => {
    if (!current && session.answers.scenarios.length) {
      const suggested = classifyFromScenarios(session.answers.scenarios);
      setCurrentState('ok', suggested);
    }
  }, [current, session.answers.scenarios, setCurrentState]);

  const comfort = current?.comfortLevel ?? 'ok';
  const noiseType = current?.noiseType ?? classifyFromScenarios(session.answers.scenarios);

  return (
    <Screen
      title="Как сейчас?"
      subtitle="Оцените ощущение комфорта и характер шума — своими словами, без цифр."
    >
      <div className={styles.block}>
        <h2>Уровень комфорта</h2>
        <div className={styles.stack}>
          {COMFORT.map((c) => (
            <CardSelect
              key={c}
              title={COMFORT_LABELS[c]}
              selected={comfort === c}
              onClick={() => setCurrentState(c, noiseType)}
            />
          ))}
        </div>
      </div>

      <div className={styles.block}>
        <h2>Тип шума</h2>
        <div className={styles.stack}>
          {NOISE.map((n) => (
            <CardSelect
              key={n}
              title={NOISE_TYPE_LABELS[n]}
              selected={noiseType === n}
              onClick={() => setCurrentState(comfort, n)}
            />
          ))}
        </div>
      </div>

      {current?.whyPlain ? (
        <aside className={styles.why}>
          <h3>Почему это важно</h3>
          <p>{current.whyPlain}</p>
        </aside>
      ) : null}
    </Screen>
  );
}
