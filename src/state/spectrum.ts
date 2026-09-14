/**
 * Frequency curves shaped like field measurements
 * (https://pavelantsibor.github.io/zamer_graph/, потолок: перекрытие vs MultiFrame).
 * Band uplift is re-centered to room-model Δ (marketing_placeholder / pre_lab).
 */
export const SPECTRUM_HZ = [
  100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500,
  3150, 4000, 5000,
] as const;

/** Airborne isolation R(f), dB — перекрытие */
const AIR_BEFORE = [
  31.7, 35.6, 40.5, 42.7, 44.8, 48.9, 48.5, 49.4, 51.9, 51.9, 52.2, 50.4, 56.6,
  60.9, 63.3, 63.8, 67.3, 67.5,
] as const;

/** Airborne isolation R(f), dB — MultiFrame */
const AIR_AFTER_RAW = [
  33.2, 38.6, 39.8, 44.3, 46.0, 52.3, 50.9, 52.8, 55.6, 52.7, 54.6, 53.3, 58.8,
  62.4, 65.7, 66.4, 69.4, 69.3,
] as const;

/** Impact isolation (higher = better), measurement shape — перекрытие */
const IMPACT_BEFORE = [
  1.0, 2.1, 6.8, 16.4, 19.1, 27.9, 24.0, 32.6, 35.2, 34.7, 36.6, 38.3, 43.0,
  41.7, 40.4, 35.5, 43.9, 46.8,
] as const;

/** Impact isolation — MultiFrame */
const IMPACT_AFTER_RAW = [
  -0.9, 7.7, 5.4, 18.4, 25.4, 27.8, 35.4, 36.6, 37.2, 39.4, 39.3, 41.5, 43.5,
  44.3, 43.5, 35.7, 41.1, 45.0,
] as const;

function mean(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Keep measurement shape of improvement; center mean uplift on targetDelta.
 */
function applyCenteredDelta(
  before: readonly number[],
  afterRaw: readonly number[],
  targetDelta: number,
): number[] {
  const shapeDiff = afterRaw.map((v, i) => v - (before[i] ?? v));
  const shapeMean = mean(shapeDiff);
  return before.map((v, i) => {
    const shaped = targetDelta + ((shapeDiff[i] ?? 0) - shapeMean);
    return Math.round((v + shaped) * 10) / 10;
  });
}

export interface SpectrumSeries {
  hz: readonly number[];
  before: number[];
  after: number[];
  /** Mean uplift shown on the curve (matches model Δ center) */
  targetDelta: number;
}

export function buildAirSpectrum(deltaRw: number): SpectrumSeries {
  return {
    hz: SPECTRUM_HZ,
    before: [...AIR_BEFORE],
    after: applyCenteredDelta(AIR_BEFORE, AIR_AFTER_RAW, deltaRw),
    targetDelta: deltaRw,
  };
}

/** Impact chart uses isolation ↑; model ΔLnw is negative → uplift = |ΔLnw|. */
export function buildImpactSpectrum(deltaLnw: number): SpectrumSeries {
  const uplift = Math.abs(deltaLnw);
  return {
    hz: SPECTRUM_HZ,
    before: [...IMPACT_BEFORE],
    after: applyCenteredDelta(IMPACT_BEFORE, IMPACT_AFTER_RAW, uplift),
    targetDelta: uplift,
  };
}
