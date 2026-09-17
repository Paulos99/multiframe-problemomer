/**
 * Frozen stem calibration from offline analysis of public/audio/*.mp3
 * (miniaudio stream + STFT → 1/3-oct relative energy, 2026-09-17).
 *
 * Important: these MP3s are already authored as «through-wall / upstairs»
 * references — quiet RMS and heavy HF roll-off (talk HF−mid ≈ −60 dB).
 * They are NOT dry source recordings. Do not normalize them up or brighten
 * them with before-EQ; that made «До» loud and «звонким».
 */
import { SPECTRUM_HZ } from '../state/acoustic/bands';

export type StemId = 'talk' | 'stomp' | 'vacuum';

export type StemCalibration = {
  /** Measured file RMS in dBFS (full-scale digital). */
  rmsDbFs: number;
  /** Measured peak in dBFS. */
  peakDbFs: number;
  /**
   * Authored trim only (≤ 0). Never boost quiet stems toward a common target —
   * talk/vacuum already sit near −33 dBFS by design; stomp is hotter.
   */
  trimDb: number;
  /** Relative 1/3-oct band energy vs mean (dB), aligned to SPECTRUM_HZ. */
  bandRelDb: readonly number[];
};

export const STEM_CALIBRATION: Record<StemId, StemCalibration> = {
  talk: {
    rmsDbFs: -33.5,
    peakDbFs: -15.0,
    trimDb: 0,
    bandRelDb: [
      -9.2, -10.9, -0.8, 6.4, 5.6, 2.2, 7.0, 3.0, -4.8, -15.5, -23.0, -38.4, -43.9,
      -48.1, -55.4, -59.6, -63.5, -65.6,
    ],
  },
  stomp: {
    rmsDbFs: -26.6,
    peakDbFs: -7.4,
    // Soften hot impact stem toward talk/vacuum without lifting quiet files.
    trimDb: -4,
    bandRelDb: [
      6.2, 4.9, 7.6, 5.7, 0.1, -9.3, -15.2, -19.3, -26.2, -32.7, -34.8, -42.0, -50.7,
      -55.2, -60.8, -64.2, -64.7, -64.3,
    ],
  },
  vacuum: {
    rmsDbFs: -33.6,
    peakDbFs: -14.6,
    trimDb: 0,
    bandRelDb: [
      -1.8, -2.2, 6.1, 6.8, 2.7, -3.5, -4.7, 6.4, -5.4, -8.9, -8.5, -6.6, -16.4,
      -18.0, -21.5, -27.1, -26.6, -31.9,
    ],
  },
};

/**
 * @deprecated Stems are already through-wall; do not normalize up to a target.
 * Kept only so old imports do not break — playback ignores this.
 */
export const STEM_NORM_TARGET_DBFS = -33;

/**
 * Stem authored loudness ≈ this received air dBA (typical annoying upstairs talk).
 * Quieter rooms cut almost 1:1 from here; louder rooms only gently boost.
 */
export const PLAYBACK_REF_DBA_AIR = 56;
/** Stem stomp ≈ this impact dBA — impact L2 sits far above air, needs its own anchor. */
export const PLAYBACK_REF_DBA_IMPACT = 74;
export const PLAYBACK_REF_DBA_MIXED = 65;

/** @deprecated Use PLAYBACK_REF_DBA_AIR — kept for old imports. */
export const PLAYBACK_REF_DBA = PLAYBACK_REF_DBA_AIR;

/** Global demo headroom (linear). Stems are already quiet; keep modest attenuation. */
export const MASTER_PLAYBACK_GAIN = 0.55;

/** Key 1/3-oct indices used for peaking EQ on «После» ΔL(f) only. */
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
