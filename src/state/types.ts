/** schemaVersion: 2 — MultiFrame Проблемомер (workshop 2026-09-13) */

export type InterestFor = 'self' | 'client';

export type RoomType =
  | 'living'
  | 'bedroom'
  | 'kids'
  | 'kitchen'
  | 'office'
  | 'other';

/** Backend slab keys for deriveSimulation */
export type SlabKey = '140' | '160' | '180' | '200' | 'pk220' | 'mono250';

export type SlabTypeOption = 'monolith' | 'hollow' | 'wood' | 'unknown';

export type SlabThicknessOption =
  | 'up_to_160'
  | 'about_160_200'
  | 'about_200_250'
  | 'over_250'
  | 'unknown';

export type FloorAboveOption = 'unknown' | 'ordinary' | 'floating';

export type HouseTypeOption =
  | 'panel'
  | 'block'
  | 'brick'
  | 'monolith'
  | 'wood'
  | 'unknown';

export type ObjectStageOption = 'newbuild' | 'renovation' | 'occupied' | 'unknown';

export type PlannedCeilingOption = 'stretch_planned' | 'ceiling_exists' | 'unknown';

export type NoisyNeighborsOption = 'unknown' | 'usually_quiet' | 'sometimes_noisy';

/** Legacy noise tags — still used for audio demo grouping, not a survey */
export type NoiseScenario =
  | 'steps'
  | 'drop'
  | 'furniture'
  | 'talk'
  | 'tv'
  | 'music'
  | 'repair'
  | 'dog_bark'
  | 'dog_claws'
  | 'kids_run'
  | 'washer'
  | 'vacuum';

export type ComfortLevel = 'quiet' | 'ok' | 'bothers';
export type NoiseType = 'impact' | 'airborne' | 'mixed';

export type WizardStep = 'start' | 'room' | 'beforeAfter' | 'audio' | 'result';

export type ClassLabel = 'A' | 'B' | 'V' | 'below';
export type ClassStatus = 'ok' | 'partial' | 'below';

export interface DerivedSimSide {
  Rw: number;
  Lnw: number;
  classLabel: ClassLabel;
  classStatus: ClassStatus;
  label?: string;
}

export interface DerivedSimulation {
  before: DerivedSimSide;
  after: DerivedSimSide;
  delta: { Rw: number; Lnw: number };
  housingClass: ClassLabel;
  source: 'marketing_placeholder';
  disclaimer: 'pre_lab';
  deltaRange: { Rw: readonly [number, number]; Lnw: readonly [number, number] };
  uiLabel: string;
  slabKey: SlabKey;
  feelingBefore: ComfortLevel;
  feelingAfter: ComfortLevel;
  honestLines: string[];
  /** Perceived loudness reduction % from Δ (log map, not linear) */
  perceivedAirPct: number;
  perceivedImpactPct: number;
}

export interface DerivedProfile {
  comfortLevel: ComfortLevel;
  noiseType: NoiseType;
  whyMultiFrame: string[];
  disclaimer: 'expert_not_engineering';
  simulation: DerivedSimulation;
}

export interface AudioPair {
  id: string;
  label: string;
  group: 'air' | 'impact' | 'mixed';
  beforeLabel: string;
  afterLabel: string;
  beforeSrc: string;
  afterSrc: string;
}

export interface AudioState {
  mode: 'demo_stub' | 'mapped';
  pairs: AudioPair[];
  demoSet?: boolean;
}

export interface CtaPayload {
  roomType: RoomType | null;
  ceilingAreaM2: number | null;
}

export interface RoomAnswers {
  roomType: RoomType | null;
  ceilingAreaM2: number | null;
  slabType: SlabTypeOption;
  slabThickness: SlabThicknessOption;
  floorAbove: FloorAboveOption;
  houseType: HouseTypeOption;
  objectStage: ObjectStageOption;
  plannedCeiling: PlannedCeilingOption;
  noisyNeighbors: NoisyNeighborsOption;
}

export interface SessionAnswers {
  interestFor: InterestFor;
  room: RoomAnswers;
  scope: 'ceiling';
}

export interface SessionState {
  schemaVersion: 2;
  step: WizardStep;
  answers: SessionAnswers;
  derived: DerivedProfile | null;
  audio: AudioState;
  cta: CtaPayload;
}

export const WIZARD_STEPS: WizardStep[] = [
  'start',
  'room',
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

export const SLAB_TYPE_OPTIONS: { id: SlabTypeOption; label: string }[] = [
  { id: 'monolith', label: 'Монолит / сплошная ж/б' },
  { id: 'hollow', label: 'Многопустотная (ПК)' },
  { id: 'wood', label: 'Деревянное / по балкам' },
  { id: 'unknown', label: 'Не знаю' },
];

export const SLAB_THICKNESS_OPTIONS: { id: SlabThicknessOption; label: string }[] = [
  { id: 'up_to_160', label: 'До ~160 мм' },
  { id: 'about_160_200', label: 'Около 160–200 мм' },
  { id: 'about_200_250', label: 'Около 200–250 мм' },
  { id: 'over_250', label: 'Толще ~250 мм' },
  { id: 'unknown', label: 'Не знаю' },
];

export const FLOOR_ABOVE_OPTIONS: { id: FloorAboveOption; label: string }[] = [
  { id: 'unknown', label: 'Не знаю' },
  { id: 'ordinary', label: 'Обычный пол (без плавающей схемы)' },
  { id: 'floating', label: 'Есть плавающий пол / шумоизоляция в полу' },
];

export const HOUSE_TYPE_OPTIONS: { id: HouseTypeOption; label: string }[] = [
  { id: 'panel', label: 'Панельный' },
  { id: 'block', label: 'Блочный' },
  { id: 'brick', label: 'Кирпичный' },
  { id: 'monolith', label: 'Монолит (в т.ч. монолит-кирпич)' },
  { id: 'wood', label: 'Деревянный / по балкам' },
  { id: 'unknown', label: 'Не знаю' },
];

export const OBJECT_STAGE_OPTIONS: { id: ObjectStageOption; label: string }[] = [
  { id: 'newbuild', label: 'Новостройка / до заселения' },
  { id: 'renovation', label: 'Идёт ремонт' },
  { id: 'occupied', label: 'Уже живут' },
  { id: 'unknown', label: 'Не знаю' },
];

export const PLANNED_CEILING_OPTIONS: { id: PlannedCeilingOption; label: string }[] = [
  { id: 'stretch_planned', label: 'Планируем натяжной' },
  { id: 'ceiling_exists', label: 'Потолок уже есть' },
  { id: 'unknown', label: 'Не знаю' },
];

export const NOISY_NEIGHBORS_OPTIONS: { id: NoisyNeighborsOption; label: string }[] = [
  { id: 'unknown', label: 'Не знаю' },
  { id: 'usually_quiet', label: 'Обычно тихо' },
  { id: 'sometimes_noisy', label: 'Сверху бывает шумно' },
];

/** Hybrid comfort class labels (UI) */
export const HYBRID_CLASS_LABELS: Record<ClassLabel, string> = {
  A: 'Высокий комфорт (А)',
  B: 'Комфорт (Б)',
  V: 'Допустимый (В)',
  below: 'Дискомфорт',
};

export const CALCULATOR_URL = 'https://paulos99.github.io/MF_StP/';

export const DISCLAIMER_EXPERT =
  'Оценка экспертная и качественная. Это не инженерный расчёт звукоизоляции и не гарантия конкретных показателей.';

export const SIMULATION_BADGE = 'Оценка до лабораторных данных';

export const DISCLAIMER_SIMULATION =
  'Цифры — ориентир до лабораторных данных. Ударный шум потолком становится мягче; пол сверху часто дополняет результат.';

export const NORM_FOOTNOTE = 'Ориентир по шкале комфортности (норм. документы)';

export const LOG_DB_FOOTNOTE =
  'Шкала дБ логарифмическая: −8 дБ ≈ вдвое тише по ощущению.';
