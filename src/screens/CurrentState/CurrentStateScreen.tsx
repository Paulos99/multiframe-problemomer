import { useEffect } from 'react';
import { Screen } from '../../ui/Screen';
import { CardSelect } from '../../ui/CardSelect';
import { SimCompare } from '../../ui/SimCompare';
import { useSession } from '../../state/SessionContext';
import {
  COMFORT_LABELS,
  NOISE_TYPE_LABELS,
  type ComfortLevel,
  type NoiseType,
} from '../../state/types';
import { deriveSimulation } from '../../state/simulation';
import styles from './CurrentStateScreen.module.css';

const COMFORT: ComfortLevel[] = ['quiet', 'ok', 'bothers'];
const NOISE: NoiseType[] = ['impact', 'airborne', 'mixed'];

function suggestNoise(scenarios: string[]): NoiseType {
  const impact = ['steps', 'drop', 'furniture', 'repair'];
  const air = ['talk', 'tv', 'music'];
  const hasI = scenarios.some((s) => impact.includes(s));
  const hasA = scenarios.some((s) => air.includes(s));
  if (hasI && hasA) return 'mixed';
  if (hasI) return 'impact';
  if (hasA) return 'airborne';
  return 'mixed';
}

export function CurrentStateScreen() {
  const { session, setCurrentState } = useSession();
  const current = session.answers.current;
  const sim = session.derived?.simulation ?? deriveSimulation(session.answers);

  useEffect(() => {
    if (!current && session.answers.scenarios.length) {
      setCurrentState('ok', suggestNoise(session.answers.scenarios));
    }
  }, [current, session.answers.scenarios, setCurrentState]);

  const comfort = current?.comfortLevel ?? 'ok';
  const noiseType = current?.noiseType ?? suggestNoise(session.answers.scenarios);

  return (
    <Screen
      title="Как сейчас?"
      subtitle="Оцените ощущение и характер шума — рядом покажем ориентиры Rw / Lnw."
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

      <SimCompare sim={sim} emphasize="before" />

      {current?.whyPlain ? (
        <aside className={styles.why}>
          <h3>Почему это важно</h3>
          <p>{current.whyPlain}</p>
        </aside>
      ) : null}
    </Screen>
  );
}
