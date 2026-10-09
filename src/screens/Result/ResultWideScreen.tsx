import { Button } from '../../ui/Button';
import { useSession } from '../../state/SessionContext';
import {
  FeltScale,
  MULTIFRAME_PILLARS,
  NORM_ROWS,
  ResultLayoutToggle,
  useResultProfile,
} from './resultShared';
import type { ResultLayout } from './useResultLayout';
import styles from './ResultWideScreen.module.css';

export function ResultWideScreen({
  layoutPreference,
  onLayoutChange,
}: {
  layoutPreference: ResultLayout;
  onLayoutChange: (next: ResultLayout) => void;
}) {
  const { goBack } = useSession();
  const p = useResultProfile();
  const statusBits = [
    p.roomLabel,
    p.room.ceilingAreaM2 ? `${p.room.ceilingAreaM2} м²` : null,
    p.wishLabel !== 'не указано' ? p.wishLabel : null,
  ].filter(Boolean);

  return (
    <div className={styles.root}>
      <header className={styles.hero} data-reveal>
        <div className={styles.heroMain}>
          <p className={styles.heroEyebrow}>Виртуальный акустический профиль</p>
          <h1>Акустический профиль помещения</h1>
          <p className={styles.heroStatus}>
            Профиль собран персонально под вашу комнату.
            {statusBits.length ? (
              <>
                {' '}
                <b>{statusBits.join(' · ')}</b>
              </>
            ) : null}
          </p>
          <div className={styles.heroMeta} aria-label="Ключевые показатели">
            <span className={styles.chip}>
              Сейчас <strong>«{p.beforeOfficial}»</strong>
            </span>
            <span className={`${styles.chip} ${styles.chipAccent}`}>
              С MultiFrame <strong>«{p.afterOfficial}»</strong>
            </span>
            <span className={`${styles.chip} ${styles.chipAccent}`}>
              Воздух тише на <strong>≈ {p.sim.perceivedAirPct}%</strong>
            </span>
            <span className={`${styles.chip} ${styles.chipAccent}`}>
              Удар тише на <strong>≈ {p.sim.perceivedImpactPct}%</strong>
            </span>
          </div>
        </div>
        <div className={styles.heroTools}>
          <ResultLayoutToggle preference={layoutPreference} onChange={onLayoutChange} />
        </div>
      </header>

      <div className={styles.contextRow}>
        <section className={styles.panel} data-reveal aria-label="Объект">
          <header className={styles.panelHead}>
            <p className={styles.panelKicker}>Контекст</p>
            <h2>Ваш объект</h2>
            <p>Параметры, по которым собран профиль.</p>
          </header>
          <dl className={styles.objectGrid}>
            <div>
              <dt>Перекрытие</dt>
              <dd>{p.slabContext}</dd>
            </div>
            <div>
              <dt>Тип дома</dt>
              <dd>{p.houseLabel}</dd>
            </div>
            {p.roomLabel ? (
              <div>
                <dt>Комната</dt>
                <dd>{p.roomLabel}</dd>
              </div>
            ) : null}
            {p.room.ceilingAreaM2 ? (
              <div>
                <dt>Площадь</dt>
                <dd>{p.room.ceilingAreaM2} м²</dd>
              </div>
            ) : null}
            <div>
              <dt>Задача</dt>
              <dd>{p.wishLabel}</dd>
            </div>
          </dl>
        </section>

        <section className={styles.panel} data-reveal aria-label="Нормы комфорта для жилья">
          <header className={styles.panelHead}>
            <p className={styles.panelKicker}>Шкала сравнения</p>
            <h2>Нормы комфорта жилья</h2>
            <p>СП 51.13330.2011 — уровни А / Б / В для перекрытия.</p>
          </header>
          <div className={styles.indexDefs}>
            <p>
              <b>Rw</b> — воздушный шум: <b>больше — лучше</b>
            </p>
            <p>
              <b>Lnw</b> — ударный шум: <b>меньше — лучше</b>
            </p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.normTable}>
              <thead>
                <tr>
                  <th>Уровень</th>
                  <th>
                    Rw
                    <span>воздух · больше лучше</span>
                  </th>
                  <th>
                    Lnw
                    <span>удар · меньше лучше</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {NORM_ROWS.map((r) => (
                  <tr key={r.key} className={r.muted ? styles.normBelow : undefined}>
                    <td>{r.label}</td>
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
      </div>

      <div className={styles.effectRow}>
        <section className={`${styles.panel} ${styles.effectNow}`} data-reveal aria-label="Сейчас">
          <header className={styles.panelHead}>
            <p className={styles.panelKicker}>Эффект</p>
            <h2>Сейчас</h2>
            <p>Как перекрытие работает без MultiFrame.</p>
          </header>
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
          <p className={styles.comfortClass}>
            <span>Класс комфорта помещения</span>
            <b>«{p.beforeOfficial}»</b>
          </p>
        </section>

        <section
          className={`${styles.panel} ${styles.effectAfter}`}
          data-reveal
          aria-label="С MultiFrame"
        >
          <header className={styles.panelHead}>
            <p className={styles.panelKicker}>Эффект</p>
            <h2>С MultiFrame</h2>
            <p>Тот же объект — с системой на потолке.</p>
          </header>

          {p.showScenarioAside ? (
            <aside className={styles.scenario} aria-label="Ваша задача">
              {p.scenarioLine ? <p>{p.scenarioLine}</p> : null}
              {p.drumLine ? <p className={styles.scenarioExtra}>{p.drumLine}</p> : null}
              {p.soundCorrection ? (
                <p className={styles.scenarioExtra}>{p.soundCorrection}</p>
              ) : null}
            </aside>
          ) : null}

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

          <p className={styles.comfortClass}>
            <span>Класс комфорта помещения</span>
            <b>«{p.afterOfficial}»</b>
          </p>

          <div className={styles.metricStrip} aria-label="Прирост по каналам">
            <div className={styles.metric}>
              <span>Δ Rw</span>
              <strong>
                +{Math.abs(Math.round(p.sim.delta.Rw))} <em>дБ</em>
              </strong>
            </div>
            <div className={styles.metric}>
              <span>Δ Lnw</span>
              <strong>
                −{Math.abs(Math.round(p.sim.delta.Lnw))} <em>дБ</em>
              </strong>
            </div>
            <div className={styles.metric}>
              <span>Комфорт</span>
              <strong>
                {p.beforeOfficial} → {p.afterOfficial}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.evidenceRow}>
        <div className={styles.evidenceStack}>
          <section className={styles.panel} data-reveal aria-label="Эхо и комфорт">
            <p className={styles.panelKicker}>Доказательства</p>
            {p.echoNode}
          </section>
          <section className={styles.panel} data-reveal aria-label="Услышать разницу">
            <p className={styles.panelKicker}>Доказательства</p>
            {p.audioNode}
          </section>
        </div>

        <section
          className={`${styles.panel} ${styles.chartsPanel}`}
          data-reveal
          aria-label="Изоляция по частотам"
        >
          <header className={styles.panelHead}>
            <p className={styles.panelKicker}>Доказательства</p>
            <h2>Изоляция по частотам</h2>
            <p className={styles.chartsLead}>
              Чем выше линия, тем лучше перекрытие изолирует шум на этой частоте.
            </p>
          </header>
          <div className={styles.chartsGrid}>
            {p.airChart}
            {p.impactChart}
          </div>
        </section>
      </div>

      <div className={styles.closeRow}>
        <section className={styles.panel} data-reveal aria-label="Уникальность системы MultiFrame">
          <header className={styles.panelHead}>
            <p className={styles.panelKicker}>Система</p>
            <h2>Уникальность MultiFrame</h2>
            <p>Эффективно. Безопасно. Без долгой стройки.</p>
          </header>
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
          <header className={styles.panelHead}>
            <p className={styles.panelKicker}>Дальше</p>
            <h2>Следующий шаг</h2>
            <p>Профиль готов — подберите комплектацию или запросите консультацию.</p>
          </header>
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
