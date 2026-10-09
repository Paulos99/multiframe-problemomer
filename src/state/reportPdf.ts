/**
 * Acoustic profile PDF — multi-page A4 document (one canvas per page → jsPDF).
 * Designed as a room acoustic passport, not a screenshot dump.
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
import { buildLeadHandoff, withDerived } from './session';
import { buildAirSpectrum, buildImpactSpectrum } from './spectrum';
import { spectrumChartSvg } from './chartSvg';
import { wishScenarioLine, stretchDrumLine } from './wish';
import {
  buildShareClipboardText,
  buildShareUrl,
  SHARE_MARKETING_BLURB,
} from './shareLink';
import type { ClassLabel } from './types';

/** A4 @ 96 CSS px */
const PAGE_W = 794;
const PAGE_H = 1123;

const PILLARS = [
  {
    title: 'Звукоизоляция и акустический комфорт',
    text: 'Снижает воздушный и ударный шум — в комнате становится спокойнее.',
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
    text: 'Сначала панели, потом натяжное полотно. Без каркаса и без лишней потери высоты.',
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

function pageChrome(page: number, total: number, roomLine: string): string {
  return `
  <div class="page-top">
    <div class="brand-row">
      <span class="brand">StP MultiFrame</span>
      <span class="doc-type">Акустический профиль помещения</span>
    </div>
    <div class="meta-row">
      <span>${escapeHtml(roomLine)}</span>
      <span>${escapeHtml(formatDateRu())}</span>
    </div>
  </div>
  <div class="page-bottom">
    <span>stp-multiframe.ru · MultiFrame Проблемомер</span>
    <span>${page} / ${total}</span>
  </div>`;
}

function buildReportDocument(session: SessionState): string {
  const handoff = buildLeadHandoff(session);
  const room = handoff.room;
  const slab = resolveSlab(room);
  const sim = session.derived!.simulation;
  const rev = sim.reverb;
  const b = sim.before;
  const a = sim.after;
  const hybridBefore = comfortClassFor(b.Rw, b.Lnw);
  const hybridAfter = comfortClassFor(a.Rw, a.Lnw);
  const roomName = room.roomType ? ROOM_TYPE_LABELS[room.roomType] : 'комната';
  const area = room.ceilingAreaM2 != null ? `${room.ceilingAreaM2} м²` : 'н/д';
  const roomLine = `${roomName} · ${area}`;
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
    subtitle: 'изоляция от голосов и музыки сверху',
    indexKind: 'Rw',
    indexBefore: b.Rw,
    indexAfter: a.Rw,
    height: 210,
  });
  const impactSvg = spectrumChartSvg(impactSeries, {
    title: 'Ударный шум (шаги и падения)',
    subtitle: 'изоляция от шагов и падений',
    indexKind: 'Lnw',
    indexBefore: b.Lnw,
    indexAfter: a.Lnw,
    height: 210,
  });

  const pillars = PILLARS.map(
    (p, i) =>
      `<li><span class="n">${i + 1}</span><div><strong>${escapeHtml(p.title)}</strong><p>${escapeHtml(p.text)}</p></div></li>`,
  ).join('');

  const wishBlock =
    room.roomWish !== 'other'
      ? `<p class="lead">${escapeHtml(scenario)}</p>${drum ? `<p class="muted">${escapeHtml(drum)}</p>` : ''}`
      : drum
        ? `<p class="lead">${escapeHtml(drum)}</p>`
        : `<p class="lead">Прогноз по голосам и шагам сверху для этого перекрытия.</p>`;

  const TOTAL = 3;

  return `<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body {
    font-family: "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;
    color: #152018;
    -webkit-font-smoothing: antialiased;
  }
  .sheet { width: ${PAGE_W}px; background: #fff; }

  .page {
    width: ${PAGE_W}px;
    height: ${PAGE_H}px;
    padding: 36px 44px 52px;
    position: relative;
    background: #fff;
    overflow: hidden;
  }
  .page::before {
    content: "";
    position: absolute; left: 0; top: 0; right: 0; height: 5px;
    background: linear-gradient(90deg, #01644f 0%, #1a8f72 55%, #01644f 100%);
  }

  .page-top { margin-bottom: 22px; padding-bottom: 12px; border-bottom: 1px solid #d7e2dc; }
  .brand-row {
    display: flex; justify-content: space-between; align-items: baseline;
    gap: 16px; margin-bottom: 6px;
  }
  .brand {
    font-size: 12px; font-weight: 800; letter-spacing: .12em;
    text-transform: uppercase; color: #01644f;
  }
  .doc-type {
    font-size: 11px; font-weight: 650; color: #5f6b73; letter-spacing: .02em;
  }
  .meta-row {
    display: flex; justify-content: space-between; gap: 12px;
    font-size: 11px; color: #5f6b73;
  }

  .page-bottom {
    position: absolute; left: 44px; right: 44px; bottom: 22px;
    display: flex; justify-content: space-between; gap: 12px;
    padding-top: 10px; border-top: 1px solid #d7e2dc;
    font-size: 10px; color: #7a8790;
  }

  .hero-title {
    margin: 0 0 6px;
    font-size: 28px; font-weight: 750; letter-spacing: -.025em; line-height: 1.15;
    color: #0f1c16;
  }
  .hero-sub {
    margin: 0 0 18px;
    font-size: 14px; color: #5f6b73; line-height: 1.4;
  }
  .hero-sub b { color: #01644f; font-weight: 700; }

  .sec {
    margin: 0 0 10px;
    display: flex; align-items: baseline; gap: 10px;
  }
  .sec .idx {
    font-size: 11px; font-weight: 800; letter-spacing: .1em;
    color: #01644f; text-transform: uppercase;
  }
  .sec h2 {
    margin: 0; font-size: 15px; font-weight: 750; letter-spacing: -.01em;
  }
  .block { margin-bottom: 18px; }

  .passport {
    width: 100%; border-collapse: collapse;
    border: 1px solid #d7e2dc; border-radius: 4px; overflow: hidden;
  }
  .passport th, .passport td {
    padding: 10px 12px; text-align: left; vertical-align: top;
    border-bottom: 1px solid #e6eeea; font-size: 12.5px; line-height: 1.35;
  }
  .passport tr:last-child th, .passport tr:last-child td { border-bottom: none; }
  .passport th {
    width: 28%; font-size: 11px; font-weight: 650; color: #5f6b73;
    background: #f4f8f6; letter-spacing: .02em;
  }
  .passport td { font-weight: 650; color: #152018; background: #fff; }

  .status-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  }
  .status {
    border: 1px solid #d7e2dc; padding: 12px 14px; background: #fff;
  }
  .status .k {
    font-size: 10px; font-weight: 800; letter-spacing: .08em;
    text-transform: uppercase; color: #5f6b73; margin-bottom: 6px;
  }
  .status .v { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .status .s { font-size: 11.5px; color: #5f6b73; }

  .comfort-banner {
    margin-top: 10px; padding: 12px 14px;
    background: #f0f7f4; border-left: 3px solid #01644f;
  }
  .comfort-banner .k {
    font-size: 10px; font-weight: 800; letter-spacing: .08em;
    text-transform: uppercase; color: #5f6b73;
  }
  .comfort-banner .v {
    margin-top: 4px; font-size: 16px; font-weight: 750; color: #0f1c16;
  }

  .lead { margin: 0 0 6px; font-size: 13px; line-height: 1.45; }
  .muted { margin: 0; font-size: 12px; line-height: 1.4; color: #5f6b73; }

  .felt { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
  .felt-row {
    display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
    padding: 10px 12px; border: 1px solid #d7e2dc; background: #fafcfb;
    font-size: 12.5px; line-height: 1.35;
  }
  .felt-row .pct {
    flex-shrink: 0; color: #01644f; font-weight: 800; white-space: nowrap;
  }

  .compare {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px;
  }
  .cmp {
    padding: 14px; border: 1px solid #d7e2dc; background: #fff;
  }
  .cmp.now { background: #f7f9f8; }
  .cmp.after {
    background: #01644f; border-color: #01644f; color: #fff;
  }
  .cmp .k {
    font-size: 10px; font-weight: 800; letter-spacing: .1em;
    text-transform: uppercase; opacity: .8; margin-bottom: 6px;
  }
  .cmp h3 { margin: 0 0 8px; font-size: 15px; font-weight: 750; line-height: 1.25; }
  .cmp .nums { font-size: 12.5px; font-variant-numeric: tabular-nums; opacity: .95; }
  .cmp .chips { margin-top: 6px; font-size: 11px; opacity: .8; }

  .delta-strip {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    margin: 0 0 14px;
  }
  .delta-item {
    padding: 12px 14px; border: 1px solid #d7e2dc; background: #f4f8f6;
  }
  .delta-item .k {
    font-size: 10px; font-weight: 800; letter-spacing: .08em;
    text-transform: uppercase; color: #5f6b73;
  }
  .delta-item .v {
    margin-top: 4px; font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums;
  }
  .delta-item .d { margin-top: 2px; font-size: 12px; color: #01644f; font-weight: 750; }

  .note {
    margin: 0 0 12px; font-size: 12px; color: #5f6b73; line-height: 1.4;
  }

  .chart {
    margin: 0 0 14px; padding: 12px 14px 10px;
    border: 1px solid #d7e2dc; background: #fafcfb;
  }
  .chart:last-of-type { margin-bottom: 0; }
  .chart figcaption {
    display: flex; justify-content: space-between; gap: 10px;
    align-items: flex-start; margin-bottom: 6px;
  }
  .chart figcaption strong { display: block; font-size: 13px; font-weight: 750; }
  .chart figcaption span { display: block; font-size: 11px; color: #5f6b73; margin-top: 2px; }
  .badge {
    flex-shrink: 0; text-align: right; background: #fff; border: 1px solid #d7e2dc;
    padding: 4px 8px; font-size: 10.5px; color: #5f6b73;
  }
  .badge b { display: block; color: #152018; font-size: 11.5px; }
  .legend {
    list-style: none; margin: 6px 0 0; padding: 0;
    display: flex; gap: 14px; font-size: 11px; color: #5f6b73;
  }
  .legend i {
    display: inline-block; width: 14px; height: 2px; border-radius: 1px;
    margin-right: 6px; vertical-align: middle;
  }
  .sw-b { background: #7a8790; } .sw-a { background: #01644f; }

  .norms {
    width: 100%; border-collapse: collapse; font-size: 12px;
    border: 1px solid #d7e2dc;
  }
  .norms th, .norms td {
    padding: 9px 10px; border-bottom: 1px solid #e6eeea; text-align: left;
  }
  .norms tr:last-child td { border-bottom: none; }
  .norms th {
    background: #f4f8f6; color: #5f6b73; font-size: 11px; font-weight: 650;
  }
  .norms td:nth-child(2), .norms td:nth-child(3),
  .norms th:nth-child(2), .norms th:nth-child(3) {
    text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums;
  }
  .norms tr.muted td { color: #7a8790; }

  .pillars { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
  .pillars li {
    display: grid; grid-template-columns: 22px 1fr; gap: 10px; align-items: start;
    padding: 8px 0; border-bottom: 1px solid #e6eeea;
  }
  .pillars li:last-child { border-bottom: none; }
  .pillars .n {
    width: 22px; height: 22px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: #e8f3ef; color: #01644f;
    font-size: 11px; font-weight: 800;
  }
  .pillars strong { display: block; font-size: 12.5px; margin-bottom: 2px; }
  .pillars p { margin: 0; font-size: 11.5px; color: #5f6b73; line-height: 1.4; }

  .closing {
    margin-top: 16px; padding: 14px;
    border: 1px solid #d7e2dc; background: #f4f8f6;
    font-size: 12px; line-height: 1.45; color: #5f6b73;
  }
  .closing b { color: #152018; }
</style></head><body>
<div class="sheet" id="mf-report-root">

  <!-- PAGE 1: passport + situation -->
  <section class="page" data-page="1">
    ${pageChrome(1, TOTAL, roomLine)}
    <h1 class="hero-title">Акустический профиль помещения</h1>
    <p class="hero-sub">Объект: <b>${escapeHtml(roomName)}</b>, ${escapeHtml(area)}. Эффект MultiFrame для этого помещения.</p>

    <div class="block">
      <div class="sec"><span class="idx">01</span><h2>Паспорт объекта</h2></div>
      <table class="passport">
        <tr><th>Помещение</th><td>${escapeHtml(roomName)} · ${escapeHtml(area)}</td></tr>
        <tr><th>Тип дома</th><td>${escapeHtml(optLabel(HOUSE_TYPE_OPTIONS, room.houseType))}</td></tr>
        <tr><th>Перекрытие</th><td>${escapeHtml(slabLabel)}</td></tr>
        <tr><th>Задача</th><td>${escapeHtml(optLabel(ROOM_WISH_OPTIONS, room.roomWish))}</td></tr>
      </table>
    </div>

    <div class="block">
      <div class="sec"><span class="idx">02</span><h2>Исходное состояние</h2></div>
      <div class="status-grid">
        <div class="status">
          <div class="k">Воздушный шум</div>
          <div class="v">${FELT_STEP_LABELS[airNow]}</div>
          <div class="s">Rw ≈ ${Math.round(b.Rw)} дБ · класс ${chipLabel(airClassFor(b.Rw))}</div>
        </div>
        <div class="status">
          <div class="k">Ударный шум</div>
          <div class="v">${FELT_STEP_LABELS[impactNow]}</div>
          <div class="s">Lnw ≈ ${Math.round(b.Lnw)} дБ · класс ${chipLabel(impactClassFor(b.Lnw))}</div>
        </div>
      </div>
      <div class="comfort-banner">
        <div class="k">Класс комфорта помещения сейчас</div>
        <div class="v">«${escapeHtml(officialComfortLabel(hybridBefore))}»</div>
      </div>
    </div>

    <div class="block" style="margin-bottom:0">
      <div class="sec"><span class="idx">03</span><h2>Прогноз с MultiFrame</h2></div>
      ${wishBlock}
      <div class="felt">
        <div class="felt-row">
          <span>Воздух · ${FELT_STEP_LABELS[airNow]} → <b>${FELT_STEP_LABELS[airAfter]}</b> · Rw ≈ ${Math.round(b.Rw)} → ≈ ${Math.round(a.Rw)}</span>
          <span class="pct">≈ ${sim.perceivedAirPct}% тише</span>
        </div>
        <div class="felt-row">
          <span>Удар · ${FELT_STEP_LABELS[impactNow]} → <b>${FELT_STEP_LABELS[impactAfter]}</b> · Lnw ≈ ${Math.round(b.Lnw)} → ≈ ${Math.round(a.Lnw)}</span>
          <span class="pct">≈ ${sim.perceivedImpactPct}% тише</span>
        </div>
      </div>
      <div class="compare">
        <div class="cmp now">
          <div class="k">Сейчас</div>
          <h3>«${escapeHtml(officialComfortLabel(hybridBefore))}»</h3>
          <div class="nums">Rw ≈ ${b.Rw} дБ · Lnw ≈ ${b.Lnw} дБ</div>
          <div class="chips">воздух ${chipLabel(airClassFor(b.Rw))} · удар ${chipLabel(impactClassFor(b.Lnw))}</div>
        </div>
        <div class="cmp after">
          <div class="k">С MultiFrame</div>
          <h3>«${escapeHtml(officialComfortLabel(hybridAfter))}»</h3>
          <div class="nums">Rw ≈ ${a.Rw} дБ · Lnw ≈ ${a.Lnw} дБ</div>
          <div class="chips">воздух ${chipLabel(airClassFor(a.Rw))} · удар ${chipLabel(impactClassFor(a.Lnw))}</div>
        </div>
      </div>
      <div class="comfort-banner" style="margin-top:12px">
        <div class="k">Комфорт от эха в комнате</div>
        <div class="v">${rev.comfortBefore}% → ${rev.comfortAfter}%</div>
      </div>
      <p class="muted" style="margin-top:6px">Выше процент — меньше гулкости и порхания (не громче эха). MultiFrame снимает порхающее эхо в помещении — не только шум сверху.</p>
    </div>
  </section>

  <!-- PAGE 2: spectra -->
  <section class="page" data-page="2">
    ${pageChrome(2, TOTAL, roomLine)}
    <div class="sec"><span class="idx">04</span><h2>Как потолок держит шум по частотам</h2></div>
    <p class="note">Чем выше линия, тем лучше потолок держит шум на этой частоте. Зелёная заливка — выигрыш MultiFrame.</p>

    <div class="delta-strip">
      <div class="delta-item">
        <div class="k">Воздушный шум · Rw</div>
        <div class="v">${b.Rw} → ${a.Rw} дБ</div>
        <div class="d">Δ +${Math.abs(sim.delta.Rw)} дБ</div>
      </div>
      <div class="delta-item">
        <div class="k">Ударный шум · Lnw</div>
        <div class="v">${b.Lnw} → ${a.Lnw} дБ</div>
        <div class="d">Δ −${Math.abs(sim.delta.Lnw)} дБ</div>
      </div>
    </div>

    ${airSvg}
    ${impactSvg}
  </section>

  <!-- PAGE 3: norms + system -->
  <section class="page" data-page="3">
    ${pageChrome(3, TOTAL, roomLine)}
    <div class="block">
      <div class="sec"><span class="idx">05</span><h2>Нормы комфорта для жилья · СП 51.13330.2011</h2></div>
      <table class="norms">
        <thead><tr><th>Уровень</th><th>Rw, дБ</th><th>Lnw, дБ</th></tr></thead>
        <tbody>
          <tr><td>Высокий комфорт (А)</td><td>≥ ${NORMS.A.Rw}</td><td>≤ ${NORMS.A.Lnw}</td></tr>
          <tr><td>Комфорт (Б)</td><td>≥ ${NORMS.B.Rw}</td><td>≤ ${NORMS.B.Lnw}</td></tr>
          <tr><td>Допустимый (В)</td><td>≥ ${NORMS.V.Rw}</td><td>≤ ${NORMS.V.Lnw}</td></tr>
          <tr class="muted"><td>Ниже допустимого</td><td>&lt; ${NORMS.V.Rw}</td><td>&gt; ${NORMS.V.Lnw}</td></tr>
        </tbody>
      </table>
      <div class="comfort-banner" style="margin-top:12px">
        <div class="k">Класс комфорта с MultiFrame</div>
        <div class="v">«${escapeHtml(officialComfortLabel(hybridAfter))}»</div>
      </div>
      <p class="muted" style="margin-top:8px">Класс комфорта: ${escapeHtml(HYBRID_CLASS_LABELS[hybridBefore])} → ${escapeHtml(HYBRID_CLASS_LABELS[hybridAfter])}.</p>
    </div>

    <div class="block">
      <div class="sec"><span class="idx">06</span><h2>О системе MultiFrame</h2></div>
      <ul class="pillars">${pillars}</ul>
    </div>

    <div class="closing">
      Документ собран по ответам в Проблемомере для объекта «${escapeHtml(roomName)}».
    </div>
  </section>

</div>
</body></html>`;
}

/** Prefetch pdf libs so the click is not waiting on the network. */
export function prefetchAcousticProfilePdf(): void {
  void Promise.all([import('html2canvas'), import('jspdf')]);
}

function waitFrames(n: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) => {
      if (left <= 0) resolve();
      else requestAnimationFrame(() => step(left - 1));
    };
    step(n);
  });
}

function loadIframeDocument(iframe: HTMLIFrameElement, html: string): Promise<Document> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (err) reject(err);
      else {
        const doc = iframe.contentDocument;
        if (!doc?.body) reject(new Error('Не удалось собрать отчёт'));
        else resolve(doc);
      }
    };
    const timer = window.setTimeout(() => finish(new Error('Отчёт не открылся')), 12000);
    iframe.onload = () => finish();
    iframe.srcdoc = html;
    requestAnimationFrame(() => {
      if (iframe.contentDocument?.querySelector('.page')) finish();
    });
  });
}

function triggerDownload(blob: Blob, filename: string, preview: Window | null): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();

  if (preview && !preview.closed) {
    try {
      preview.location.replace(url);
    } catch {
      preview.close();
    }
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Render report as one A4 page image each → PDF download. */
export async function downloadAcousticProfilePdf(
  session: SessionState,
  preview: Window | null = null,
): Promise<void> {
  const full = session.derived ? session : withDerived(session);
  if (!full.derived) {
    preview?.close();
    throw new Error('Нет расчёта для отчёта');
  }

  const html = buildReportDocument(full);
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('title', 'PDF');
  iframe.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    `width:${PAGE_W}px`,
    `height:${PAGE_H}px`,
    'border:0',
    'opacity:0.01',
    'pointer-events:none',
    'z-index:2147483646',
    'background:#fff',
  ].join(';');
  document.body.appendChild(iframe);

  try {
    const idoc = await loadIframeDocument(iframe, html);
    const pages = Array.from(idoc.querySelectorAll('.page')) as HTMLElement[];
    if (pages.length === 0) {
      throw new Error('Не удалось собрать отчёт');
    }

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      pages.forEach((page, j) => {
        page.style.display = j === i ? 'block' : 'none';
      });
      await waitFrames(2);

      const pageEl = pages[i]!;
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        foreignObjectRendering: false,
        windowWidth: PAGE_W,
        windowHeight: PAGE_H,
      });

      const imgData = canvas.toDataURL('image/png', 1);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, undefined, 'FAST');
    }

    const room = full.answers.room;
    const roomName = room.roomType ? ROOM_TYPE_LABELS[room.roomType] : 'komnata';
    const safe = roomName.replace(/[^\wа-яА-ЯёЁ\-]+/gi, '_').slice(0, 24);
    const filename = `MultiFrame_результаты_${safe}_${room.ceilingAreaM2 ?? 'area'}.pdf`;
    const blob = pdf.output('blob');
    triggerDownload(blob, filename, preview);
  } catch (err) {
    preview?.close();
    throw err;
  } finally {
    iframe.remove();
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
