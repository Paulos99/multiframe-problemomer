import type { AudioPair } from '../state/types';

/**
 * Demo stub audio pairs.
 * Generated procedurally at runtime via Web Audio API when files are absent;
 * `src` markers keep the contract for future mapped WAV/MP3.
 */
export const DEMO_AUDIO_PAIRS: AudioPair[] = [
  {
    id: 'steps',
    label: 'Шаги сверху',
    beforeLabel: 'Обычный потолок',
    afterLabel: 'С MultiFrame',
    beforeSrc: 'stub:before:steps',
    afterSrc: 'stub:after:steps',
  },
  {
    id: 'talk',
    label: 'Разговор / ТВ',
    beforeLabel: 'Обычный потолок',
    afterLabel: 'С MultiFrame',
    beforeSrc: 'stub:before:talk',
    afterSrc: 'stub:after:talk',
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
