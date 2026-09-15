import type { SpectrumSeries } from '../state/spectrum';
import styles from './SpectrumChart.module.css';

type Props = {
  title: string;
  subtitle: string;
  series: SpectrumSeries;
  yLabel: string;
  beforeLabel?: string;
  afterLabel?: string;
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
  return hz >= 1000 ? `${hz / 1000}k` : String(hz);
}

export function SpectrumChart({
  title,
  subtitle,
  series,
  yLabel,
  beforeLabel = 'Сейчас',
  afterLabel = 'С MultiFrame',
}: Props) {
  const padL = 28;
  const padR = 10;
  const padT = 10;
  const padB = 22;
  const W = 360;
  const H = 168;
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

  return (
    <figure className={styles.wrap}>
      <figcaption>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </figcaption>

      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${title}: ${beforeLabel} и ${afterLabel}. Чем выше линия, тем лучше изоляция.`}
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
      </svg>

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
