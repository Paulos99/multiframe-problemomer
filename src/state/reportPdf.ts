/**
 * Acoustic profile PDF — full Result copy + frequency charts (html2canvas → jsPDF).
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
  airFeltFromIndex,
  CLASS_CYR,
  comfortClassFor,
  FELT_STEP_LABELS,
  impactClassFor,
  impactFeltFromIndex,
  NORMS,
  officialComfortLabel,
} from './simulation';
import { buildLeadHandoff } from './session';
import { buildAirSpectrum, buildImpactSpectrum } from './spectrum';
import { spectrumChartSvg } from './chartSvg';
import { wishScenarioLine, stretchDrumLine } from './wish';
import {
  buildShareClipboardText,
  buildShareUrl,
  SHARE_MARKETING_BLURB,
} from './shareLink';
import type { ClassLabel } from './types';

const PILLARS = [
  {
    title: 'Звукоизоляция и акустический комфорт',
    text: 'Снижает воздушный и ударный шум — в комнате спокойнее и ровнее по ощущению.',
  },
  {
    title: 'Безопасность',
    text: 'Материалы для жилых помещений: спальня, детская, кухня и ванная.',
  },
  {
    title: 'Экологичность',
    text: 'Без минеральной ваты и строительной пыли на объекте.',
  },
  {
    title: 'Быстрый монтаж',
    text: 'Панели до полотна: без долгой каркасной стройки и лишней потери высоты.',
  },
  {
    title: 'Универсальность',
    text: 'Подходит к любому перекрытию и к любой стадии ремонта.',
  },
] as const;

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

function buildReportDocument(session: SessionState): string {
  const handoff = buildLeadHandoff(session);
  const room = handoff.room;
  const slab = resolveSlab(room);
  const sim = session.derived!.simulation;
  const b = sim.before;
  const a = sim.after;
  const hybridBefore = comfortClassFor(b.Rw, b.Lnw);
  const hybridAfter = comfortClassFor(a.Rw, a.Lnw);
  const roomName = room.roomType ? ROOM_TYPE_LABELS[room.roomType] : 'комната';
  const area = room.ceilingAreaM2 != null ? `${room.ceilingAreaM2} м²` : 'н/д';
  const slabLabel =
    room.slabType === 'unknown' && room.slabThickness === 'unknown'
      ? `ориентир по типу дома (${optLabel(HOUSE_TYPE_OPTIONS, room.houseType)}), ~${slab.thicknessMm} мм`
      : `${optLabel(SLAB_TYPE_OPTIONS, room.slabType)}, ${optLabel(SLAB_THICKNESS_OPTIONS, room.slabThickness)}`;

  const airNow = airFeltFromIndex(b.Rw);
  const airAfter = airFeltFromIndex(a.Rw);
  const impactNow = impactFeltFromIndex(b.Lnw);
  const impactAfter = impactFeltFromIndex(a.Lnw);
  const scenario = wishScenarioLine(room.roomWish);
  const drum = stretchDrumLine(room.plannedCeiling);
  const airSeries = buildAirSpectrum(session.answers);
  const impactSeries = buildImpactSpectrum(session.answers);

  const airSvg = spectrumChartSvg(airSeries, {
    title: 'Воздушный шум (голоса и музыка)',
    subtitle: 'R(f), дБ · воздушный шум сверху',
    indexKind: 'Rw',
    indexBefore: b.Rw,
    indexAfter: a.Rw,
  });
  const impactSvg = spectrumChartSvg(impactSeries, {
    title: 'Ударный шум (шаги и падения)',
    subtitle: 'Изоляция по полосам Гц · ударный шум',
    indexKind: 'Lnw',
    indexBefore: b.Lnw,
    indexAfter: a.Lnw,
  });

  const pillars = PILLARS.map(
    (p) =>
      `<li><strong>${escapeHtml(p.title)}</strong><span>${escapeHtml(p.text)}</span></li>`,
  ).join('');

  return `<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    color: #111; background: #fff;
  }
  .sheet { width: 794px; background: #fff; }
  .hero {
    background: #01644f; color: #fff;
    padding: 28px 32px 24px;
  }
  .hero-top { display: flex; justify-content: space-between; font-size: 13px; opacity: .92; margin-bottom: 14px; }
  .hero h1 { margin: 0 0 8px; font-size: 28px; letter-spacing: -.02em; line-height: 1.15; }
  .hero p { margin: 0; font-size: 13px; opacity: .9; max-width: 38em; }
  .body { padding: 24px 32px 32px; display: flex; flex-direction: column; gap: 16px; }
  .card {
    background: #f5f7f8; border: 1px solid #e1e5e8;
    border-radius: 12px; padding: 14px 16px;
  }
  .eyebrow {
    margin: 0 0 8px; font-size: 10px; font-weight: 800;
    letter-spacing: .1em; text-transform: uppercase; color: #01644f;
  }
  h2.sec { margin: 4px 0 0; font-size: 18px; letter-spacing: -.01em; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 13px; }
  .grid dt { margin: 0; color: #5f6b73; font-size: 11px; font-weight: 650; }
  .grid dd { margin: 2px 0 0; font-weight: 650; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .metric { border-radius: 12px; padding: 14px 16px; border: 1px solid #e1e5e8; background: #f5f7f8; }
  .metric.accent { background: #01644f; border-color: #01644f; color: #fff; }
  .metric .label { font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; opacity: .85; }
  .metric h3 { margin: 6px 0 8px; font-size: 16px; line-height: 1.3; }
  .metric .nums { font-size: 13px; font-variant-numeric: tabular-nums; }
  .metric .chips { margin-top: 6px; font-size: 11px; opacity: .85; }
  .felt { display: flex; flex-direction: column; gap: 8px; }
  .felt-row {
    display: flex; justify-content: space-between; gap: 10px; align-items: baseline;
    padding: 10px 12px; border-radius: 10px; background: #fff; border: 1px solid #e1e5e8;
    font-size: 13px;
  }
  .felt-row b.pct { color: #01644f; white-space: nowrap; }
  .scenario { font-size: 13px; line-height: 1.45; margin: 0; }
  .scenario + .scenario { margin-top: 6px; color: #5f6b73; font-size: 12px; }
  .delta p { margin: 4px 0 0; font-size: 13px; line-height: 1.45; }
  .delta strong { color: #01644f; }
  .norms-table { width: 100%; border-collapse: collapse; font-size: 12px; background: #fff; }
  .norms-table th, .norms-table td { padding: 7px 8px; border-bottom: 1px solid #e1e5e8; text-align: left; }
  .norms-table th { color: #5f6b73; font-size: 11px; background: #f5f7f8; }
  .norms-table td:nth-child(2), .norms-table td:nth-child(3),
  .norms-table th:nth-child(2), .norms-table th:nth-child(3) { text-align: right; white-space: nowrap; }
  .norms-table tr.muted td { color: #5f6b73; }
  .chart {
    margin: 0; padding: 12px; border-radius: 12px;
    background: #f5f7f8; border: 1px solid #e1e5e8;
  }
  .chart figcaption {
    display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; margin-bottom: 6px;
  }
  .chart figcaption strong { display: block; font-size: 13px; }
  .chart figcaption span { display: block; font-size: 11px; color: #5f6b73; margin-top: 2px; }
  .badge {
    flex-shrink: 0; text-align: right; background: #fff; border: 1px solid #e1e5e8;
    border-radius: 8px; padding: 4px 8px; font-size: 11px; color: #5f6b73;
  }
  .badge b { display: block; color: #111; font-size: 12px; }
  .legend { list-style: none; margin: 6px 0 0; padding: 0; display: flex; gap: 14px; font-size: 11px; color: #5f6b73; }
  .legend i { display: inline-block; width: 14px; height: 3px; border-radius: 2px; margin-right: 6px; vertical-align: middle; }
  .sw-b { background: #7a8790; } .sw-a { background: #01644f; }
  .pillars { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
  .pillars li { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: #5f6b73; }
  .pillars strong { color: #111; font-size: 13px; }
  .comfort {
    padding: 12px 14px; border-radius: 12px;
    border: 1px solid rgba(1,100,79,.18); background: #ecf7f3;
  }
  .comfort span { display: block; font-size: 12px; color: #5f6b73; font-weight: 650; }
  .comfort b { display: block; margin-top: 4px; font-size: 15px; }
  .foot {
    display: flex; justify-content: space-between; gap: 12px;
    padding-top: 10px; border-top: 1px solid #e1e5e8;
    font-size: 11px; color: #5f6b73;
  }
</style></head><body>
<div class="sheet" id="mf-report-root">
  <header class="hero">
    <div class="hero-top">
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

    <section>
      <h2 class="sec">Текущая ситуация</h2>
      <div class="felt" style="margin-top:10px">
        <div class="felt-row">
          <span>Воздушный шум · сейчас <b>${FELT_STEP_LABELS[airNow]}</b> (Rw ≈ ${Math.round(b.Rw)})</span>
        </div>
        <div class="felt-row">
          <span>Ударный шум · сейчас <b>${FELT_STEP_LABELS[impactNow]}</b> (Lnw ≈ ${Math.round(b.Lnw)})</span>
        </div>
      </div>
      <div class="comfort" style="margin-top:10px">
        <span>Класс комфорта помещения</span>
        <b>«${escapeHtml(officialComfortLabel(hybridBefore))}»</b>
      </div>
    </section>

    <section>
      <h2 class="sec">С MultiFrame</h2>
      ${
        room.roomWish !== 'other'
          ? `<div class="card" style="margin-top:10px"><p class="scenario">${escapeHtml(scenario)}</p>${drum ? `<p class="scenario">${escapeHtml(drum)}</p>` : ''}</div>`
          : drum
            ? `<div class="card" style="margin-top:10px"><p class="scenario">${escapeHtml(drum)}</p></div>`
            : ''
      }
      <div class="felt" style="margin-top:10px">
        <div class="felt-row">
          <span>Воздушный шум · ${FELT_STEP_LABELS[airNow]} → <b>${FELT_STEP_LABELS[airAfter]}</b> · Rw ≈ ${Math.round(b.Rw)} → ≈ ${Math.round(a.Rw)}</span>
          <b class="pct">станет на ≈ ${sim.perceivedAirPct}% тише</b>
        </div>
        <div class="felt-row">
          <span>Ударный шум · ${FELT_STEP_LABELS[impactNow]} → <b>${FELT_STEP_LABELS[impactAfter]}</b> · Lnw ≈ ${Math.round(b.Lnw)} → ≈ ${Math.round(a.Lnw)}</span>
          <b class="pct">станет на ≈ ${sim.perceivedImpactPct}% тише</b>
        </div>
      </div>
    </section>

    <section class="cols">
      <article class="metric">
        <div class="label">Сейчас</div>
        <h3>«${escapeHtml(officialComfortLabel(hybridBefore))}»</h3>
        <div class="nums">Rw ≈ ${b.Rw} дБ · Lnw ≈ ${b.Lnw} дБ</div>
        <div class="chips">воздух ${chipLabel(airClassFor(b.Rw))} · удар ${chipLabel(impactClassFor(b.Lnw))}</div>
      </article>
      <article class="metric accent">
        <div class="label">С MultiFrame</div>
        <h3>«${escapeHtml(officialComfortLabel(hybridAfter))}»</h3>
        <div class="nums">Rw ≈ ${a.Rw} дБ · Lnw ≈ ${a.Lnw} дБ</div>
        <div class="chips">воздух ${chipLabel(airClassFor(a.Rw))} · удар ${chipLabel(impactClassFor(a.Lnw))}</div>
      </article>
    </section>

    <section class="card delta">
      <p class="eyebrow">Эффект MultiFrame</p>
      <p><strong>Воздух:</strong> Rw ${b.Rw} → ${a.Rw} (Δ +${Math.abs(sim.delta.Rw)} дБ)</p>
      <p><strong>Удар:</strong> Lnw ${b.Lnw} → ${a.Lnw} (Δ −${Math.abs(sim.delta.Lnw)} дБ)</p>
      <p style="margin-top:8px;font-size:12px;color:#5f6b73">Гибрид: ${escapeHtml(HYBRID_CLASS_LABELS[hybridBefore])} → ${escapeHtml(HYBRID_CLASS_LABELS[hybridAfter])}</p>
    </section>

    <section>
      <h2 class="sec">Изоляция по частотам</h2>
      <p style="margin:6px 0 10px;font-size:12px;color:#5f6b73">Чем выше линия, тем лучше конструкция сдерживает соответствующие частоты шума.</p>
      ${airSvg}
      <div style="height:12px"></div>
      ${impactSvg}
    </section>

    <section class="card">
      <p class="eyebrow">Нормы комфорта в стройке · СП 51.13330.2011</p>
      <table class="norms-table">
        <thead><tr><th>Уровень</th><th>Rw, дБ</th><th>Lnw, дБ</th></tr></thead>
        <tbody>
          <tr><td>Высокий комфорт (А)</td><td>≥ ${NORMS.A.Rw}</td><td>≤ ${NORMS.A.Lnw}</td></tr>
          <tr><td>Комфорт (Б)</td><td>≥ ${NORMS.B.Rw}</td><td>≤ ${NORMS.B.Lnw}</td></tr>
          <tr><td>Допустимый (В)</td><td>≥ ${NORMS.V.Rw}</td><td>≤ ${NORMS.V.Lnw}</td></tr>
          <tr class="muted"><td>Ниже допустимого</td><td>&lt; ${NORMS.V.Rw}</td><td>&gt; ${NORMS.V.Lnw}</td></tr>
        </tbody>
      </table>
      <div class="comfort" style="margin-top:12px">
        <span>Класс комфорта помещения с MultiFrame</span>
        <b>«${escapeHtml(officialComfortLabel(hybridAfter))}»</b>
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Уникальность системы MultiFrame</p>
      <ul class="pillars">${pillars}</ul>
    </section>

    <footer class="foot">
      <span>stp-multiframe.ru · Проблемомер</span>
      <span>Не является лабораторным протоколом</span>
    </footer>
  </div>
</div>
</body></html>`;
}

/** Render report DOM → multi-page PDF file download. */
export async function downloadAcousticProfilePdf(session: SessionState): Promise<void> {
  if (!session.derived) {
    throw new Error('Нет расчёта для отчёта');
  }

  const html = buildReportDocument(session);
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText =
    'position:fixed;left:-12000px;top:0;width:794px;background:#fff;z-index:-1;pointer-events:none;';
  host.innerHTML = html;
  document.body.appendChild(host);

  const root = host.querySelector('#mf-report-root') as HTMLElement | null;
  if (!root) {
    host.remove();
    throw new Error('Не удалось собрать отчёт');
  }

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const canvas = await html2canvas(root, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      windowWidth: 794,
    });

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const imgData = canvas.toDataURL('image/png', 1);

    let heightLeft = imgH;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH, undefined, 'FAST');
    heightLeft -= pageH;
    while (heightLeft > 0.5) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH, undefined, 'FAST');
      heightLeft -= pageH;
    }

    const room = session.answers.room;
    const roomName = room.roomType ? ROOM_TYPE_LABELS[room.roomType] : 'komnata';
    const safe = roomName.replace(/[^\wа-яА-ЯёЁ\-]+/gi, '_').slice(0, 24);
    pdf.save(`MultiFrame_профиль_${safe}_${room.ceilingAreaM2 ?? 'area'}.pdf`);
  } finally {
    host.remove();
  }
}

/** Copy deep-link (answer chain). Web Share when available. */
export async function shareAcousticProfile(
  session: SessionState,
): Promise<'shared' | 'copied' | 'failed'> {
  const url = buildShareUrl(session);
  const text = buildShareClipboardText(session);

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({
        title: 'Эффект MultiFrame · Проблемомер StP',
        text: SHARE_MARKETING_BLURB,
        url,
      });
      return 'shared';
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'failed';
  }

  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    try {
      await navigator.clipboard.writeText(url);
      return 'copied';
    } catch {
      console.info('[share-fallback]', text);
      return 'failed';
    }
  }
}

export { buildShareUrl, SHARE_MARKETING_BLURB };
