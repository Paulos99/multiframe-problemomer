/**
 * Backend stub — deriveSimulation (schemaVersion 2).
 * SlabKey: 140|160|180|200|pk220|mono250
 * DELTA: {Rw:10, Lnw:-8} — marketing_placeholder / pre_lab
 */
import type {
  ClassLabel,
  ClassStatus,
  ComfortLevel,
  DerivedSimSide,
  DerivedSimulation,
  RoomAnswers,
  SessionAnswers,
  SlabKey,
  SlabThicknessOption,
  SlabTypeOption,
} from './types';
import { SIMULATION_BADGE } from './types';

export type { SlabKey };

export const SLABS: Record<SlabKey, { Rw: number; Lnw: number }> = {
  '140': { Rw: 50, Lnw: 80 },
  '160': { Rw: 52, Lnw: 78 },
  '180': { Rw: 54, Lnw: 76 },
  '200': { Rw: 55, Lnw: 74 },
  pk220: { Rw: 52, Lnw: 74 },
  mono250: { Rw: 56, Lnw: 74 },
};

export const NORMS = {
  A: { Rw: 54, Lnw: 55 },
  B: { Rw: 52, Lnw: 58 },
  V: { Rw: 50, Lnw: 60 },
} as const;

export const DELTA = { Rw: 10, Lnw: -8 } as const;

export const SIM_META = {
  source: 'marketing_placeholder' as const,
  disclaimer: 'pre_lab' as const,
  deltaRange: {
    Rw: [8, 12] as const,
    Lnw: [6, 10] as const,
  },
};

const CLASS_ORDER = ['A', 'B', 'V'] as const;

const THICKNESS_MID: Record<Exclude<SlabThicknessOption, 'unknown'>, number> = {
  up_to_160: 150,
  about_160_200: 180,
  about_200_250: 225,
  over_250: 260,
};

function thicknessToSolidKey(mm: number): SlabKey {
  if (mm <= 150) return '140';
  if (mm <= 170) return '160';
  if (mm <= 190) return '180';
  if (mm <= 225) return '200';
  return 'mono250';
}

/** Map Room workshop fields → SlabKey */
export function resolveSlabKey(room: RoomAnswers): SlabKey {
  const type: SlabTypeOption = room.slabType;
  const thick: SlabThicknessOption = room.slabThickness;

  if (type === 'hollow') return 'pk220';
  if (type === 'wood') return '180';

  if (type === 'monolith') {
    if (thick === 'unknown') return '180';
    return thicknessToSolidKey(THICKNESS_MID[thick]);
  }

  // unknown type — soft proxy from house type
  if (room.houseType === 'panel' || room.houseType === 'block') return 'pk220';
  if (room.houseType === 'monolith') {
    if (thick === 'unknown') return '200';
    return thicknessToSolidKey(THICKNESS_MID[thick]);
  }
  if (room.houseType === 'brick') return '180';
  if (room.houseType === 'wood') return '180';

  return '180';
}

/** Baseline tweaks from floor-above / neighbors (ASSUMPTION, conservative) */
function baselineAdjust(room: RoomAnswers): { dRw: number; dLnw: number } {
  let dRw = 0;
  let dLnw = 0;
  if (room.floorAbove === 'floating') {
    dLnw -= 6;
    dRw += 1;
  } else if (room.floorAbove === 'ordinary' || room.floorAbove === 'unknown') {
    // conservative: ordinary floor, no bonus
  }
  if (room.noisyNeighbors === 'sometimes_noisy') {
    dLnw += 2;
    dRw -= 1;
  } else if (room.noisyNeighbors === 'usually_quiet') {
    dLnw -= 1;
  }
  return { dRw, dLnw };
}

export function grade(
  Rw: number,
  Lnw: number,
): { classLabel: ClassLabel; classStatus: ClassStatus; label: string } {
  for (const cls of CLASS_ORDER) {
    const n = NORMS[cls];
    if (Rw >= n.Rw && Lnw <= n.Lnw) {
      return {
        classLabel: cls,
        classStatus: 'ok',
        label: cls === 'A' ? 'высокий комфорт' : cls === 'B' ? 'комфорт' : 'допустимый',
      };
    }
  }
  for (const cls of CLASS_ORDER) {
    if (Rw >= NORMS[cls].Rw) {
      return {
        classLabel: cls,
        classStatus: 'partial',
        label: 'частично: воздух ближе к комфорту, удар ещё не в норме',
      };
    }
  }
  return {
    classLabel: 'below',
    classStatus: 'below',
    label: 'дискомфорт',
  };
}

export function buildSide(Rw: number, Lnw: number): DerivedSimSide {
  const { classLabel, classStatus, label } = grade(Rw, Lnw);
  return { Rw, Lnw, classLabel, classStatus, label };
}

function feelingFromSide(side: DerivedSimSide): ComfortLevel {
  if (side.classStatus === 'ok' && side.classLabel === 'A') return 'quiet';
  if (side.classStatus === 'ok' && side.classLabel === 'B') return 'ok';
  if (side.classStatus === 'partial') return 'ok';
  if (side.Lnw >= 74 || side.Rw < 52) return 'bothers';
  return 'ok';
}

/**
 * Perceived loudness reduction % from |Δ| dB.
 * Rule of thumb: ~10 dB ≈ half as loud → ~50%. Never linear Δ/level.
 */
export function perceivedReductionPct(absDeltaDb: number): number {
  const pct = (1 - Math.pow(0.5, absDeltaDb / 10)) * 100;
  return Math.round(Math.min(70, Math.max(15, pct)));
}

/**
 * Combined comfort orientation on the СП 51.13330.2011 А/Б/В ladder (Trofimov):
 * air margin above the cat-В floor (Rw − 50) plus impact margin below the cat-В cap
 * (60 − Lnw). Higher = calmer. A ceiling alone cannot bring Lnw to the impact norm,
 * so «Высокий комфорт (А)» is granted only when the impact index is genuinely in
 * norm (Lnw ≤ 55) — otherwise the orientation is capped at «Комфорт (Б)». This is a
 * client-facing comfort orientation, not a lab certificate (pre_lab / marketing).
 */
export function comfortScore(Rw: number, Lnw: number): number {
  return Rw - NORMS.V.Rw + (NORMS.V.Lnw - Lnw);
}

export function comfortClassFor(Rw: number, Lnw: number): ClassLabel {
  if (Rw >= NORMS.A.Rw && Lnw <= NORMS.A.Lnw) return 'A';
  const s = comfortScore(Rw, Lnw);
  if (s >= 6) return 'B';
  if (s >= -3) return 'V';
  return 'below';
}

function clampPct(v: number): number {
  return Math.round(Math.min(96, Math.max(4, v)));
}

/** Quietness 0..100 for a comfort bar (higher = calmer). Air: more isolation (Rw ↑). */
export function airQuietPct(Rw: number): number {
  return clampPct(((Rw - 45) / (70 - 45)) * 100);
}

/** Quietness 0..100 for a comfort bar (higher = calmer). Impact: less transmitted (Lnw ↓). */
export function impactQuietPct(Lnw: number): number {
  return clampPct(((82 - Lnw) / (82 - 58)) * 100);
}

export function deriveSimulation(answers: SessionAnswers): DerivedSimulation {
  const slabKey = resolveSlabKey(answers.room);
  const base = SLABS[slabKey];
  const adj = baselineAdjust(answers.room);

  const before = buildSide(base.Rw + adj.dRw, base.Lnw + adj.dLnw);
  const after = buildSide(before.Rw + DELTA.Rw, before.Lnw + DELTA.Lnw);

  const airAbs = Math.abs(DELTA.Rw);
  const impactAbs = Math.abs(DELTA.Lnw);

  return {
    before,
    after,
    delta: { Rw: DELTA.Rw, Lnw: DELTA.Lnw },
    housingClass: after.classLabel,
    source: SIM_META.source,
    disclaimer: SIM_META.disclaimer,
    deltaRange: SIM_META.deltaRange,
    uiLabel: SIMULATION_BADGE,
    slabKey,
    feelingBefore: feelingFromSide(before),
    feelingAfter: feelingFromSide(after),
    honestLines: [
      'Воздух: шум как будто дальше — ориентир по модели комнаты.',
      'Удар: тише; полную норму часто закрывает пол у соседа сверху.',
    ],
    perceivedAirPct: perceivedReductionPct(airAbs),
    perceivedImpactPct: perceivedReductionPct(impactAbs),
  };
}

export const CLASS_CYR: Record<'A' | 'B' | 'V', string> = {
  A: 'А',
  B: 'Б',
  V: 'В',
};

export function classCyr(label: ClassLabel): string {
  if (label === 'below') return '';
  return CLASS_CYR[label];
}

export function airChip(side: DerivedSimSide): string {
  if (side.Rw >= NORMS.A.Rw) return CLASS_CYR.A;
  if (side.Rw >= NORMS.B.Rw) return CLASS_CYR.B;
  if (side.Rw >= NORMS.V.Rw) return CLASS_CYR.V;
  return 'вне нормы';
}

export function impactChip(side: DerivedSimSide): string {
  if (side.Lnw > NORMS.V.Lnw) return 'вне нормы';
  if (side.Lnw <= NORMS.A.Lnw) return CLASS_CYR.A;
  if (side.Lnw <= NORMS.B.Lnw) return CLASS_CYR.B;
  if (side.Lnw <= NORMS.V.Lnw) return CLASS_CYR.V;
  return 'вне нормы';
}

/** @deprecated aliases */
export const buildSimulation = deriveSimulation;
export const resolveSlabPreset = resolveSlabKey;
