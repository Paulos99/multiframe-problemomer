import { useCallback, useEffect, useRef, useState } from 'react';
import { parseStubSrc, type StubKind, type StubScene } from './demoAudio';

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!sharedCtx) sharedCtx = new AudioContext();
  return sharedCtx;
}

/** Soft procedural demo: impact thumps or muffled speech-like noise */
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

  const nodes: AudioNode[] = [master];
  const duration = scene === 'steps' ? 2.4 : 2.8;
  const damp = kind === 'after' ? 0.35 : 1;

  if (scene === 'steps') {
    const beats = [0, 0.45, 0.9, 1.35, 1.8];
    for (const t of beats) {
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
      nodes.push(osc, g, f);
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
    nodes.push(src, f);
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
  const stopRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setActiveId(null);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const play = useCallback(
    async (id: string, src: string) => {
      stop();
      const stub = parseStubSrc(src);
      const ctx = getCtx();
      if (ctx.state === 'suspended') await ctx.resume();

      setActiveId(id);
      if (stub) {
        stopRef.current = playStub(ctx, stub.kind, stub.scene, () => {
          setActiveId(null);
          stopRef.current = null;
        });
        return;
      }

      // Future: real mapped files
      const audio = new Audio(src);
      audio.onended = () => {
        setActiveId(null);
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
      }
    },
    [stop],
  );

  return { activeId, play, stop };
}
