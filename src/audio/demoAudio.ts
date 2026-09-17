import type { AudioPair } from '../state/types';

const base = import.meta.env.BASE_URL;

/** Real household stems in `public/audio/` — same file for До/После; After is processed. */
export const DEMO_AUDIO_PAIRS: AudioPair[] = [
  {
    id: 'air_talk',
    label: 'Громкие разговоры',
    group: 'air',
    beforeLabel: 'До',
    afterLabel: 'После',
    beforeSrc: `${base}audio/talk.mp3`,
    afterSrc: `${base}audio/talk.mp3`,
  },
  {
    id: 'impact_stomp',
    label: 'Топот и шаги',
    group: 'impact',
    beforeLabel: 'До',
    afterLabel: 'После',
    beforeSrc: `${base}audio/stomp.mp3`,
    afterSrc: `${base}audio/stomp.mp3`,
  },
  {
    id: 'mixed_vacuum',
    label: 'Пылесос',
    group: 'mixed',
    beforeLabel: 'До',
    afterLabel: 'После',
    beforeSrc: `${base}audio/vacuum.mp3`,
    afterSrc: `${base}audio/vacuum.mp3`,
  },
];

/** Unique stem URLs for prefetch / decode (До and После share one file). */
export const DEMO_STEM_URLS: readonly string[] = [
  ...new Set(DEMO_AUDIO_PAIRS.flatMap((p) => [p.beforeSrc, p.afterSrc])),
];

export type StubKind = 'before' | 'after';
export type StubScene = 'steps' | 'talk';

/** Legacy stub URLs — kept so old sessions / tests still parse. */
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
