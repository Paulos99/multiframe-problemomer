/** Fixed household demo set — one exemplar per noise group on Result. */
import type { AudioPair } from '../state/types';

export const DEMO_AUDIO_PAIRS: AudioPair[] = [
  {
    id: 'dog_bark',
    label: 'Лай собаки',
    group: 'air',
    beforeLabel: 'До',
    afterLabel: 'После',
    beforeSrc: 'stub:before:talk',
    afterSrc: 'stub:after:talk',
  },
  {
    id: 'kids_run',
    label: 'Детский бег',
    group: 'impact',
    beforeLabel: 'До',
    afterLabel: 'После',
    beforeSrc: 'stub:before:steps',
    afterSrc: 'stub:after:steps',
  },
  {
    id: 'washer',
    label: 'Стиральная машина',
    group: 'mixed',
    beforeLabel: 'До',
    afterLabel: 'После',
    beforeSrc: 'stub:before:steps',
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

export const AUDIO_GROUP_LABELS = {
  air: { title: 'Воздух', help: 'Речь, музыка, лай' },
  impact: { title: 'Удар', help: 'Бег, мебель, когти' },
  mixed: { title: 'Смешанный', help: 'Бытовая техника' },
} as const;
