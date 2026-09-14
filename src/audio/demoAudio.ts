import type { AudioPair } from '../state/types';

/** Fixed household demo set — one До/После per noise type (air / impact / mixed). */
export const DEMO_AUDIO_PAIRS: AudioPair[] = [
  {
    id: 'air_talk',
    label: 'Громкие разговоры и музыка',
    group: 'air',
    beforeLabel: 'До',
    afterLabel: 'После',
    beforeSrc: 'stub:before:talk',
    afterSrc: 'stub:after:talk',
  },
  {
    id: 'impact_steps',
    label: 'Шаги и детский бег',
    group: 'impact',
    beforeLabel: 'До',
    afterLabel: 'После',
    beforeSrc: 'stub:before:steps',
    afterSrc: 'stub:after:steps',
  },
  {
    id: 'mixed_appliance',
    label: 'Бытовая техника',
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
  air: { title: 'Воздушный шум', help: 'Через перекрытие (Rw): речь, музыка, лай.' },
  impact: { title: 'Ударный шум', help: 'Удар по плите (Lnw): бег, мебель, когти.' },
  mixed: { title: 'Смешанный шум', help: 'И воздух, и удар сразу — бытовая техника.' },
} as const;
