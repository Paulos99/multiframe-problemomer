/**
 * MultiFrame ΔR(f) / Δ isolation — marketing_placeholder / pre_lab.
 * Shape: zamer_graph (перекрытие vs MultiFrame) + perforation peak 100–500 Hz.
 * Mean Δ is invented until lab confirmation; never treat as a certificate.
 */
import { SPECTRUM_HZ, atHz, round0, round1 } from './bands';
import type { ConstructionResult } from './construction';
import { AIR_SHAPE_REF, IMPACT_SHAPE_REF } from './construction';
import { calibrateToLnw, calibrateToRw, iso717Lnw, iso717Rw } from './iso717';

/** zamer_graph MultiFrame airborne R(f). */
const AIR_MF_RAW = [
  33.2, 38.6, 39.8, 44.3, 46.0, 52.3, 50.9, 52.8, 55.6, 52.7, 54.6, 53.3, 58.8,
  62.4, 65.7, 66.4, 69.4, 69.3,
] as const;

const IMPACT_MF_RAW = [
  -0.9, 7.7, 5.4, 18.4, 25.4, 27.8, 35.4, 36.6, 37.2, 39.4, 39.3, 41.5, 43.5,
  44.3, 43.5, 35.7, 41.1, 45.0,
] as const;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function perforationBoost(): number[] {
  return atHz((f) => {
    if (f < 100 || f > 630) return 0;
    const t = (Math.log(f) - Math.log(100)) / (Math.log(500) - Math.log(100));
    const g = t < 0 ? 0 : t > 1 ? Math.max(0, 1 - (t - 1) * 2) : Math.sin(Math.PI * t);
    return 2.4 * g;
  });
}

function drumLift(hasDrum: boolean): number[] {
  if (!hasDrum) return SPECTRUM_HZ.map(() => 0);
  return atHz((f) => {
    if (f < 200 || f > 800) return f >= 160 && f <= 1000 ? 1 : 0;
    const t = (Math.log(f) - Math.log(200)) / (Math.log(800) - Math.log(200));
    return 3.2 * Math.sin(Math.PI * t);
  });
}

/** Target ΔRw 8…12: more help on light/thin slabs. */
export function targetDeltaRw(beforeRw: number): number {
  return round0(clamp(12 - 0.4 * (beforeRw - 50), 8, 12));
}

/** Target |ΔLnw|: 4…9 without floating floor; 2…4 with it. */
export function targetDeltaLnw(beforeLnw: number, floating: boolean): number {
  if (floating) return round0(clamp(3 + (beforeLnw - 54) * 0.05, 2, 4));
  return round0(clamp(4 + (beforeLnw - 70) * 0.5, 4, 9));
}

function scaleToMean(shape: number[], meanTarget: number): number[] {
  const m = shape.reduce((a, b) => a + b, 0) / shape.length;
  if (Math.abs(m) < 0.05) return shape.map((v) => round1(v + meanTarget));
  const k = meanTarget / m;
  return shape.map((v) => round1(v * k));
}

function isolationToLn(iso: readonly number[]): number[] {
  return iso.map((v) => round1(90 - v));
}

function lnToIsolation(ln: readonly number[]): number[] {
  return ln.map((v) => round1(90 - v));
}

export interface MultiFrameResult {
  R: number[];
  Ln: number[];
  impactIsolation: number[];
  Rw: number;
  Lnw: number;
  deltaRw: number;
  deltaLnw: number;
  deltaRange: { Rw: readonly [number, number]; Lnw: readonly [number, number] };
}

export function applyMultiFrame(before: ConstructionResult): MultiFrameResult {
  const floating = before.floor === 'floating';
  const dRwTarget = targetDeltaRw(before.Rw);
  const dLnwTarget = targetDeltaLnw(before.Lnw, floating);

  const airShape = AIR_MF_RAW.map((v, i) => v - AIR_SHAPE_REF[i]!);
  const airBoost = perforationBoost();
  const airDrum = drumLift(before.hasDrum);
  const airCombined = airShape.map((v, i) => v + (airBoost[i] ?? 0) + (airDrum[i] ?? 0));
  const airScaled = scaleToMean(airCombined, dRwTarget);
  let R = before.R.map((v, i) => round1(v + (airScaled[i] ?? 0)));
  R = calibrateToRw(R, SPECTRUM_HZ, before.Rw + dRwTarget);

  const impShape = IMPACT_MF_RAW.map((v, i) => v - IMPACT_SHAPE_REF[i]!);
  const impScaled = scaleToMean(impShape, dLnwTarget);
  let impact = before.impactIsolation.map((v, i) => round1(v + (impScaled[i] ?? 0)));
  let Ln = isolationToLn(impact);
  let afterLnw = before.Lnw - dLnwTarget;
  if (!floating) afterLnw = Math.max(afterLnw, 63);
  Ln = calibrateToLnw(Ln, SPECTRUM_HZ, afterLnw);
  impact = lnToIsolation(Ln);

  const Rw = iso717Rw(R, SPECTRUM_HZ);
  const Lnw = iso717Lnw(Ln, SPECTRUM_HZ);
  const deltaRw = Rw - before.Rw;
  const deltaLnw = Lnw - before.Lnw;

  return {
    R,
    Ln,
    impactIsolation: impact,
    Rw,
    Lnw,
    deltaRw,
    deltaLnw,
    deltaRange: {
      Rw: [Math.max(6, deltaRw - 2), Math.min(14, deltaRw + 2)] as const,
      Lnw: [
        Math.max(2, Math.abs(deltaLnw) - 2),
        Math.min(12, Math.abs(deltaLnw) + 2),
      ] as const,
    },
  };
}
