/**
 * Build room-specific audio shape from receiving L2 bands + stem calibration.
 *
 * Stems in public/audio are already «До through wall». Shape only:
 * - relative room loudness (mostly cuts),
 * - MultiFrame После: one broadband Δ(dBA) only (stems already through-wall;
 *   applying full ΔL(f) EQ on top double-cut / killed the demo).
 * Never re-EQ the stem toward the model spectrum on «До» — that brightened muffled files.
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
  /** Broadband room offset vs authored stem level (dB) — До. */
  beforeGainDb: number;
  /**
   * Broadband После cut ≈ A-weighted L2_after − L2_before (dB, ≤ 0).
   * This is the only overall loudness drop — do not also apply full band Δ as EQ.
   */
  afterGainDb: number;
  /** Always zeros: stem timbre is already through-wall. */
  beforeEqDb: number[];
  /**
   * Reserved for lab-shaped ΔL(f). Currently zeros — stems are already muffled;
   * peaking MultiFrame EQ stacked with afterGain made «После» too quiet.
   */
  deltaEqDb: number[];
  /** Target A-weighted levels used for UI honesty / debug. */
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
 * Map received-room dBA → playback offset from authored stem level.
 * Stems ≈ ref for that group. Good (quiet) rooms must cut almost 1:1 — a thick
 * monolith office must not play the stem at near-full authored loudness.
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
  const { targetBeforeDb, targetAfterDb } = pickBands(sim, group);

  const beforeEqDb = KEY_BAND_INDICES.map(() => 0);
  const afterGainDb = clamp(round1(targetAfterDb - targetBeforeDb), -10, 0);
  const deltaEqDb = KEY_BAND_INDICES.map(() => 0);

  const beforeGainDb = playbackGainForReceivedDb(targetBeforeDb, group);

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

/** @internal helpers for tests */
export function assertSpectrumAligned(levels: readonly number[]): boolean {
  return levels.length === SPECTRUM_HZ.length;
}

export { STEM_NORM_TARGET_DBFS, STEM_CALIBRATION } from './stemCalibration';
