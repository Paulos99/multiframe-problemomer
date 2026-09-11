import type { AudioPair, NoiseScenario } from '../state/types';

/**
 * Demo stub audio pairs (mode stays demo_stub).
 * Filter by selected scenarios when possible; otherwise keep fixed stub set
 * and mark demoSet for «демо-набор» UI label.
 */
export const DEMO_AUDIO_PAIRS: AudioPair[] = [
  {
    id: 'steps',
    label: 'Шаги сверху',
    beforeLabel: 'Обычный потолок',
    afterLabel: 'С MultiFrame',
    beforeSrc: 'stub:before:steps',
    afterSrc: 'stub:after:steps',
    scenarios: ['steps', 'drop', 'furniture', 'repair'],
  },
  {
    id: 'talk',
    label: 'Разговор / ТВ',
    beforeLabel: 'Обычный потолок',
    afterLabel: 'С MultiFrame',
    beforeSrc: 'stub:before:talk',
    afterSrc: 'stub:after:talk',
    scenarios: ['talk', 'tv', 'music'],
  },
];

export type StubKind = 'before' | 'after';
export type StubScene = 'steps' | 'talk';

export function parseStubSrc(src: string): { kind: StubKind; scene: StubScene } | null {
  if (!src.startsWith('stub:')) return null;
  const parts = src.split(':');
  const kind = parts[1] as StubKind;
  const scene = (parts[2] ?? 'steps') as StubScene;
  if (kind !== 'before' && kind !== 'after') return null;
  return { kind, scene };
}

export function pairsForScenarios(scenarios: NoiseScenario[]): {
  pairs: AudioPair[];
  demoSet: boolean;
} {
  if (!scenarios.length) {
    return { pairs: DEMO_AUDIO_PAIRS, demoSet: true };
  }
  const filtered = DEMO_AUDIO_PAIRS.filter((p) =>
    (p.scenarios ?? []).some((s) => scenarios.includes(s)),
  );
  if (!filtered.length) {
    return { pairs: DEMO_AUDIO_PAIRS, demoSet: true };
  }
  return {
    pairs: filtered,
    demoSet: filtered.length === DEMO_AUDIO_PAIRS.length,
  };
}
