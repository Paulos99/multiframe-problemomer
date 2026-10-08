/**
 * Acoustic profile report — HTML styled like Problemoмер, print → Save as PDF.
 * (Browser fonts keep Cyrillic crisp; jsPDF Helvetica cannot.)
 */
import {
  HOUSE_TYPE_OPTIONS,
  HYBRID_CLASS_LABELS,
  ROOM_TYPE_LABELS,
  ROOM_WISH_OPTIONS,
  SLAB_THICKNESS_OPTIONS,
  SLAB_TYPE_OPTIONS,
  type SessionState,
} from './types';
import { resolveSlab } from './acoustic/construction';
import {
  airClassFor,
  CLASS_CYR,
  comfortClassFor,
  impactClassFor,
  officialComfortLabel,
} from './simulation';
import { buildClientSummary, buildLeadHandoff } from './session';
import type { ClassLabel } from './types';

function optLabel<T extends string>(
  options: { id: T; label: string }[],
  id: T | undefined,
): string {
  if (!id) return 'не указано';
  return options.find((o) => o.id === id)?.label ?? 'не указано';
}

function chipLabel(cls: ClassLabel): string {
  if (cls === 'below') return 'вне нормы';
  return CLASS_CYR[cls];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDateRu(d = new Date()): string {
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildReportHtml(session: SessionState): string {
  const handoff = buildLeadHandoff(session);
  const room = handoff.room;
  const slab = resolveSlab(room);
  const b = handoff.sim.before;
  const a = handoff.sim.after;
  const hybridBefore = comfortClassFor(b.Rw, b.Lnw);
  const hybridAfter = comfortClassFor(a.Rw, a.Lnw);
  const roomName = room.roomType ? ROOM_TYPE_LABELS[room.roomType] : 'комната';
  const area = room.ceilingAreaM2 != null ? `${room.ceilingAreaM2} м²` : 'н/д';
  const slabLabel =
    room.slabType === 'unknown' && room.slabThickness === 'unknown'
      ? `ориентир по типу дома, ~${slab.thicknessMm} мм`
      : `${optLabel(SLAB_TYPE_OPTIONS, room.slabType)}, ${optLabel(SLAB_THICKNESS_OPTIONS, room.slabThickness)}`;
  const why = handoff.whyMultiFrame
    .slice(0, 3)
    .map((w) => `<li>${escapeHtml(w)}</li>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>Акустический профиль · MultiFrame</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    color: #111;
    background: #f4f7f6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .sheet {
    max-width: 720px;
    margin: 0 auto;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 30px rgba(17,24,39,.08);
  }
  .hero {
    background: #01644f;
    color: #fff;
    padding: 22px 28px 20px;
  }
  .hero-brand {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 14px;
    font-size: 13px;
    opacity: .92;
  }
  .hero-brand strong { font-size: 15px; letter-spacing: .02em; }
  h1 {
    margin: 0 0 6px;
    font-size: 26px;
    line-height: 1.2;
    letter-spacing: -.02em;
  }
  .hero p { margin: 0; font-size: 13px; opacity: .88; max-width: 36em; }
  .body { padding: 22px 28px 28px; display: flex; flex-direction: column; gap: 16px; }
  .card {
    background: #f5f7f8;
    border: 1px solid #e1e5e8;
    border-radius: 12px;
    padding: 14px 16px;
  }
  .eyebrow {
    margin: 0 0 8px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #01644f;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
    font-size: 13px;
  }
  .grid dt { margin: 0; color: #5f6b73; font-size: 11px; font-weight: 650; }
  .grid dd { margin: 2px 0 0; font-weight: 650; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .metric { border-radius: 12px; padding: 14px 16px; border: 1px solid #e1e5e8; background: #f5f7f8; }
  .metric.accent { background: #01644f; border-color: #01644f; color: #fff; }
  .metric .label { font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; opacity: .85; }
  .metric h2 { margin: 6px 0 8px; font-size: 16px; line-height: 1.3; }
  .metric .nums { font-size: 13px; font-variant-numeric: tabular-nums; }
  .metric .chips { margin-top: 6px; font-size: 11px; opacity: .85; }
  .delta strong { color: #01644f; }
  .delta p { margin: 4px 0 0; font-size: 13px; line-height: 1.45; color: #111; }
  .norms { font-size: 12px; color: #5f6b73; line-height: 1.5; }
  .why { margin: 0; padding-left: 1.1em; font-size: 13px; color: #5f6b73; line-height: 1.45; }
  .why li { margin: 0 0 4px; }
  .foot {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding-top: 8px;
    border-top: 1px solid #e1e5e8;
    font-size: 11px;
    color: #5f6b73;
  }
  .hint {
    margin: 12px auto 0;
    max-width: 720px;
    text-align: center;
    font-size: 12px;
    color: #5f6b73;
  }
  @media print {
    body { background: #fff; }
    .sheet { box-shadow: none; border-radius: 0; }
    .hint { display: none; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <header class="hero">
      <div class="hero-brand">
        <strong>StP MultiFrame · Проблемомер</strong>
        <span>${escapeHtml(formatDateRu())}</span>
      </div>
      <h1>Акустический профиль помещения</h1>
      <p>Ориентир по полевым замерам MultiFrame на объектах — не лабораторный сертификат.</p>
    </header>
    <div class="body">
      <section class="card">
        <p class="eyebrow">Объект</p>
        <dl class="grid">
          <div><dt>Комната</dt><dd>${escapeHtml(roomName)} · ${escapeHtml(area)}</dd></div>
          <div><dt>Тип дома</dt><dd>${escapeHtml(optLabel(HOUSE_TYPE_OPTIONS, room.houseType))}</dd></div>
          <div><dt>Перекрытие</dt><dd>${escapeHtml(slabLabel)}</dd></div>
          <div><dt>Задача</dt><dd>${escapeHtml(optLabel(ROOM_WISH_OPTIONS, room.roomWish))}</dd></div>
        </dl>
      </section>

      <section class="cols">
        <article class="metric">
          <div class="label">Сейчас</div>
          <h2>«${escapeHtml(officialComfortLabel(hybridBefore))}»</h2>
          <div class="nums">Rw ≈ ${b.Rw} дБ · Lnw ≈ ${b.Lnw} дБ</div>
          <div class="chips">воздух ${chipLabel(airClassFor(b.Rw))} · удар ${chipLabel(impactClassFor(b.Lnw))}</div>
        </article>
        <article class="metric accent">
          <div class="label">С MultiFrame</div>
          <h2>«${escapeHtml(officialComfortLabel(hybridAfter))}»</h2>
          <div class="nums">Rw ≈ ${a.Rw} дБ · Lnw ≈ ${a.Lnw} дБ</div>
          <div class="chips">воздух ${chipLabel(airClassFor(a.Rw))} · удар ${chipLabel(impactClassFor(a.Lnw))}</div>
        </article>
      </section>

      <section class="card delta">
        <p class="eyebrow">Эффект MultiFrame</p>
        <p><strong>Воздух:</strong> Rw ${b.Rw} → ${a.Rw} (Δ +${Math.abs(handoff.sim.delta.Rw)} дБ), станет на ≈ ${handoff.sim.perceivedAirPct}% тише</p>
        <p><strong>Удар:</strong> Lnw ${b.Lnw} → ${a.Lnw} (Δ −${Math.abs(handoff.sim.delta.Lnw)} дБ), станет на ≈ ${handoff.sim.perceivedImpactPct}% тише</p>
        <p style="margin-top:8px;font-size:12px;color:#5f6b73">Гибрид: ${escapeHtml(HYBRID_CLASS_LABELS[hybridBefore])} → ${escapeHtml(HYBRID_CLASS_LABELS[hybridAfter])}</p>
      </section>

      <section class="card">
        <p class="eyebrow">Нормы СП 51.13330.2011</p>
        <p class="norms">А: Rw ≥ 54 · Lnw ≤ 55 &nbsp;|&nbsp; Б: Rw ≥ 52 · Lnw ≤ 58 &nbsp;|&nbsp; В: Rw ≥ 50 · Lnw ≤ 60<br/>
        Ниже допустимого: Rw &lt; 50 или Lnw &gt; 60. Потолок один не закрывает норму удара классом А.</p>
      </section>

      ${why ? `<section class="card"><p class="eyebrow">Почему MultiFrame</p><ul class="why">${why}</ul></section>` : ''}

      <footer class="foot">
        <span>stp-multiframe.ru</span>
        <span>Не является лабораторным протоколом</span>
      </footer>
    </div>
  </div>
  <p class="hint">В диалоге печати выберите «Сохранить как PDF».</p>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.focus(); window.print(); }, 280);
    });
  </script>
</body>
</html>`;
}

/** Open styled report and trigger print → Save as PDF. */
export function downloadAcousticProfilePdf(session: SessionState): void {
  const html = buildReportHtml(session);
  const win = window.open('', '_blank', 'noopener,noreferrer,width=820,height=1000');
  if (!win) {
    // Popup blocked — fallback: download HTML file
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MultiFrame_акустический_профиль.html';
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

/** Share via Web Share API or clipboard fallback. */
export async function shareAcousticProfile(
  session: SessionState,
): Promise<'shared' | 'copied' | 'failed'> {
  const text = buildClientSummary(session);
  const title = 'Акустический профиль · MultiFrame Проблемомер';
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ title, text });
      return 'shared';
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'failed';
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    console.info('[share-fallback]', text);
    return 'failed';
  }
}
