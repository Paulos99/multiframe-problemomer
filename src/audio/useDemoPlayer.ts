import { useCallback, useEffect, useRef, useState } from 'react';
import { parseStubSrc, type StubKind, type StubScene } from './demoAudio';

export type AudioPlayGroup = 'air' | 'impact' | 'mixed';

export type AudioPlayOptions = {
  side: 'before' | 'after';
  group: AudioPlayGroup;
  /** Oriented MultiFrame ΔRw for this room (positive = quieter air). */
  deltaRw: number;
  /** Oriented |ΔLnw| for this room (positive = quieter impact). */
  deltaLnw: number;
};

let sharedCtx: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function getCtx(): AudioContext {
  if (!sharedCtx) sharedCtx = new AudioContext();
  return sharedCtx;
}

function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Demo contrast is intentionally exaggerated so the sell difference is obvious
 * on laptop speakers / phone (release blocker). UI shows «контраст усилен».
 * BEFORE ≈ loud; AFTER ≈ clearly quieter (~−16…−20 dB level + darker filter).
 * Kept only as fallback for legacy `stub:` URLs.
 */
const DEMO_CONTRAST = {
  master: 0.5,
  beforePeak: 0.9,
  afterPeak: 0.11,
  beforeNoise: 0.34,
  afterNoise: 0.055,
} as const;

function playStub(
  ctx: AudioContext,
  kind: StubKind,
  scene: StubScene,
  onEnd: () => void,
): () => void {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = DEMO_CONTRAST.master;
  master.connect(ctx.destination);
  const duration = scene === 'steps' ? 2.4 : 2.8;
  const isAfter = kind === 'after';
  const peak = isAfter ? DEMO_CONTRAST.afterPeak : DEMO_CONTRAST.beforePeak;

  if (scene === 'steps') {
    for (const t of [0, 0.45, 0.9, 1.35, 1.8]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = isAfter ? 120 : 520;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90 + Math.random() * 30, now + t);
      g.gain.setValueAtTime(0.0001, now + t);
      g.gain.exponentialRampToValueAtTime(peak, now + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.28);
      osc.connect(f);
      f.connect(g);
      g.connect(master);
      osc.start(now + t);
      osc.stop(now + t + 0.32);
    }
  } else {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const noiseAmp = isAfter ? DEMO_CONTRAST.afterNoise : DEMO_CONTRAST.beforeNoise;
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((Math.PI * i) / bufferSize);
      const wobble = Math.sin(i / (ctx.sampleRate / (isAfter ? 70 : 160)));
      data[i] = (Math.random() * 2 - 1) * noiseAmp * env * wobble;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = isAfter ? 380 : 1400;
    f.Q.value = isAfter ? 0.55 : 0.85;
    src.connect(f);
    f.connect(master);
    src.start(now);
    src.stop(now + duration);
  }

  const timer = window.setTimeout(onEnd, duration * 1000 + 50);
  return () => {
    window.clearTimeout(timer);
    try {
      master.disconnect();
    } catch {
      /* ignore */
    }
  };
}

async function loadBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const hit = bufferCache.get(url);
  if (hit) return hit;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`audio fetch ${res.status}`);
  const raw = await res.arrayBuffer();
  const buf = await ctx.decodeAudioData(raw.slice(0));
  bufferCache.set(url, buf);
  return buf;
}

/**
 * Case-oriented After: cut level from room Δ and darken spectrum (ASSUMPTION EQ).
 * Air → more mid/HF cut (speech). Impact → more LF softening. Mixed → blend.
 */
function afterProcess(
  ctx: AudioContext,
  opts: AudioPlayOptions,
): { input: AudioNode; output: AudioNode; teardown: () => void } {
  const airDb = Math.max(6, Math.min(14, Math.abs(opts.deltaRw)));
  const impDb = Math.max(4, Math.min(12, Math.abs(opts.deltaLnw)));

  let attenDb: number;
  let lowpassHz: number;
  let highShelfDb: number;

  if (opts.group === 'air') {
    attenDb = airDb;
    lowpassHz = 2200;
    highShelfDb = -airDb * 0.55;
  } else if (opts.group === 'impact') {
    attenDb = impDb;
    lowpassHz = 900;
    highShelfDb = -impDb * 0.35;
  } else {
    attenDb = (airDb + impDb) / 2;
    lowpassHz = 1400;
    highShelfDb = -attenDb * 0.45;
  }

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = lowpassHz;
  lp.Q.value = 0.7;

  const shelf = ctx.createBiquadFilter();
  shelf.type = 'highshelf';
  shelf.frequency.value = 1800;
  shelf.gain.value = highShelfDb;

  const g = ctx.createGain();
  g.gain.value = dbToGain(-attenDb);

  lp.connect(shelf);
  shelf.connect(g);

  return {
    input: lp,
    output: g,
    teardown: () => {
      try {
        lp.disconnect();
        shelf.disconnect();
        g.disconnect();
      } catch {
        /* ignore */
      }
    },
  };
}

function playStem(
  ctx: AudioContext,
  buffer: AudioBuffer,
  opts: AudioPlayOptions | undefined,
  onEnd: () => void,
): () => void {
  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(ctx.destination);

  let teardownProcess: (() => void) | null = null;
  const isAfter = opts?.side === 'after';

  if (isAfter && opts) {
    const chain = afterProcess(ctx, opts);
    src.connect(chain.input);
    chain.output.connect(master);
    teardownProcess = chain.teardown;
  } else {
    src.connect(master);
  }

  src.onended = () => onEnd();
  src.start(0);

  return () => {
    try {
      src.stop();
    } catch {
      /* already stopped */
    }
    try {
      src.disconnect();
      master.disconnect();
    } catch {
      /* ignore */
    }
    teardownProcess?.();
  };
}

export function useDemoPlayer() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const stopRef = useRef<(() => void) | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAt = useRef(0);
  const durationMs = useRef(2400);

  const clearRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    clearRaf();
    setActiveId(null);
    setProgress(0);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const play = useCallback(
    async (id: string, src: string, opts?: AudioPlayOptions) => {
      stop();
      const stub = parseStubSrc(src);
      const ctx = getCtx();
      if (ctx.state === 'suspended') await ctx.resume();

      startedAt.current = performance.now();
      setActiveId(id);
      setProgress(prefersReducedMotion() ? 0.5 : 0);

      const startProgress = (ms: number) => {
        durationMs.current = ms;
        if (prefersReducedMotion()) return;
        const tick = () => {
          const p = Math.min(1, (performance.now() - startedAt.current) / durationMs.current);
          setProgress(p);
          if (p < 1 && stopRef.current) {
            rafRef.current = requestAnimationFrame(tick);
          }
        };
        rafRef.current = requestAnimationFrame(tick);
      };

      if (stub) {
        durationMs.current = stub.scene === 'talk' ? 2800 : 2400;
        startProgress(durationMs.current);
        stopRef.current = playStub(ctx, stub.kind, stub.scene, () => {
          clearRaf();
          setActiveId(null);
          setProgress(0);
          stopRef.current = null;
        });
        return;
      }

      try {
        const buffer = await loadBuffer(ctx, src);
        startProgress(buffer.duration * 1000);
        stopRef.current = playStem(ctx, buffer, opts, () => {
          clearRaf();
          setActiveId(null);
          setProgress(0);
          stopRef.current = null;
        });
      } catch {
        setActiveId(null);
        setProgress(0);
        stopRef.current = null;
      }
    },
    [stop],
  );

  return { activeId, progress, play, stop };
}
