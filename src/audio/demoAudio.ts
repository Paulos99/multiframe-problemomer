import type { AudioPair } from '../state/types';

/** Fixed household demo set — three groups (air / impact / mixed). */
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
    id: 'music',
    label: 'Музыка',
    group: 'air',
    beforeLabel: 'До',
    afterLabel: 'После',
    beforeSrc: 'stub:before:talk',
    afterSrc: 'stub:after:talk',
  },
  {
    id: 'loud_talk',
    label: 'Громкие разговоры',
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
    id: 'furniture',
    label: 'Перестановка мебели',
    group: 'impact',
    beforeLabel: 'До',
    afterLabel: 'После',
    beforeSrc: 'stub:before:steps',
    afterSrc: 'stub:after:steps',
  },
  {
    id: 'dog_claws',
    label: 'Цоканье когтей собаки',
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
  {
    id: 'vacuum',
    label: 'Пылесос',
    group: 'mixed',
    beforeLabel: 'До',
    afterLabel: 'После',
    beforeSrc: 'stub:before:talk',
    afterSrc: 'stub:after:steps',
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
