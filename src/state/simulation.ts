/**
 * Simulation facade: Trofimov + frequency model + in-room source layer.
 * MultiFrame Δ is marketing_placeholder / pre_lab (invented, physically shaped).
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
} from './types';
import { SIMULATION_BADGE } from './types';
import { buildConstruction, resolveSlab } from './acoustic/construction';
import { applyMultiFrame } from './acoustic/multiframe';
import { buildReceiving, quietFromReceivedAir, quietFromReceivedImpact } from './acoustic/receiving';
import { seriesFromBands } from './spectrum';

export type { SlabKey };

/** Trofimov bare-slab anchors (no floor, no drum) — lookup / debug. */
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

/** Typical centre — not applied as a flat delta anymore. */
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

export function resolveSlabKey(room: RoomAnswers): SlabKey {
  return resolveSlab(room).slabKey;
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

function feelingFromReceived(
  side: DerivedSimSide,
  receivedAir: number,
  loudNeighbors: boolean,
): ComfortLevel {
  if (loudNeighbors || receivedAir >= 58) {
    if (side.classLabel === 'A' && side.classStatus === 'ok') return 'ok';
    return 'bothers';
  }
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

export function airQuietPct(Rw: number): number {
  return clampPct(((Rw - 45) / (70 - 45)) * 100);
}

export function impactQuietPct(Lnw: number): number {
  return clampPct(((82 - Lnw) / (82 - 58)) * 100);
}

export function deriveSimulation(answers: SessionAnswers): DerivedSimulation {
  const constr = buildConstruction(answers.room);
  const mf = applyMultiFrame(constr);
  const rec = buildReceiving(answers.room, constr, mf);
  const loudNeighbors =
    answers.room.noisyNeighbors === 'often_noisy' ||
    answers.room.noisyNeighbors === 'sometimes_noisy';

  const recAirBefore = rec.airDba.before;
  const recAirAfter = rec.airDba.after;
  const recImpBefore = rec.impactDba.before;
  const recImpAfter = rec.impactDba.after;

  const before = buildSide(constr.Rw, constr.Lnw);
  const after = buildSide(mf.Rw, mf.Lnw);

  const airAbs = Math.abs(recAirBefore - recAirAfter);
  const impactAbs = Math.abs(recImpBefore - recImpAfter);

  return {
    before,
    after,
    delta: { Rw: mf.deltaRw, Lnw: mf.deltaLnw },
    housingClass: after.classLabel,
    source: SIM_META.source,
    disclaimer: SIM_META.disclaimer,
    deltaRange: mf.deltaRange,
    uiLabel: SIMULATION_BADGE,
    slabKey: constr.resolved.slabKey,
    feelingBefore: feelingFromReceived(before, recAirBefore, loudNeighbors),
    feelingAfter: feelingFromReceived(after, recAirAfter, false),
    honestLines: [
      'Индексы Rw и Lnw — про перекрытие, пол сверху и тип дома, не про громкость соседей.',
      'Громкость в комнате считается по спектру: как шумят сверху, тип комнаты, площадь и мебель.',
      'Удар: потолок смягчает; полную норму часто закрывает пол у соседа сверху.',
    ],
    perceivedAirPct: perceivedReductionPct(airAbs),
    perceivedImpactPct: perceivedReductionPct(impactAbs),
    airSpectrum: seriesFromBands(constr.R, mf.R, mf.deltaRw),
    impactSpectrum: seriesFromBands(
      constr.impactIsolation,
      mf.impactIsolation,
      Math.abs(mf.deltaLnw),
    ),
    quietAirBefore: quietFromReceivedAir(recAirBefore),
    quietAirAfter: quietFromReceivedAir(recAirAfter),
    quietImpactBefore: quietFromReceivedImpact(recImpBefore),
    quietImpactAfter: quietFromReceivedImpact(recImpAfter),
    receivedAirDb: { before: recAirBefore, after: recAirAfter },
    receivedImpactDb: { before: recImpBefore, after: recImpAfter },
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

export function airClassFor(Rw: number): ClassLabel {
  if (Rw >= NORMS.A.Rw) return 'A';
  if (Rw >= NORMS.B.Rw) return 'B';
  if (Rw >= NORMS.V.Rw) return 'V';
  return 'below';
}

export function impactClassFor(Lnw: number): ClassLabel {
  if (Lnw <= NORMS.A.Lnw) return 'A';
  if (Lnw <= NORMS.B.Lnw) return 'B';
  if (Lnw <= NORMS.V.Lnw) return 'V';
  return 'below';
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
