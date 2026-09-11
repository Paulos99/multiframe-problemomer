import { useCallback, useEffect, useRef, useState } from 'react';
import { parseStubSrc, type StubKind, type StubScene } from './demoAudio';

let sharedCtx: AudioContext | null = null;

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

function playStub(
  ctx: AudioContext,
  kind: StubKind,
  scene: StubScene,
  onEnd: () => void,
): () => void {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.35;
  master.connect(ctx.destination);
  const duration = scene === 'steps' ? 2.4 : 2.8;
  const damp = kind === 'after' ? 0.35 : 1;

  if (scene === 'steps') {
    for (const t of [0, 0.45, 0.9, 1.35, 1.8]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = kind === 'after' ? 180 : 420;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90 + Math.random() * 30, now + t);
      g.gain.setValueAtTime(0.0001, now + t);
      g.gain.exponentialRampToValueAtTime(0.55 * damp, now + t + 0.02);
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
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((Math.PI * i) / bufferSize);
      const wobble = Math.sin(i / (ctx.sampleRate / (kind === 'after' ? 90 : 140)));
      data[i] = (Math.random() * 2 - 1) * 0.22 * env * wobble * damp;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = kind === 'after' ? 600 : 1200;
    f.Q.value = 0.7;
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
    async (id: string, src: string) => {
      stop();
      const stub = parseStubSrc(src);
      const ctx = getCtx();
      if (ctx.state === 'suspended') await ctx.resume();

      durationMs.current = stub?.scene === 'talk' ? 2800 : 2400;
      startedAt.current = performance.now();
      setActiveId(id);
      // Reduced motion: static mid progress — play-state stays clear without bar animation.
      setProgress(prefersReducedMotion() ? 0.5 : 0);

      if (!prefersReducedMotion()) {
        const tick = () => {
          const p = Math.min(1, (performance.now() - startedAt.current) / durationMs.current);
          setProgress(p);
          if (p < 1 && stopRef.current) {
            rafRef.current = requestAnimationFrame(tick);
          }
        };
        rafRef.current = requestAnimationFrame(tick);
      }

      if (stub) {
        stopRef.current = playStub(ctx, stub.kind, stub.scene, () => {
          clearRaf();
          setActiveId(null);
          setProgress(0);
          stopRef.current = null;
        });
        return;
      }

      const audio = new Audio(src);
      audio.onended = () => {
        clearRaf();
        setActiveId(null);
        setProgress(0);
        stopRef.current = null;
      };
      stopRef.current = () => {
        audio.pause();
        audio.src = '';
      };
      try {
        await audio.play();
      } catch {
        setActiveId(null);
        setProgress(0);
      }
    },
    [stop],
  );

  return { activeId, progress, play, stop };
}
