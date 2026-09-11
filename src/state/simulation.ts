import type {
  ClassLabel,
  ComfortLevel,
  DerivedSimSide,
  DerivedSimulation,
  FloorSlab,
  SessionAnswers,
  SlabPreset,
} from './types';
import { SIMULATION_BADGE } from './types';

/**
 * Joint class thresholds (both indices must meet):
 * A: Rw≥54 & Lnw≤55
 * B: Rw≥52 & Lnw≤58
 * V: Rw≥50 & Lnw≤60
 * else below; partial messaging if Rw ok but Lnw fails
 */
export const CLASS_THRESHOLDS = {
  A: { rwMin: 54, lnwMax: 55 },
  B: { rwMin: 52, lnwMax: 58 },
  V: { rwMin: 50, lnwMax: 60 },
} as const;

/**
 * Slab BEFORE by thickness (NOT generic concrete/hollow).
 * 180 = DEFAULT when unknown.
 * monolith250 Rw ≈ 56 (accepted 55–57).
 */
export const SLABS_BY_THICKNESS: Record<
  SlabPreset,
  { Rw: number; Lnw: number; note?: string }
> = {
  solid140: { Rw: 50, Lnw: 80 },
  solid160: { Rw: 52, Lnw: 78 },
  solid180: { Rw: 54, Lnw: 76 },
  solid200: { Rw: 55, Lnw: 74 },
  pk220: { Rw: 52, Lnw: 74 }, // PC 220
  mono250: { Rw: 56, Lnw: 74, note: 'monolith250 Rw≈56 (55–57)' },
};

/** @deprecated alias */
export const SLABS_BARE = SLABS_BY_THICKNESS;

/**
 * DELTA: +10 Rw, −8 Lnw — ONLY as marketing_placeholder / pre_lab.
 * Range shown in UI: Rw +8…+12, Lnw −6…−10.
 */
export const MULTIFRAME_PLACEHOLDER = {
  dRw: 10,
  dRwRange: [8, 12] as const,
  dLnw: 8,
  dLnwRange: [6, 10] as const,
  source: 'marketing_placeholder' as const,
  disclaimer: 'pre_lab' as const,
};

export function resolveSlabPreset(slab?: FloorSlab): SlabPreset {
  if (slab?.preset) return slab.preset;
  // Map legacy type/thickness → thickness presets (never "generic concrete/hollow" as values)
  if (slab?.type === 'hollow') return 'pk220';
  if (slab?.type === 'concrete') {
    const t = slab.thicknessMm;
    if (t == null) return 'mono250';
    if (t <= 150) return 'solid140';
    if (t <= 170) return 'solid160';
    if (t <= 190) return 'solid180';
    if (t <= 225) return 'solid200';
    return 'mono250';
  }
  return 'solid180'; // DEFAULT
}

function rwMeets(rw: number, cls: 'A' | 'B' | 'V'): boolean {
  return rw >= CLASS_THRESHOLDS[cls].rwMin;
}

function lnwMeets(lnw: number, cls: 'A' | 'B' | 'V'): boolean {
  return lnw <= CLASS_THRESHOLDS[cls].lnwMax;
}

/**
 * Joint class: both Rw and Lnw must meet.
 * If Rw ok for some class but Lnw fails all → 'partial'.
 * Ceiling-only after: never treat as full Lnw compliance (force partial if Rw ok).
 */
export function jointClass(
  Rw: number,
  Lnw: number,
  opts: { ceilingOnly: boolean },
): { classLabel: ClassLabel; label: string } {
  const order: Array<'A' | 'B' | 'V'> = ['A', 'B', 'V'];

  if (!opts.ceilingOnly) {
    for (const cls of order) {
      if (rwMeets(Rw, cls) && lnwMeets(Lnw, cls)) {
        return {
          classLabel: cls,
          label: cls === 'A' ? 'премиум-комфорт' : cls === 'B' ? 'комфорт' : 'базовый',
        };
      }
    }
  } else {
    // Ceiling-only: never claim full Lnw norm — even if numbers pass
    for (const cls of order) {
      if (rwMeets(Rw, cls) && lnwMeets(Lnw, cls)) {
        return {
          classLabel: 'partial',
          label: `частично · Rw к ${cls}, Lnw потолком не нормируется`,
        };
      }
    }
  }

  // Rw ok for at least V but Lnw fail → partial
  if (rwMeets(Rw, 'V') || rwMeets(Rw, 'B') || rwMeets(Rw, 'A')) {
    const rwBest = order.find((c) => rwMeets(Rw, c)) ?? 'V';
    return {
      classLabel: 'partial',
      label: `частично · Rw: ${rwBest}, Lnw не дотягивает (часто нужен пол у соседа)`,
    };
  }

  return { classLabel: 'below', label: 'ниже класса V' };
}

export function buildSide(
  Rw: number,
  Lnw: number,
  opts: { ceilingOnly: boolean },
): DerivedSimSide {
  const { classLabel, label } = jointClass(Rw, Lnw, opts);
  return { Rw, Lnw, classLabel, label };
}

function feelingFromSide(side: DerivedSimSide, user?: ComfortLevel): ComfortLevel {
  if (side.classLabel === 'A') return 'quiet';
  if (side.classLabel === 'B' || side.classLabel === 'partial') return 'ok';
  if (side.Lnw >= 74 || side.Rw < 52) return user === 'quiet' ? 'ok' : 'bothers';
  return user ?? 'ok';
}

/** Build DerivedSimulation (additive under derived, schemaVersion 1). */
export function buildSimulation(answers: SessionAnswers): DerivedSimulation {
  const preset = resolveSlabPreset(answers.room.floorSlab);
  const base = SLABS_BY_THICKNESS[preset];

  const before = buildSide(base.Rw, base.Lnw, { ceilingOnly: false });
  const after = buildSide(
    base.Rw + MULTIFRAME_PLACEHOLDER.dRw,
    base.Lnw - MULTIFRAME_PLACEHOLDER.dLnw,
    { ceilingOnly: true },
  );

  return {
    before,
    after,
    delta: {
      Rw: MULTIFRAME_PLACEHOLDER.dRw,
      Lnw: -MULTIFRAME_PLACEHOLDER.dLnw,
    },
    housingClass: after.classLabel,
    source: MULTIFRAME_PLACEHOLDER.source,
    disclaimer: MULTIFRAME_PLACEHOLDER.disclaimer,
    deltaRange: {
      Rw: MULTIFRAME_PLACEHOLDER.dRwRange,
      Lnw: MULTIFRAME_PLACEHOLDER.dLnwRange,
    },
    uiLabel: SIMULATION_BADGE,
    slabPreset: preset,
    feelingBefore: feelingFromSide(before, answers.current?.comfortLevel),
    feelingAfter: feelingFromSide(after, answers.current?.comfortLevel),
    honestLines: [
      'Воздух после MultiFrame ближе к комфорту — потолок помогает.',
      'Удар смягчается, но полной нормы Lnw потолком нет: пол у соседа сверху часто всё ещё нужен.',
    ],
  };
}

export const deriveSimulation = buildSimulation;

/** Chip helpers for independent Воздух / Удар display (Design). */
export function airChip(side: DerivedSimSide): string {
  if (side.Rw >= 54) return 'A';
  if (side.Rw >= 52) return 'B';
  if (side.Rw >= 50) return 'V';
  return 'вне нормы';
}

export function impactChip(side: DerivedSimSide): string {
  // «вне нормы» ONLY when Lnw > 60; ceiling-only never claims norm
  if (side.Lnw > 60) return 'вне нормы';
  if (side.Lnw <= 55) return 'A';
  if (side.Lnw <= 58) return 'B';
  if (side.Lnw <= 60) return 'V';
  return 'вне нормы';
}
