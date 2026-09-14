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

function pathFor(
  values: number[],
  x0: number,
  y0: number,
  w: number,
  h: number,
  yMin: number,
  yMax: number,
): string {
  const n = values.length;
  if (!n) return '';
  return values
    .map((v, i) => {
      const x = x0 + (i / Math.max(1, n - 1)) * w;
      const t = (v - yMin) / Math.max(1e-6, yMax - yMin);
      const y = y0 + h - t * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function SpectrumChart({
  title,
  subtitle,
  series,
  yLabel,
  beforeLabel = 'Сейчас',
  afterLabel = 'С MultiFrame',
}: Props) {
  const padL = 36;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const W = 360;
  const H = 200;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const all = [...series.before, ...series.after];
  const rawMin = Math.min(...all);
  const rawMax = Math.max(...all);
  const pad = Math.max(4, (rawMax - rawMin) * 0.12);
  const yMin = Math.floor(rawMin - pad);
  const yMax = Math.ceil(rawMax + pad);

  const beforePath = pathFor(series.before, padL, padT, plotW, plotH, yMin, yMax);
  const afterPath = pathFor(series.after, padL, padT, plotW, plotH, yMin, yMax);

  const yTicks = [yMin, Math.round((yMin + yMax) / 2), yMax];
  const xLabels = [100, 500, 1000, 2000, 5000];

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
        aria-label={`${title}: ${beforeLabel} и ${afterLabel}`}
      >
        {yTicks.map((tick) => {
          const t = (tick - yMin) / Math.max(1e-6, yMax - yMin);
          const y = padT + plotH - t * plotH;
          return (
            <g key={tick}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y}
                y2={y}
                className={styles.grid}
              />
              <text x={padL - 6} y={y + 3} className={styles.tick} textAnchor="end">
                {tick}
              </text>
            </g>
          );
        })}

        {xLabels.map((hz) => {
          const i = series.hz.indexOf(hz);
          if (i < 0) return null;
          const x = padL + (i / Math.max(1, series.hz.length - 1)) * plotW;
          return (
            <text
              key={hz}
              x={x}
              y={H - 8}
              className={styles.tick}
              textAnchor="middle"
            >
              {hz >= 1000 ? `${hz / 1000}k` : hz}
            </text>
          );
        })}

        <text
          x={12}
          y={padT + plotH / 2}
          className={styles.axisLabel}
          transform={`rotate(-90 12 ${padT + plotH / 2})`}
          textAnchor="middle"
        >
          {yLabel}
        </text>

        <path d={beforePath} className={styles.before} fill="none" />
        <path d={afterPath} className={styles.after} fill="none" />
      </svg>

      <ul className={styles.legend}>
        <li>
          <i className={styles.swatchBefore} />
          {beforeLabel}
        </li>
        <li>
          <i className={styles.swatchAfter} />
          {afterLabel}
        </li>
      </ul>
    </figure>
  );
}
