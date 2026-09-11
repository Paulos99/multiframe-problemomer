import type {
  ComfortLevel,
  FloorSlab,
  HousingClass,
  SessionAnswers,
  SimulationEstimate,
  SimulationSide,
  SimulationStatus,
  SlabPreset,
} from './types';
import { SIMULATION_BADGE } from './types';

/**
 * LOCKED Acoustics canon — Product v1.1
 * norms_inter_apartment: A Rw≥54 Lnw≤55; B 52/58; V 50/60
 */
export const SP_FLOOR_NORMS: Record<
  HousingClass,
  { rwMin: number; lnwMax: number }
> = {
  A: { rwMin: 54, lnwMax: 55 },
  B: { rwMin: 52, lnwMax: 58 },
  V: { rwMin: 50, lnwMax: 60 },
};

/**
 * slabs_bare — no floating floor. solid180 = DEFAULT.
 *
 * Acoustics validation notes:
 * - mono250 before Rw ≈ 56 (accepted range 55–57 in data/comments).
 */
export const SLABS_BARE: Record<
  SlabPreset,
  { Rw: number; Lnw: number; note?: string }
> = {
  solid140: { Rw: 50, Lnw: 80 },
  solid160: { Rw: 52, Lnw: 78 },
  solid180: { Rw: 54, Lnw: 76 },
  solid200: { Rw: 55, Lnw: 74 },
  pk220: { Rw: 52, Lnw: 74 },
  /** Monolith 250 mm: Rw center 56 (range 55–57 ok) */
  mono250: { Rw: 56, Lnw: 74, note: 'mono250 Rw≈56 (55–57)' },
};

/**
 * MultiFrame deltas — ONLY with source marketing_placeholder + disclaimer pre_lab.
 * dRw center 10 (8..12); dLnw center 8 → Lnw decreases by 8 (6..10).
 * after.Rw = base.Rw + 10; after.Lnw = base.Lnw - 8.
 *
 * NEVER promise full Lnw norm from ceiling treatment alone.
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
  return 'solid180';
}

export function gradeRw(rw: number): HousingClass | 'below' {
  if (rw >= SP_FLOOR_NORMS.A.rwMin) return 'A';
  if (rw >= SP_FLOOR_NORMS.B.rwMin) return 'B';
  if (rw >= SP_FLOOR_NORMS.V.rwMin) return 'V';
  return 'below';
}

export function gradeLnw(lnw: number): HousingClass | 'below' {
  if (lnw <= SP_FLOOR_NORMS.A.lnwMax) return 'A';
  if (lnw <= SP_FLOOR_NORMS.B.lnwMax) return 'B';
  if (lnw <= SP_FLOOR_NORMS.V.lnwMax) return 'V';
  return 'below';
}

/**
 * Independent Rw / Lnw grades.
 * ceilingOnly → never claim Lnw SP compliance.
 * status partial when Rw meets but Lnw still fails / unclaimed.
 */
export function buildSide(
  Rw: number,
  Lnw: number,
  opts: { ceilingOnly: boolean },
): SimulationSide {
  const airClass = gradeRw(Rw);
  const measuredImpact = gradeLnw(Lnw);
  const lnwAbove60 = Lnw > 60;

  // Bare slab: Design chip «вне нормы» only when Lnw > 60; class otherwise.
  // Ceiling-only: never claim Lnw norm (impactClass stays below / unclaimed).
  const impactClaimed =
    !opts.ceilingOnly && measuredImpact !== 'below' && !lnwAbove60;
  const impactClass: HousingClass | 'below' = impactClaimed
    ? measuredImpact
    : 'below';
  let status: SimulationStatus;
  if (airClass !== 'below' && impactClaimed) {
    status = 'full';
  } else if (airClass !== 'below') {
    status = 'partial'; // Rw ok, Lnw fails or ceiling-only unclaimed
  } else {
    status = 'below';
  }

  return {
    Rw,
    Lnw,
    airClass,
    impactClass,
    impactOutOfNorm: lnwAbove60, // Design rule for chip «вне нормы»
    status,
    ceilingOnly: opts.ceilingOnly,
  };
}

export function impactChipLabel(side: SimulationSide): string {
  if (side.ceilingOnly) {
    // Never promise full Lnw norm from ceiling alone
    return side.impactOutOfNorm ? 'вне нормы' : 'не нормируется потолком';
  }
  if (side.impactOutOfNorm) return 'вне нормы';
  return side.impactClass === 'below' ? 'вне нормы' : side.impactClass;
}

function feelingFromSide(side: SimulationSide, user?: ComfortLevel): ComfortLevel {
  if (side.status === 'full' && side.airClass === 'A') return 'quiet';
  if (side.airClass === 'A' || side.airClass === 'B') return 'ok';
  if (side.Lnw >= 74 || side.Rw < 52) return user === 'quiet' ? 'ok' : 'bothers';
  return user ?? 'ok';
}

export function buildSimulation(answers: SessionAnswers): SimulationEstimate {
  const preset = resolveSlabPreset(answers.room.floorSlab);
  const base = SLABS_BARE[preset];

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
    deltaRange: {
      Rw: MULTIFRAME_PLACEHOLDER.dRwRange,
      Lnw: MULTIFRAME_PLACEHOLDER.dLnwRange,
    },
    source: MULTIFRAME_PLACEHOLDER.source,
    disclaimer: MULTIFRAME_PLACEHOLDER.disclaimer,
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
