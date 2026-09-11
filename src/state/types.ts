/** schemaVersion: 1 — MultiFrame Проблемомер session */

export type RoomType =
  | 'living'
  | 'bedroom'
  | 'kids'
  | 'kitchen'
  | 'office'
  | 'other';

/** Product v1.1 bare-slab presets. solid180 = DEFAULT when unknown. */
export type SlabPreset =
  | 'solid140'
  | 'solid160'
  | 'solid180'
  | 'solid200'
  | 'pk220'
  | 'mono250';

/** @deprecated legacy — mapped to SlabPreset in simulation */
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
export type HousingClass = 'A' | 'B' | 'V';

export type WizardStep =
  | 'start'
  | 'room'
  | 'scenarios'
  | 'current'
  | 'beforeAfter'
  | 'audio'
  | 'result';

export interface FloorSlab {
  preset?: SlabPreset;
  type?: SlabType;
  thicknessMm?: number;
}

export interface RoomAnswers {
  roomType: RoomType | null;
  ceilingAreaM2: number | null;
  floorSlab?: FloorSlab;
}

export interface SimulationSide {
  Rw: number;
  Lnw: number;
  /** Independent airborne grade */
  airClass: HousingClass | 'below';
  /** Independent impact grade (raw); UI may show «вне нормы» when Lnw > 60 */
  impactClass: HousingClass | 'below';
  /** Design: true when Lnw > 60 */
  impactOutOfNorm: boolean;
}

/**
 * Additive under derived — schemaVersion stays 1.
 * LOCKED Acoustics canon Product v1.1 + Design SimCompare.
 */
export interface SimulationEstimate {
  before: SimulationSide;
  after: SimulationSide;
  delta: { Rw: number; Lnw: number };
  /** Magnitudes for secondary range copy: +8…+12 / −6…−10 */
  deltaRange: { Rw: readonly [number, number]; Lnw: readonly [number, number] };
  source: 'marketing_placeholder';
  disclaimer: 'pre_lab';
  uiLabel: string;
  slabPreset: SlabPreset;
  feelingBefore: ComfortLevel;
  feelingAfter: ComfortLevel;
  /** 1–2 short honest lines for SimCompare */
  honestLines: string[];
}

export interface DerivedProfile {
  comfortLevel: ComfortLevel;
  noiseType: NoiseType;
  whyMultiFrame: string[];
  disclaimer: 'expert_not_engineering';
  simulation: SimulationEstimate;
}

export interface AudioPair {
  id: string;
  label: string;
  beforeLabel: string;
  afterLabel: string;
  beforeSrc: string;
  afterSrc: string;
  scenarios?: NoiseScenario[];
}

export interface AudioState {
  mode: 'demo_stub' | 'mapped';
  pairs: AudioPair[];
  /** true when showing unfiltered fixed stub set */
  demoSet?: boolean;
}

export interface CtaPayload {
  roomType: RoomType | null;
  ceilingAreaM2: number | null;
  scenarios: NoiseScenario[];
}

export interface SessionAnswers {
  room: RoomAnswers;
  scenarios: NoiseScenario[];
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

/** Design SimCompare feeling chips */
export const COMFORT_FEELING: Record<ComfortLevel, string> = {
  quiet: 'Тихо',
  ok: 'Терпимо',
  bothers: 'Мешает',
};

export const COMFORT_SHORT: Record<ComfortLevel, string> = {
  quiet: 'тихо',
  ok: 'терпимо',
  bothers: 'мешает',
};

export const NOISE_TYPE_LABELS: Record<NoiseType, string> = {
  impact: 'Ударный (шаги, падения, мебель)',
  airborne: 'Воздушный (голоса, ТВ, музыка)',
  mixed: 'Смешанный',
};

export const SLAB_PRESET_LABELS: Record<SlabPreset, string> = {
  solid140: 'Сплошная 140 мм',
  solid160: 'Сплошная 160 мм',
  solid180: 'Сплошная 180 мм (по умолчанию)',
  solid200: 'Сплошная 200 мм',
  pk220: 'ПК 220 мм (пустотка)',
  mono250: 'Монолит 250 мм',
};

export const SLAB_TYPE_LABELS: Record<SlabType, string> = {
  concrete: 'Монолитный бетон',
  hollow: 'Пустотная плита',
  wood: 'Деревянное перекрытие',
  unknown: 'Не знаю',
};

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

/** Design badge on SimCompare */
export const SIMULATION_BADGE = 'Оценка до лабораторных данных';

export const SIMULATION_UI_LABEL = SIMULATION_BADGE;

export const DISCLAIMER_SIMULATION =
  'Не замер и не гарантия Δ. A/B/V — ориентир комфорта, не расчёт по СП. Потолком нельзя заявлять норму Lnw по перекрытию.';

