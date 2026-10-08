/** Inline SVG for PDF/HTML reports — same geometry as SpectrumChart. */
import type { SpectrumSeries } from './types';

function xAt(hz: number, hzMin: number, hzMax: number, x0: number, w: number): number {
  const t =
    (Math.log10(hz) - Math.log10(hzMin)) / Math.max(1e-6, Math.log10(hzMax) - Math.log10(hzMin));
  return x0 + t * w;
}

function yAt(v: number, yMin: number, yMax: number, y0: number, h: number): number {
  const t = (v - yMin) / Math.max(1e-6, yMax - yMin);
  return y0 + h - t * h;
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

export function spectrumChartSvg(
  series: SpectrumSeries,
  opts: {
    title: string;
    subtitle: string;
    indexKind: 'Rw' | 'Lnw';
    indexBefore: number;
    indexAfter: number;
    /** SVG canvas height in user units (default 260). */
    height?: number;
  },
): string {
  const padL = 36;
  const padR = 12;
  const padT = 14;
  const padB = 28;
  const W = 640;
  const H = opts.height ?? 260;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const all = [...series.before, ...series.after];
  const { yMin, yMax, ticks } = niceRange(Math.min(...all), Math.max(...all));
  const hzMin = series.hz[0] ?? 100;
  const hzMax = series.hz[series.hz.length - 1] ?? 5000;
  const beforePath = polyline(series.hz, series.before, padL, padT, plotW, plotH, yMin, yMax);
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

  const grid = ticks
    .map((tick) => {
      const y = yAt(tick, yMin, yMax, padT, plotH);
      return `<line x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}" stroke="#e1e5e8" stroke-width="1"/>
        <text x="${padL - 6}" y="${y + 3}" text-anchor="end" fill="#5f6b73" font-size="9" font-weight="500">${tick}</text>`;
    })
    .join('');

  const xTicks = xLabels
    .map((hz) => {
      const x = xAt(hz, hzMin, hzMax, padL, plotW);
      return `<text x="${x}" y="${H - 8}" text-anchor="middle" fill="#5f6b73" font-size="9" font-weight="500">${formatHz(hz)}</text>`;
    })
    .join('');

  return `<figure class="chart">
  <figcaption>
    <div>
      <strong>${opts.title}</strong>
      <span>${opts.subtitle}</span>
    </div>
    <div class="badge"><b>${opts.indexKind}</b><span>≈ ${Math.round(opts.indexBefore)} → ≈ ${Math.round(opts.indexAfter)}</span></div>
  </figcaption>
  <svg viewBox="0 0 ${W} ${H}" width="100%" xmlns="http://www.w3.org/2000/svg" role="img">
    ${grid}
    ${xTicks}
    <text x="12" y="${padT + plotH / 2}" fill="#5f6b73" font-size="9" font-weight="500" text-anchor="middle" transform="rotate(-90 12 ${padT + plotH / 2})">дБ</text>
    <path d="${area}" fill="#01644f" opacity="0.18"/>
    <path d="${beforePath}" fill="none" stroke="#7a8790" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="${afterPath}" fill="none" stroke="#01644f" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>
  <ul class="legend"><li><i class="sw-b"></i>Сейчас</li><li><i class="sw-a"></i>С MultiFrame</li></ul>
</figure>`;
}
