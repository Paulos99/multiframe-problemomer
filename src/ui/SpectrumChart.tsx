import { useCallback, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { SpectrumSeries } from '../state/spectrum';
import { SoundPressureHelpButton } from './SoundPressureHelp';
import styles from './SpectrumChart.module.css';

type IndexBadge = {
  kind: 'Rw' | 'Lnw';
  before: number;
  after: number;
};

type Props = {
  title: string;
  subtitle: string;
  series: SpectrumSeries;
  yLabel: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** Weighted index shown in the top-right corner (до → после). */
  indexBadge?: IndexBadge;
  /** |Δ| index for «тише %» from the sound-pressure table. */
  reductionDb?: number;
  reductionPct?: number;
  /** Larger plot for desktop dashboard. */
  tall?: boolean;
};

type HoverPoint = {
  hz: number;
  before: number;
  after: number;
  x: number;
  yBefore: number;
  yAfter: number;
};

function xAt(hz: number, hzMin: number, hzMax: number, x0: number, w: number): number {
  const t =
    (Math.log10(hz) - Math.log10(hzMin)) / Math.max(1e-6, Math.log10(hzMax) - Math.log10(hzMin));
  return x0 + t * w;
}

function yAt(v: number, yMin: number, yMax: number, y0: number, h: number): number {
  const t = (v - yMin) / Math.max(1e-6, yMax - yMin);
  return y0 + h - t * h;
}

function polyline(
  hz: readonly number[],
  values: number[],
  x0: number,
  y0: number,
  w: number,
  h: number,
  yMin: number,
  yMax: number,
): string {
  const hzMin = hz[0] ?? 100;
  const hzMax = hz[hz.length - 1] ?? 5000;
  return values
    .map((v, i) => {
      const x = xAt(hz[i] ?? hzMin, hzMin, hzMax, x0, w);
      const y = yAt(v, yMin, yMax, y0, h);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function gainArea(
  hz: readonly number[],
  before: number[],
  after: number[],
  x0: number,
  y0: number,
  w: number,
  h: number,
  yMin: number,
  yMax: number,
): string {
  const hzMin = hz[0] ?? 100;
  const hzMax = hz[hz.length - 1] ?? 5000;
  const afterPts = after.map((v, i) => {
    const x = xAt(hz[i] ?? hzMin, hzMin, hzMax, x0, w);
    const y = yAt(v, yMin, yMax, y0, h);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const beforePts = before
    .map((v, i) => {
      const x = xAt(hz[i] ?? hzMin, hzMin, hzMax, x0, w);
      const y = yAt(v, yMin, yMax, y0, h);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .reverse();
  if (!afterPts.length) return '';
  return `M${afterPts.join(' L')} L${beforePts.join(' L')} Z`;
}

function niceRange(min: number, max: number): { yMin: number; yMax: number; ticks: number[] } {
  const lo = Math.floor(min / 10) * 10;
  const hiRaw = Math.ceil(max / 10) * 10;
  const span = Math.max(10, hiRaw - lo);
  const step = span > 40 ? 20 : 10;
  const steps = Math.max(2, Math.ceil((hiRaw - lo) / step));
  const hi = lo + steps * step;
  const ticks = Array.from({ length: steps + 1 }, (_, i) => lo + i * step);
  return { yMin: lo, yMax: hi, ticks };
}

function formatHz(hz: number): string {
  if (hz >= 1000) {
    const k = hz / 1000;
    return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
  }
  return String(Math.round(hz));
}

/** Sample spectrum curves at continuous Hz (log-lerp between neighbouring bands). */
function sampleAt(
  hzList: readonly number[],
  before: number[],
  after: number[],
  targetHz: number,
): { hz: number; before: number; after: number } {
  const n = hzList.length;
  if (n === 0) return { hz: targetHz, before: 0, after: 0 };
  if (n === 1) return { hz: hzList[0]!, before: before[0]!, after: after[0]! };

  if (targetHz <= hzList[0]!) {
    return { hz: hzList[0]!, before: before[0]!, after: after[0]! };
  }
  if (targetHz >= hzList[n - 1]!) {
    return { hz: hzList[n - 1]!, before: before[n - 1]!, after: after[n - 1]! };
  }

  let i = 0;
  while (i < n - 1 && hzList[i + 1]! < targetHz) i++;
  const h0 = hzList[i]!;
  const h1 = hzList[i + 1]!;
  const t =
    (Math.log10(targetHz) - Math.log10(h0)) / Math.max(1e-6, Math.log10(h1) - Math.log10(h0));
  return {
    hz: targetHz,
    before: before[i]! + t * (before[i + 1]! - before[i]!),
    after: after[i]! + t * (after[i + 1]! - after[i]!),
  };
}

export function SpectrumChart({
  title,
  subtitle,
  series,
  yLabel,
  beforeLabel = 'Сейчас',
  afterLabel = 'С MultiFrame',
  indexBadge,
  reductionDb,
  reductionPct,
  tall = false,
}: Props) {
  const padL = 28;
  const padR = 10;
  const padT = 10;
  const padB = 22;
  const W = tall ? 580 : 360;
  const H = tall ? 320 : 168;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const all = [...series.before, ...series.after];
  const rawMin = Math.min(...all);
  const rawMax = Math.max(...all);
  const { yMin, yMax, ticks: yTicks } = niceRange(rawMin, rawMax);
  const hzMin = series.hz[0] ?? 100;
  const hzMax = series.hz[series.hz.length - 1] ?? 5000;

  const beforePath = polyline(
    series.hz,
    series.before,
    padL,
    padT,
    plotW,
    plotH,
    yMin,
    yMax,
  );
  const afterPath = polyline(series.hz, series.after, padL, padT, plotW, plotH, yMin, yMax);
  const area = gainArea(
    series.hz,
    series.before,
    series.after,
    padL,
    padT,
    plotW,
    plotH,
    yMin,
    yMax,
  );

  const xLabels = [100, 250, 500, 1000, 2000, 5000];
  const [hover, setHover] = useState<HoverPoint | null>(null);
  const [active, setActive] = useState(false);
  const leaveTimer = useRef<number | null>(null);

  const onMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (leaveTimer.current != null) {
        window.clearTimeout(leaveTimer.current);
        leaveTimer.current = null;
      }
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * W;
      if (sx < padL || sx > W - padR) {
        setActive(false);
        return;
      }
      const t = (sx - padL) / plotW;
      const logHz = Math.log10(hzMin) + t * (Math.log10(hzMax) - Math.log10(hzMin));
      const targetHz = 10 ** logHz;
      const sample = sampleAt(series.hz, series.before, series.after, targetHz);
      setHover({
        hz: sample.hz,
        before: sample.before,
        after: sample.after,
        x: sx,
        yBefore: yAt(sample.before, yMin, yMax, padT, plotH),
        yAfter: yAt(sample.after, yMin, yMax, padT, plotH),
      });
      setActive(true);
    },
    [hzMax, hzMin, plotH, plotW, series.after, series.before, series.hz, yMax, yMin],
  );

  const onLeave = useCallback(() => {
    setActive(false);
    leaveTimer.current = window.setTimeout(() => {
      setHover(null);
      leaveTimer.current = null;
    }, 180);
  }, []);

  const tooltipStyle = useMemo(() => {
    if (!hover) return undefined;
    const leftPct = (hover.x / W) * 100;
    const flip = leftPct > 62;
    return {
      left: `${leftPct}%`,
      transform: flip ? 'translate(-100%, 0)' : 'translate(0, 0)',
      opacity: active ? 1 : 0,
    } as const;
  }, [hover, active]);

  return (
    <figure className={styles.wrap}>
      <figcaption className={styles.captionRow}>
        <div className={styles.captionText}>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
        {indexBadge ? (
          <div className={styles.indexBadge} aria-label={`${indexBadge.kind} до и после`}>
            <b>{indexBadge.kind}</b>
            <span>
              ≈ {Math.round(indexBadge.before)}
              <span aria-hidden> → </span>≈ {Math.round(indexBadge.after)}
            </span>
            {reductionPct != null && reductionDb != null && reductionDb > 0 ? (
              <span className={styles.quieterBadge}>
                ≈ {reductionPct}% тише
                <SoundPressureHelpButton
                  highlightDb={reductionDb}
                  label={`Таблица снижения для ${indexBadge.kind}`}
                />
              </span>
            ) : null}
          </div>
        ) : null}
      </figcaption>

      <div className={styles.plot}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${title}: ${beforeLabel} и ${afterLabel}. Чем выше линия, тем лучше изоляция. Наведите курсор, чтобы увидеть дБ по частоте.`}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          {yTicks.map((tick) => {
            const y = yAt(tick, yMin, yMax, padT, plotH);
            return (
              <g key={tick}>
                <line x1={padL} x2={W - padR} y1={y} y2={y} className={styles.grid} />
                <text x={padL - 6} y={y + 3} className={styles.tick} textAnchor="end">
                  {tick}
                </text>
              </g>
            );
          })}

          {xLabels.map((hz) => {
            const x = xAt(hz, hzMin, hzMax, padL, plotW);
            return (
              <text key={hz} x={x} y={H - 6} className={styles.tick} textAnchor="middle">
                {formatHz(hz)}
              </text>
            );
          })}

          <text
            x={11}
            y={padT + plotH / 2}
            className={styles.axisLabel}
            transform={`rotate(-90 11 ${padT + plotH / 2})`}
            textAnchor="middle"
          >
            {yLabel}
          </text>

          <path d={area} className={styles.gain} />
          <path d={beforePath} className={styles.before} fill="none" />
          <path d={afterPath} className={styles.after} fill="none" />

          {hover ? (
            <g
              className={`${styles.hoverLayer} ${active ? styles.hoverLayerOn : ''}`}
              pointerEvents="none"
            >
              <line
                x1={hover.x}
                x2={hover.x}
                y1={padT}
                y2={padT + plotH}
                className={styles.hoverLine}
              />
              <circle cx={hover.x} cy={hover.yBefore} r={2.8} className={styles.dotBefore} />
              <circle cx={hover.x} cy={hover.yAfter} r={3.1} className={styles.dotAfter} />
            </g>
          ) : null}
        </svg>

        {hover ? (
          <div className={styles.tooltip} style={tooltipStyle} role="status">
            <strong>{formatHz(hover.hz)} Гц</strong>
            <span>
              {beforeLabel}: <b>{hover.before.toFixed(1)} дБ</b>
            </span>
            <span>
              {afterLabel}: <b>{hover.after.toFixed(1)} дБ</b>
            </span>
          </div>
        ) : null}
      </div>

      <ul className={styles.legend}>
        <li>
          <span className={styles.swatchBefore} />
          {beforeLabel}
        </li>
        <li>
          <span className={styles.swatchAfter} />
          {afterLabel}
        </li>
      </ul>
    </figure>
  );
}
