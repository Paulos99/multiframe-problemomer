/**
 * Frozen stem calibration from offline analysis of public/audio/*.mp3
 * (miniaudio + STFT → 1/3-oct relative energy, 2026-09-17).
 */
import { SPECTRUM_HZ } from '../state/acoustic/bands';

export type StemId = 'talk' | 'stomp' | 'vacuum';

export type StemCalibration = {
  /** Measured file RMS in dBFS (full-scale digital). */
  rmsDbFs: number;
  /** Measured peak in dBFS. */
  peakDbFs: number;
  /** Relative 1/3-oct band energy vs mean (dB), aligned to SPECTRUM_HZ. */
  bandRelDb: readonly number[];
};

export const STEM_CALIBRATION: Record<StemId, StemCalibration> = {
  talk: {
    rmsDbFs: -33.5,
    peakDbFs: -15.0,
    bandRelDb: [
      -9.2, -10.9, -0.8, 6.4, 5.6, 2.2, 7.0, 3.0, -4.8, -15.5, -23.0, -38.4, -43.9,
      -48.1, -55.4, -59.6, -63.5, -65.6,
    ],
  },
  stomp: {
    rmsDbFs: -26.6,
    peakDbFs: -7.4,
    bandRelDb: [
      6.2, 4.9, 7.6, 5.7, 0.1, -9.3, -15.2, -19.3, -26.2, -32.7, -34.8, -42.0, -50.7,
      -55.2, -60.8, -64.2, -64.7, -64.3,
    ],
  },
  vacuum: {
    rmsDbFs: -33.6,
    peakDbFs: -14.6,
    bandRelDb: [
      -1.8, -2.2, 6.1, 6.8, 2.7, -3.5, -4.7, 6.4, -5.4, -8.9, -8.5, -6.6, -16.4,
      -18.0, -21.5, -27.1, -26.6, -31.9,
    ],
  },
};

/** Normalize decoded stems toward this RMS (dBFS) before room gain. */
export const STEM_NORM_TARGET_DBFS = -20;

/**
 * Received-room dBA that should play at a comfortable demo loudness
 * after stem normalization (ASSUMPTION playback map).
 */
export const PLAYBACK_REF_DBA = 52;

/** Key 1/3-oct indices used for peaking EQ (subset of SPECTRUM_HZ). */
export const KEY_BAND_INDICES = [1, 3, 5, 7, 10, 13, 15] as const;

export function keyBandHz(): number[] {
  return KEY_BAND_INDICES.map((i) => SPECTRUM_HZ[i]!);
}

export function stemIdFromPairId(pairId: string): StemId {
  if (pairId.includes('stomp') || pairId.includes('impact')) return 'stomp';
  if (pairId.includes('vacuum') || pairId.includes('mixed')) return 'vacuum';
  return 'talk';
}

export function stemIdFromSrc(src: string): StemId {
  if (src.includes('stomp')) return 'stomp';
  if (src.includes('vacuum')) return 'vacuum';
  return 'talk';
}
