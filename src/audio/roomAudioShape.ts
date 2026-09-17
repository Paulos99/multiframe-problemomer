/**
 * Build room-specific audio shape from receiving L2 bands + stem calibration.
 */
import { SPECTRUM_HZ, clamp, mean, round1 } from '../state/acoustic/bands';
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
  /** Broadband gain after stem RMS normalize (dB). */
  beforeGainDb: number;
  /** Peaking EQ vs stem for in-room before spectrum (dB at KEY_BAND_INDICES). */
  beforeEqDb: number[];
  /** Peaking EQ for MultiFrame transfer ΔL(f) = after − before (dB). */
  deltaEqDb: number[];
  /** Target A-weighted levels used for UI honesty / debug. */
  targetBeforeDb: number;
  targetAfterDb: number;
};

function mixBands(a: readonly number[], b: readonly number[]): number[] {
  return a.map((v, i) => round1((v + (b[i] ?? v)) / 2));
}

function relShape(levels: readonly number[]): number[] {
  const m = mean(levels);
  return levels.map((v) => round1(v - m));
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
 * Map received-room dBA → playback gain after stem is normalized to STEM_NORM_TARGET_DBFS.
 * Clamped so phones stay usable; still varies clearly across rooms.
 */
export function playbackGainForReceivedDb(receivedDba: number): number {
  return clamp(receivedDba - PLAYBACK_REF_DBA, -16, 10);
}

export function buildRoomAudioShape(
  sim: DerivedSimulation,
  group: AudioPlayGroup,
  stemId: StemId,
): RoomAudioShape {
  const cal = STEM_CALIBRATION[stemId];
  const { before, after, targetBeforeDb, targetAfterDb } = pickBands(sim, group);

  const targetRel = relShape(before);
  const stemRel = cal.bandRelDb;
  const beforeEqDb = KEY_BAND_INDICES.map((i) =>
    clamp(round1((targetRel[i] ?? 0) - (stemRel[i] ?? 0)), -10, 10),
  );
  const deltaEqDb = KEY_BAND_INDICES.map((i) =>
    clamp(round1((after[i] ?? 0) - (before[i] ?? 0)), -18, 4),
  );

  // Stem normalize offset is applied in the player from rmsDbFs → STEM_NORM_TARGET_DBFS.
  const beforeGainDb = playbackGainForReceivedDb(targetBeforeDb);

  return {
    stemId,
    beforeGainDb,
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
