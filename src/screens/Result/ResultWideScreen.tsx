import { Button } from '../../ui/Button';
import { SpectrumChart } from '../../ui/SpectrumChart';
import { useSession } from '../../state/SessionContext';
import type { ClassLabel } from '../../state/types';
import { officialComfortLabel } from '../../state/simulation';
import {
  FeltScale,
  MULTIFRAME_PILLARS,
  NORM_ROWS,
  useResultProfile,
} from './resultShared';
import styles from './ResultWideScreen.module.css';

/** Worse → better along the SP hybrid ladder. */
const RAIL_STEPS: { id: ClassLabel; letter: string; name: string }[] = [
  { id: 'below', letter: 'ниже', name: 'Ниже' },
  { id: 'V', letter: 'В', name: 'Допустимый' },
  { id: 'B', letter: 'Б', name: 'Комфорт' },
  { id: 'A', letter: 'А', name: 'Высокий' },
];

function stepIndex(cls: ClassLabel): number {
  return RAIL_STEPS.findIndex((s) => s.id === cls);
}

function ComfortRail({ before, after }: { before: ClassLabel; after: ClassLabel }) {
  const beforeLabel = officialComfortLabel(before);
  const afterLabel = officialComfortLabel(after);
  const same = before === after;
  const bi = stepIndex(before);
  const ai = stepIndex(after);
  const fillTo = Math.max(bi, ai);

  return (
    <div
      className={styles.rail}
      role="img"
      aria-label={
        same
          ? `Класс комфорта: ${beforeLabel}`
          : `Класс комфорта: сейчас ${beforeLabel}, с MultiFrame ${afterLabel}`
      }
    >
      <div className={styles.railHead}>
        <strong>Класс комфорта помещения</strong>
        <p className={styles.railShift}>
          {same ? (
            <>
              Остаётся <b className={styles.to}>«{afterLabel}»</b>
            </>
          ) : (
            <>
              <span className={styles.railPillMuted}>Сейчас · {beforeLabel}</span>
              <span className={styles.railPill}>После · {afterLabel}</span>
            </>
          )}
        </p>
      </div>

      <div className={styles.railTrack} aria-hidden>
        <span
          className={styles.railFill}
          style={{ width: `${((fillTo + 0.5) / RAIL_STEPS.length) * 100}%` }}
        />
        {RAIL_STEPS.map((step, i) => {
          const isBefore = step.id === before;
          const isAfter = step.id === after;
          const reached = i <= fillTo;
          return (
            <div
              key={step.id}
              className={`${styles.railSeg} ${reached ? styles.railSegOn : ''} ${isBefore || isAfter ? styles.railSegFocus : ''}`}
            >
              <span className={styles.railDot} data-before={isBefore ? '' : undefined} data-after={isAfter ? '' : undefined} />
              <span className={styles.railLetter}>{step.letter}</span>
              <span className={styles.railName}>{step.name}</span>
              <div className={styles.railMarks}>
                {isBefore && isAfter && same ? (
                  <span className={styles.markNow}>Сейчас · После</span>
                ) : (
                  <>
                    {isBefore ? <span className={styles.markNow}>Сейчас</span> : null}
                    {isAfter && !same ? <span className={styles.markAfter}>После</span> : null}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ResultWideScreen() {
  const { goBack } = useSession();
  const p = useResultProfile();

  const deltaRw = Math.abs(Math.round(p.sim.delta.Rw));
  const deltaLnw = Math.abs(Math.round(p.sim.delta.Lnw));
  const quieterAir = p.sim.perceivedAirPct;
  const quieterImpact = p.sim.perceivedImpactPct;

  const objectCells: { label: string; value: string }[] = [
    { label: 'Перекрытие', value: p.slabContext },
    { label: 'Тип дома', value: p.houseLabel },
  ];
  if (p.roomLabel) objectCells.push({ label: 'Комната', value: p.roomLabel });
  if (p.room.ceilingAreaM2) {
    objectCells.push({ label: 'Площадь', value: `${p.room.ceilingAreaM2} м²` });
  }
  objectCells.push({ label: 'Задача', value: p.wishLabel });

  return (
    <div className={styles.root}>
      <header className={styles.titleBar} data-reveal>
        <h1>Акустический профиль помещения</h1>
      </header>

      <section className={styles.objectSpec} data-reveal aria-label="Объект">
        <div className={styles.objectSpecLabel}>
          <span>Параметры</span>
          <strong>Объект</strong>
        </div>
        <dl className={styles.objectSpecGrid}>
          {objectCells.map((cell) => (
            <div key={cell.label}>
              <dt>{cell.label}</dt>
              <dd>{cell.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.kpiRow} data-reveal aria-label="Ключевые показатели">
        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Δ Rw · воздух</span>
          <strong className={styles.kpiValue}>
            +{deltaRw}
            <em>дБ</em>
          </strong>
          <span className={styles.kpiPill}>изоляция ↑</span>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Δ Lnw · удар</span>
          <strong className={styles.kpiValue}>
            −{deltaLnw}
            <em>дБ</em>
          </strong>
          <span className={styles.kpiPill}>шум ↓</span>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Тише на слух</span>
          <strong className={styles.kpiValue}>
            ≈{Math.max(quieterAir, quieterImpact)}
            <em>%</em>
          </strong>
          <span className={styles.kpiPill}>
            воздух {quieterAir}% · удар {quieterImpact}%
          </span>
        </article>
        <article className={`${styles.kpiCard} ${styles.kpiCardAccent}`}>
          <span className={styles.kpiLabel}>Класс с MultiFrame</span>
          <strong className={styles.kpiValueClass}>«{p.afterOfficial}»</strong>
          <span className={styles.kpiPillLight}>было «{p.beforeOfficial}»</span>
        </article>
      </section>

      <section className={styles.panel} data-reveal aria-label="Нормы комфорта для жилья">
        <div className={styles.normsHead}>
          <h2>Нормы комфорта жилья</h2>
          <p className={styles.normDefs}>
            <b>Rw</b> воздух · больше лучше &nbsp;·&nbsp; <b>Lnw</b> удар · меньше лучше
          </p>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.normTable}>
            <thead>
              <tr>
                <th>Уровень</th>
                <th>Rw</th>
                <th>Lnw</th>
              </tr>
            </thead>
            <tbody>
              {NORM_ROWS.map((r) => (
                <tr key={r.key} className={r.muted ? styles.normBelow : undefined}>
                  <td>
                    <span className={styles.normLevel}>
                      <span className={styles.normDot} data-muted={r.muted ? '' : undefined} />
                      {r.label}
                    </span>
                  </td>
                  <td>
                    {r.rw} <em>дБ</em>
                  </td>
                  <td>
                    {r.lnw} <em>дБ</em>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.effect} data-reveal aria-label="Сейчас и с MultiFrame">
        <div className={styles.effectTop}>
          <h2>Сейчас и с MultiFrame</h2>
        </div>

        {p.showScenarioAside ? (
          <aside className={styles.scenario} aria-label="Ваша задача">
            {p.scenarioLine ? <p>{p.scenarioLine}</p> : null}
            {p.drumLine ? <p className={styles.scenarioExtra}>{p.drumLine}</p> : null}
            {p.soundCorrection ? <p className={styles.scenarioExtra}>{p.soundCorrection}</p> : null}
          </aside>
        ) : null}

        <div className={styles.compareGrid}>
          <div className={styles.compareCard}>
            <h3>Сейчас</h3>
            <div className={styles.feltStack}>
              <FeltScale
                title="Воздушный шум (голоса и музыка)"
                now={p.airNowFelt}
                indexKind="Rw"
                nowIndex={p.sim.before.Rw}
                mode="nowOnly"
              />
              <FeltScale
                title="Ударный шум (шаги и падения)"
                now={p.impactNowFelt}
                indexKind="Lnw"
                nowIndex={p.sim.before.Lnw}
                mode="nowOnly"
              />
            </div>
          </div>

          <div className={`${styles.compareCard} ${styles.compareAfter}`}>
            <h3>С MultiFrame</h3>
            <div className={styles.feltStack}>
              <FeltScale
                title="Воздушный шум (голоса и музыка)"
                now={p.airNowFelt}
                after={p.airAfterFelt}
                indexKind="Rw"
                nowIndex={p.sim.before.Rw}
                afterIndex={p.sim.after.Rw}
                quieterPct={p.sim.perceivedAirPct}
                quieterDeltaDb={Math.abs(p.sim.delta.Rw)}
                mode="nowAndAfter"
              />
              <FeltScale
                title="Ударный шум (шаги и падения)"
                now={p.impactNowFelt}
                after={p.impactAfterFelt}
                indexKind="Lnw"
                nowIndex={p.sim.before.Lnw}
                afterIndex={p.sim.after.Lnw}
                quieterPct={p.sim.perceivedImpactPct}
                quieterDeltaDb={Math.abs(p.sim.delta.Lnw)}
                mode="nowAndAfter"
              />
            </div>
          </div>
        </div>

        <ComfortRail before={p.hybridBefore} after={p.hybridAfter} />
      </section>

      <section className={styles.listen} data-reveal aria-label="Сравнить на слух">
        <header className={styles.listenHead}>
          <div>
            <h2>Сравнить на слух</h2>
            <p className={styles.panelLead}>Эхо в комнате и звук сверху — до и после.</p>
          </div>
        </header>
        <div className={styles.listenBody}>
          <div className={styles.listenEcho}>{p.echoNode}</div>
          <div className={styles.listenAudio}>{p.audioNode}</div>
        </div>
      </section>

      <section className={styles.charts} data-reveal aria-label="Изоляция по частотам">
        <header className={styles.chartsHead}>
          <div>
            <h2>Изоляция по частотам</h2>
            <p className={styles.panelLead}>
              Чем выше линия, тем лучше перекрытие изолирует шум на этой частоте.
            </p>
          </div>
          <div className={styles.chartsLegend} aria-hidden>
            <span>
              <i className={styles.legNow} /> Сейчас
            </span>
            <span>
              <i className={styles.legAfter} /> MultiFrame
            </span>
          </div>
        </header>
        <div className={styles.chartsGrid}>
          <SpectrumChart
            tall
            title="Воздушный шум (голоса и музыка)"
            subtitle="изоляция от голосов и музыки сверху"
            series={p.sim.airSpectrum}
            yLabel="дБ"
            indexBadge={{ kind: 'Rw', before: p.sim.before.Rw, after: p.sim.after.Rw }}
            reductionDb={Math.abs(p.sim.delta.Rw)}
            reductionPct={p.sim.perceivedAirPct}
          />
          <SpectrumChart
            tall
            title="Ударный шум (шаги и падения)"
            subtitle="изоляция от шагов и падений"
            series={p.sim.impactSpectrum}
            yLabel="дБ"
            indexBadge={{ kind: 'Lnw', before: p.sim.before.Lnw, after: p.sim.after.Lnw }}
            reductionDb={Math.abs(p.sim.delta.Lnw)}
            reductionPct={p.sim.perceivedImpactPct}
          />
        </div>
      </section>

      <div className={styles.closeRow}>
        <section className={styles.panel} data-reveal aria-label="Уникальность системы MultiFrame">
          <h2>Уникальность MultiFrame</h2>
          <ul className={styles.uniqGrid}>
            {MULTIFRAME_PILLARS.map((item) => (
              <li key={item.title} className={styles.uniqPillar}>
                <span className={styles.uniqPillarMark} aria-hidden />
                <div className={styles.uniqPillarBody}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          className={`${styles.panel} ${styles.nextPanel}`}
          data-reveal
          aria-label="Следующий шаг"
        >
          <h2>Следующий шаг</h2>
          <p className={styles.panelLead}>
            Подберите комплектацию MultiFrame или запросите консультацию.
          </p>
          <div className={styles.nextActions}>
            <Button fullWidth onClick={p.openCalc}>
              Рассчитать количество MultiFrame
            </Button>
            <Button variant="secondary" fullWidth onClick={p.openConsultation}>
              Запросить консультацию или подбор
            </Button>
            <div className={styles.splitActions}>
              <Button
                variant="ghost"
                disabled={p.pdfBusy}
                onClick={() => void p.onDownloadProfile()}
              >
                {p.pdfBusy ? 'Готовим PDF…' : 'Скачать PDF'}
              </Button>
              <Button variant="ghost" onClick={() => void p.onShare()}>
                {p.shareLabel}
              </Button>
            </div>
            {p.pdfError ? (
              <p className={styles.pdfError} role="alert">
                Не удалось скачать. Разрешите всплывающие окна и нажмите ещё раз.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <div className={styles.footerActions}>
        <Button variant="ghost" onClick={goBack}>
          Назад
        </Button>
        <Button variant="ghost" onClick={p.restart}>
          Пройти ещё раз
        </Button>
      </div>
    </div>
  );
}
