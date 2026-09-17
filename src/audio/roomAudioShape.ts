/**
 * Build room-specific audio shape from receiving L2 bands + stem calibration.
 *
 * Stems in public/audio are already «До through wall». Shape only:
 * - relative room loudness (mostly cuts),
 * - MultiFrame После broadband + ΔL(f) cuts.
 * Never re-EQ the stem toward the model spectrum on «До» — that brightened muffled files.
 */
import { SPECTRUM_HZ, clamp, round1 } from '../state/acoustic/bands';
import type { AudioPair, DerivedSimulation } from '../state/types';
import {
  KEY_BAND_INDICES,
  PLAYBACK_REF_DBA,
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
  /** Extra broadband cut for После = targetAfter − targetBefore (dB, ≤ 0). */
  afterGainDb: number;
  /** Always zeros: stem timbre is already through-wall. */
  beforeEqDb: number[];
  /** Peaking EQ for MultiFrame transfer ΔL(f) = after − before (dB, cuts). */
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

/**
 * Map received-room dBA → playback offset from authored stem level.
 * Compressed and mostly cuts — stems already encode a typical upstairs level.
 */
export function playbackGainForReceivedDb(receivedDba: number): number {
  const raw = (receivedDba - PLAYBACK_REF_DBA) * 0.35;
  return clamp(round1(raw), -8, 1);
}

export function buildRoomAudioShape(
  sim: DerivedSimulation,
  group: AudioPlayGroup,
  stemId: StemId,
): RoomAudioShape {
  void STEM_CALIBRATION[stemId];
  const { before, after, targetBeforeDb, targetAfterDb } = pickBands(sim, group);

  // Do not reshape stem spectrum on «До» — files are already muffled through-wall.
  const beforeEqDb = KEY_BAND_INDICES.map(() => 0);
  const deltaEqDb = KEY_BAND_INDICES.map((i) =>
    clamp(round1((after[i] ?? 0) - (before[i] ?? 0)), -16, 0),
  );

  const beforeGainDb = playbackGainForReceivedDb(targetBeforeDb);
  const afterGainDb = clamp(round1(targetAfterDb - targetBeforeDb), -16, 0);

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
