/**
 * Build room-specific audio shape from receiving L2 bands + stem calibration.
 *
 * Contract:
 * - «До» = authored through-wall stem × room gain from L2_before (level only).
 * - «После» = that same «До» base × MultiFrame transfer relative to «До»
 *   (broadband ΔdBA + residual ΔL(f) shape). Never remap «После» from the
 *   sample as if it were an independent absolute level.
 */
import { SPECTRUM_HZ, clamp, round1 } from '../state/acoustic/bands';
import type { AudioPair, DerivedSimulation } from '../state/types';
import {
  KEY_BAND_INDICES,
  PLAYBACK_REF_DBA_AIR,
  PLAYBACK_REF_DBA_IMPACT,
  PLAYBACK_REF_DBA_MIXED,
  STEM_CALIBRATION,
  stemIdFromPairId,
  stemIdFromSrc,
  type StemId,
} from './stemCalibration';

export type AudioPlayGroup = 'air' | 'impact' | 'mixed';

export type RoomAudioShape = {
  stemId: StemId;
  /** Broadband room offset vs authored stem — shared «До» base for both sides. */
  beforeGainDb: number;
  /**
   * Relative После loudness vs До: L2_after_dBA − L2_before_dBA (≤ 0).
   * Applied only on the after side, on top of beforeGainDb.
   */
  afterGainDb: number;
  /** Always zeros: stem timbre is already through-wall. */
  beforeEqDb: number[];
  /**
   * Residual ΔL(f) vs the broadband afterGain: (L2_after − L2_before) − afterGainDb.
   * So at each key band, afterGain + deltaEq ≈ true band Δ (no double-count of the mean).
   */
  deltaEqDb: number[];
  targetBeforeDb: number;
  targetAfterDb: number;
};

function mixBands(a: readonly number[], b: readonly number[]): number[] {
  return a.map((v, i) => round1((v + (b[i] ?? v)) / 2));
}

function pickBands(
  sim: DerivedSimulation,
  group: AudioPlayGroup,
): { before: number[]; after: number[]; targetBeforeDb: number; targetAfterDb: number } {
  if (group === 'air') {
    return {
      before: sim.receivedAirBands.before,
      after: sim.receivedAirBands.after,
      targetBeforeDb: sim.receivedAirDb.before,
      targetAfterDb: sim.receivedAirDb.after,
    };
  }
  if (group === 'impact') {
    return {
      before: sim.receivedImpactBands.before,
      after: sim.receivedImpactBands.after,
      targetBeforeDb: sim.receivedImpactDb.before,
      targetAfterDb: sim.receivedImpactDb.after,
    };
  }
  const before = mixBands(sim.receivedAirBands.before, sim.receivedImpactBands.before);
  const after = mixBands(sim.receivedAirBands.after, sim.receivedImpactBands.after);
  return {
    before,
    after,
    targetBeforeDb: round1((sim.receivedAirDb.before + sim.receivedImpactDb.before) / 2),
    targetAfterDb: round1((sim.receivedAirDb.after + sim.receivedImpactDb.after) / 2),
  };
}

function playbackRefDb(group: AudioPlayGroup): number {
  if (group === 'impact') return PLAYBACK_REF_DBA_IMPACT;
  if (group === 'mixed') return PLAYBACK_REF_DBA_MIXED;
  return PLAYBACK_REF_DBA_AIR;
}

/**
 * Map received-room dBA → playback offset from authored stem level («До» only).
 */
export function playbackGainForReceivedDb(
  receivedDba: number,
  group: AudioPlayGroup = 'air',
): number {
  const delta = receivedDba - playbackRefDb(group);
  if (delta <= 0) return clamp(round1(delta * 0.95), -16, 0);
  return clamp(round1(delta * 0.3), 0, 4);
}

export function buildRoomAudioShape(
  sim: DerivedSimulation,
  group: AudioPlayGroup,
  stemId: StemId,
): RoomAudioShape {
  void STEM_CALIBRATION[stemId];
  const { before, after, targetBeforeDb, targetAfterDb } = pickBands(sim, group);

  // «До» level from this room — shared base for both buttons.
  const beforeGainDb = playbackGainForReceivedDb(targetBeforeDb, group);
  const beforeEqDb = KEY_BAND_INDICES.map(() => 0);

  // «После» = «До» + relative MultiFrame transfer (never an independent absolute remap).
  const afterGainDb = clamp(round1(targetAfterDb - targetBeforeDb), -14, -3);
  const deltaEqDb = KEY_BAND_INDICES.map((i) => {
    const bandDelta = (after[i] ?? 0) - (before[i] ?? 0);
    // Residual around broadband so total ≈ band Δ, without counting the mean twice.
    return clamp(round1(bandDelta - afterGainDb), -10, 3);
  });

  return {
    stemId,
    beforeGainDb,
    afterGainDb,
    beforeEqDb,
    deltaEqDb,
    targetBeforeDb,
    targetAfterDb,
  };
}

export function buildRoomAudioShapeForPair(
  sim: DerivedSimulation,
  pair: Pick<AudioPair, 'id' | 'group' | 'beforeSrc'>,
): RoomAudioShape {
  const stemId = pair.beforeSrc
    ? stemIdFromSrc(pair.beforeSrc)
    : stemIdFromPairId(pair.id);
  return buildRoomAudioShape(sim, pair.group, stemId);
}

/** Effective cut at a key band ≈ afterGain + residual (for checks / debug). */
export function effectiveAfterBandDb(shape: RoomAudioShape): number[] {
  return shape.deltaEqDb.map((d) => round1(shape.afterGainDb + d));
}

export function assertSpectrumAligned(levels: readonly number[]): boolean {
  return levels.length === SPECTRUM_HZ.length;
}

export { STEM_NORM_TARGET_DBFS, STEM_CALIBRATION } from './stemCalibration';
