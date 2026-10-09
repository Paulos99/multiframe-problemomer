import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import {
  FeltScale,
  MULTIFRAME_PILLARS,
  NORM_ROWS,
  ResultLayoutToggle,
  useResultProfile,
} from './resultShared';
import type { ResultLayout } from './useResultLayout';
import styles from './ResultScreen.module.css';

export function ResultScreen({
  showLayoutToggle = false,
  layoutPreference = 'classic',
  onLayoutChange,
}: {
  showLayoutToggle?: boolean;
  layoutPreference?: ResultLayout;
  onLayoutChange?: (next: ResultLayout) => void;
} = {}) {
  const p = useResultProfile();

  return (
    <Screen dense title="Акустический профиль помещения">
      {showLayoutToggle && onLayoutChange ? (
        <div className={styles.layoutBar}>
          <ResultLayoutToggle preference={layoutPreference} onChange={onLayoutChange} />
        </div>
      ) : null}
      <section className={styles.block} data-reveal aria-label="Нормы комфорта для жилья">
        <header className={styles.sectionHead}>
          <h2>Нормы комфорта для жилья</h2>
          <p>
            Сравниваем ваше <b>перекрытие</b> с нормой комфорта жилья по СП 51.13330.2011.
          </p>
          <ul className={styles.normLeadList}>
            <li>
              <b>А / Б / В</b> — уровни комфорта из нормы
            </li>
            <li>Дальше покажем, где вы сейчас и что даёт MultiFrame</li>
          </ul>
          <div className={styles.indexDefs}>
            <p>
              <b>Rw</b> — изоляция от воздушного шума (голоса, музыка): <b>больше — лучше</b>
            </p>
            <p>
              <b>Lnw</b> — ударный шум (шаги, падения): <b>меньше — лучше</b>
            </p>
          </div>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.normTableSimple}>
            <thead>
              <tr>
                <th>Уровень</th>
                <th>
                  Воздушный шум, Rw
                  <span>голоса и музыка · больше — лучше</span>
                </th>
                <th>
                  Ударный шум, Lnw
                  <span>шаги и падения · меньше — лучше</span>
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

      <section className={styles.block} data-reveal aria-label="Текущая ситуация">
        <header className={styles.sectionHead}>
          <h2>Текущая ситуация</h2>
        </header>

        <div className={styles.objectCard} aria-label="Объект">
          <h3>Объект</h3>
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
        </div>

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

      <section className={styles.block} data-reveal aria-label="С MultiFrame">
        <header className={styles.sectionHead}>
          <h2>С MultiFrame</h2>
        </header>

        {p.showScenarioAside ? (
          <aside className={styles.scenario} aria-label="Ваша задача">
            {p.scenarioLine ? <p>{p.scenarioLine}</p> : null}
            {p.drumLine ? <p className={styles.scenarioExtra}>{p.drumLine}</p> : null}
            {p.soundCorrection ? <p className={styles.scenarioExtra}>{p.soundCorrection}</p> : null}
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

        {p.echoNode}
        {p.audioNode}

        <div className={styles.charts}>
          <header>
            <h3>Изоляция по частотам</h3>
            <p>Чем выше линия на графике, тем лучше перекрытие изолирует шум на этой частоте.</p>
          </header>
          {p.airChart}
          {p.impactChart}
        </div>
      </section>

      <section className={styles.reasons} data-reveal aria-label="Уникальность системы MultiFrame">
        <header className={styles.sectionHead}>
          <h2>Уникальность системы MultiFrame</h2>
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

      <section className={styles.nextStep} data-reveal aria-label="Следующий шаг">
        <header>
          <h2>Следующий шаг</h2>
          <p>Профиль комнаты готов. В калькуляторе можно подобрать комплектацию MultiFrame.</p>
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
              className={styles.splitBtn}
              disabled={p.pdfBusy}
              onClick={() => void p.onDownloadProfile()}
            >
              {p.pdfBusy ? 'Готовим PDF…' : 'Скачать результаты'}
            </Button>
            <Button variant="ghost" className={styles.splitBtn} onClick={() => void p.onShare()}>
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

      <Button variant="ghost" onClick={p.restart}>
        Пройти ещё раз
      </Button>
    </Screen>
  );
}
