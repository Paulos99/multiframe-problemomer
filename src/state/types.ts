/** schemaVersion: 1 — MultiFrame Проблемомер session */

export type RoomType =
  | 'living'
  | 'bedroom'
  | 'kids'
  | 'kitchen'
  | 'office'
  | 'other';

export type SlabType = 'concrete' | 'hollow' | 'wood' | 'unknown';

export type NoiseScenario =
  | 'steps'
  | 'drop'
  | 'furniture'
  | 'talk'
  | 'tv'
  | 'music'
  | 'repair';

export type ComfortLevel = 'quiet' | 'ok' | 'bothers';
export type NoiseType = 'impact' | 'airborne' | 'mixed';

export type WizardStep =
  | 'start'
  | 'room'
  | 'scenarios'
  | 'current'
  | 'beforeAfter'
  | 'audio'
  | 'result';

export interface FloorSlab {
  type: SlabType;
  thicknessMm?: number;
}

export interface RoomAnswers {
  roomType: RoomType | null;
  ceilingAreaM2: number | null;
  floorSlab?: FloorSlab;
}

export interface DerivedProfile {
  comfortLevel: ComfortLevel;
  noiseType: NoiseType;
  whyMultiFrame: string[];
  disclaimer: 'expert_not_engineering';
}

export interface AudioPair {
  id: string;
  label: string;
  beforeLabel: string;
  afterLabel: string;
  beforeSrc: string;
  afterSrc: string;
}

export interface AudioState {
  mode: 'demo_stub' | 'mapped';
  pairs: AudioPair[];
}

export interface CtaPayload {
  roomType: RoomType | null;
  ceilingAreaM2: number | null;
  scenarios: NoiseScenario[];
}

export interface SessionAnswers {
  room: RoomAnswers;
  scenarios: NoiseScenario[];
  /** Always ceiling — product scope */
  scope: 'ceiling';
  current?: {
    comfortLevel: ComfortLevel;
    noiseType: NoiseType;
    whyPlain: string;
  };
}

export interface SessionState {
  schemaVersion: 1;
  step: WizardStep;
  answers: SessionAnswers;
  derived: DerivedProfile | null;
  audio: AudioState;
  cta: CtaPayload;
}

export const WIZARD_STEPS: WizardStep[] = [
  'start',
  'room',
  'scenarios',
  'current',
  'beforeAfter',
  'audio',
  'result',
];

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  living: 'Гостиная',
  bedroom: 'Спальня',
  kids: 'Детская',
  kitchen: 'Кухня',
  office: 'Кабинет',
  other: 'Другое',
};

export const SCENARIO_LABELS: Record<NoiseScenario, { title: string; hint: string }> = {
  steps: { title: 'Шаги сверху', hint: 'Ходьба, топот' },
  drop: { title: 'Падение предметов', hint: 'Игрушки, вещи' },
  furniture: { title: 'Передвижение мебели', hint: 'Стулья, столы' },
  talk: { title: 'Разговоры', hint: 'Голоса соседей' },
  tv: { title: 'ТВ', hint: 'Телевизор, сериалы' },
  music: { title: 'Музыка', hint: 'Бас, колонки' },
  repair: { title: 'Ремонт', hint: 'Дрель, перфоратор' },
};

export const COMFORT_LABELS: Record<ComfortLevel, string> = {
  quiet: 'Тихо — почти не замечаю',
  ok: 'Терпимо — иногда отвлекает',
  bothers: 'Мешает — хочется тишины',
};

export const NOISE_TYPE_LABELS: Record<NoiseType, string> = {
  impact: 'Ударный (шаги, падения, мебель)',
  airborne: 'Воздушный (голоса, ТВ, музыка)',
  mixed: 'Смешанный',
};

export const SLAB_TYPE_LABELS: Record<SlabType, string> = {
  concrete: 'Монолитный бетон',
  hollow: 'Пустотная плита',
  wood: 'Деревянное перекрытие',
  unknown: 'Не знаю',
};

/** Educational only — never as MultiFrame promise */
export const NORMS_SLAB_TYPICAL: Record<
  Exclude<SlabType, 'unknown'>,
  { thicknessHint: string; note: string }
> = {
  concrete: {
    thicknessHint: 'часто 160–220 мм',
    note: 'Типичное перекрытие гасит часть воздушного шума, но ударный часто остаётся заметным.',
  },
  hollow: {
    thicknessHint: 'часто 220 мм',
    note: 'Пустоты облегчают плиту; шаги и падения могут передаваться сильнее ожиданий.',
  },
  wood: {
    thicknessHint: 'зависит от конструкции',
    note: 'Деревянные перекрытия чувствительны к ударному шуму — бескаркасная акустика потолка особенно уместна.',
  },
};

export const CALCULATOR_URL = 'https://paulos99.github.io/MF_StP/';
export const DISCLAIMER_EXPERT =
  'Оценка экспертная и качественная. Это не инженерный расчёт звукоизоляции и не гарантия конкретных показателей.';
