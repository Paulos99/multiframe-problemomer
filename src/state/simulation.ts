/**
 * Final Backend stub — locked deriveSimulation (schemaVersion 1 additive).
 *
 * SlabKey: 140|160|180|200|pk220|mono250
 * SLABS: 140 50/80; 160 52/78; 180 54/76 default; 200 55/74; pk220 52/74; mono250 56/74
 * NORMS: A 54/55; B 52/58; V 50/60
 * DELTA: {Rw:10, Lnw:-8}
 * grade: both indices; partial when Rw ok Lnw not
 * classLabel A|B|V|below + classStatus ok|partial|below
 */
import type {
  ClassLabel,
  ClassStatus,
  ComfortLevel,
  DerivedSimSide,
  DerivedSimulation,
  FloorSlab,
  SessionAnswers,
  SlabKey,
} from './types';
import { SIMULATION_BADGE } from './types';

export type { SlabKey };

export const SLABS: Record<SlabKey, { Rw: number; Lnw: number }> = {
  '140': { Rw: 50, Lnw: 80 },
  '160': { Rw: 52, Lnw: 78 },
  '180': { Rw: 54, Lnw: 76 }, // DEFAULT
  '200': { Rw: 55, Lnw: 74 },
  pk220: { Rw: 52, Lnw: 74 },
  mono250: { Rw: 56, Lnw: 74 },
};

/** NORMS: A 54/55; B 52/58; V 50/60 (Rw min / Lnw max) */
export const NORMS = {
  A: { Rw: 54, Lnw: 55 },
  B: { Rw: 52, Lnw: 58 },
  V: { Rw: 50, Lnw: 60 },
} as const;

/** DELTA: {Rw:10, Lnw:-8} — marketing_placeholder / pre_lab only */
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

/**
 * Map UI slab type/thickness → SlabKey.
 * hollow≈pk220, monolith≈mono250 or thickness; unknown→180
 */
export function resolveSlabKey(slab?: FloorSlab): SlabKey {
  if (slab?.key) return slab.key;

  // Legacy preset aliases (solid140 → 140, …)
  const preset = slab?.preset as string | undefined;
  if (preset) {
    if (preset === 'solid140' || preset === '140') return '140';
    if (preset === 'solid160' || preset === '160') return '160';
    if (preset === 'solid180' || preset === '180') return '180';
    if (preset === 'solid200' || preset === '200') return '200';
    if (preset === 'pk220') return 'pk220';
    if (preset === 'mono250') return 'mono250';
  }

  if (slab?.type === 'hollow') return 'pk220';

  if (slab?.type === 'concrete') {
    const t = slab.thicknessMm;
    if (t == null) return 'mono250'; // monolith≈mono250
    if (t <= 150) return '140';
    if (t <= 170) return '160';
    if (t <= 190) return '180';
    if (t <= 225) return '200';
    return 'mono250';
  }

  // wood / unknown / missing → 180 default
  return '180';
}

/** @deprecated use resolveSlabKey */
export const resolveSlabPreset = resolveSlabKey;

/**
 * grade: both indices must meet for ok;
 * partial when Rw ok for a class but Lnw does not;
 * classLabel A|B|V|below + classStatus ok|partial|below
 */
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
        label: cls === 'A' ? 'премиум-комфорт' : cls === 'B' ? 'комфорт' : 'базовый',
      };
    }
  }

  // Rw ok for some class, Lnw not → partial; keep best Rw class as classLabel
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
    label: 'ниже базового класса',
  };
}

export function buildSide(Rw: number, Lnw: number): DerivedSimSide {
  const { classLabel, classStatus, label } = grade(Rw, Lnw);
  return { Rw, Lnw, classLabel, classStatus, label };
}

function feelingFromSide(side: DerivedSimSide, user?: ComfortLevel): ComfortLevel {
  if (side.classStatus === 'ok' && side.classLabel === 'A') return 'quiet';
  if (side.classStatus === 'ok' && side.classLabel === 'B') return 'ok';
  if (side.classStatus === 'partial') return 'ok';
  if (side.Lnw >= 74 || side.Rw < 52) return user === 'quiet' ? 'ok' : 'bothers';
  return user ?? 'ok';
}

/** Locked stub: deriveSimulation */
export function deriveSimulation(answers: SessionAnswers): DerivedSimulation {
  const slabKey = resolveSlabKey(answers.room.floorSlab);
  const base = SLABS[slabKey];

  const before = buildSide(base.Rw, base.Lnw);
  const after = buildSide(base.Rw + DELTA.Rw, base.Lnw + DELTA.Lnw);

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
    feelingBefore: feelingFromSide(before, answers.current?.comfortLevel),
    feelingAfter: feelingFromSide(after, answers.current?.comfortLevel),
    honestLines: [
      'Воздух после MultiFrame ближе к комфорту — потолок помогает.',
      'Удар смягчается, но полной нормы Lnw потолком нет: пол у соседа сверху часто всё ещё нужен.',
    ],
  };
}

/** @deprecated alias — prefer deriveSimulation */
export const buildSimulation = deriveSimulation;

/** @deprecated */
export const SLABS_BY_THICKNESS = SLABS;
export const SLABS_BARE = SLABS;
export const CLASS_THRESHOLDS = {
  A: { rwMin: NORMS.A.Rw, lnwMax: NORMS.A.Lnw },
  B: { rwMin: NORMS.B.Rw, lnwMax: NORMS.B.Lnw },
  V: { rwMin: NORMS.V.Rw, lnwMax: NORMS.V.Lnw },
} as const;
export const MULTIFRAME_PLACEHOLDER = {
  dRw: DELTA.Rw,
  dLnw: -DELTA.Lnw,
  dRwRange: SIM_META.deltaRange.Rw,
  dLnwRange: SIM_META.deltaRange.Lnw,
  source: SIM_META.source,
  disclaimer: SIM_META.disclaimer,
};

/** Cyrillic display for housing class chips (UI only; canon stays A|B|V). */
export const CLASS_CYR: Record<'A' | 'B' | 'V', string> = {
  A: 'А',
  B: 'Б',
  V: 'В',
};

export function classCyr(label: 'A' | 'B' | 'V' | 'below'): string {
  if (label === 'below') return '';
  return CLASS_CYR[label];
}

/** Chip helpers: independent Воздух / Удар (Design). Cyrillic А/Б/В for UI. */
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
