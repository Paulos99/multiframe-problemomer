import { useState, type FormEvent } from 'react';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { Field, TextInput } from '../../ui/Field';
import { CompactAudio } from '../../ui/CompactAudio';
import { SpectrumChart } from '../../ui/SpectrumChart';
import { useSession } from '../../state/SessionContext';
import {
  DISCLAIMER_SIMULATION,
  HYBRID_CLASS_LABELS,
  NORM_FOOTNOTE,
  ROOM_TYPE_LABELS,
  SIMULATION_BADGE,
  type ClassLabel,
} from '../../state/types';
import {
  NORMS,
  airClassFor,
  comfortClassFor,
  deriveSimulation,
  impactClassFor,
} from '../../state/simulation';
import styles from './ResultScreen.module.css';

/** Comfort ladder, worst → best (so «выше» reads left → right). */
const LADDER: ClassLabel[] = ['below', 'V', 'B', 'A'];

const LADDER_SHORT: Record<ClassLabel, string> = {
  below: 'Дискомфорт',
  V: 'Допустимый (В)',
  B: 'Комфорт (Б)',
  A: 'Высокий (А)',
};

/** Comfort norms (СП 51.13330.2011, табл. 2). Rw — не менее; Lnw — не более. */
const NORM_ROWS: { cls: ClassLabel; rw: string; lnw: string }[] = [
  { cls: 'A', rw: `≥ ${NORMS.A.Rw}`, lnw: `≤ ${NORMS.A.Lnw}` },
  { cls: 'B', rw: `≥ ${NORMS.B.Rw}`, lnw: `≤ ${NORMS.B.Lnw}` },
  { cls: 'V', rw: `≥ ${NORMS.V.Rw}`, lnw: `≤ ${NORMS.V.Lnw}` },
  { cls: 'below', rw: `< ${NORMS.V.Rw}`, lnw: `> ${NORMS.V.Lnw}` },
];

function rung(cls: ClassLabel): number {
  return LADDER.indexOf(cls);
}

function channelShort(cls: ClassLabel, kind: 'air' | 'impact'): string {
  if (cls === 'below' && kind === 'impact') return 'вне нормы';
  return LADDER_SHORT[cls];
}

export function ResultScreen() {
  const { session, restart } = useSession();
  const room = session.answers.room;
  const sim = session.derived?.simulation ?? deriveSimulation(session.answers);

  const beforeClass = comfortClassFor(sim.before.Rw, sim.before.Lnw);
  const afterClass = comfortClassFor(sim.after.Rw, sim.after.Lnw);
  const airBeforeClass = airClassFor(sim.before.Rw);
  const airAfterClass = airClassFor(sim.after.Rw);
  const impactBeforeClass = impactClassFor(sim.before.Lnw);
  const impactAfterClass = impactClassFor(sim.after.Lnw);
  const hybridRose = rung(afterClass) > rung(beforeClass);
  const airRose = rung(airAfterClass) > rung(airBeforeClass);
  const ladderBefore = hybridRose || !airRose ? beforeClass : airBeforeClass;
  const ladderAfter = hybridRose || !airRose ? afterClass : airAfterClass;
  const ladderByAir = !hybridRose && airRose;
  const sameLadderRung = ladderBefore === ladderAfter;

  const airBefore = sim.quietAirBefore;
  const airAfter = sim.quietAirAfter;
  const impactBefore = sim.quietImpactBefore;
  const impactAfter = sim.quietImpactAfter;

  const airDb = Math.abs(sim.delta.Rw);
  const impactDb = Math.abs(sim.delta.Lnw);
  const roomLabel = room.roomType ? ROOM_TYPE_LABELS[room.roomType] : null;
  const airSpectrum = sim.airSpectrum;
  const impactSpectrum = sim.impactSpectrum;

  const [showLead, setShowLead] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  function onLead(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    console.info('[lead-demo]', {
      name,
      phone,
      cta: session.cta,
      note: 'demo-only stub — no real StP CRM endpoint',
    });
    setSent(true);
  }

  return (
    <Screen
      dense
      title="Акустический профиль помещения"
      subtitle="Ориентир комфорта для вашей комнаты и следующий шаг к расчёту"
    >
      <div className={styles.verdict} role="status">
        <p className={styles.oneLiner}>
          {hybridRose
            ? 'В этой комнате MultiFrame поднимает комфорт на ступень выше.'
            : airRose
              ? `MultiFrame нужен: речь и музыка сверху станут заметно тише (воздух → «${HYBRID_CLASS_LABELS[airAfterClass]}»).`
              : 'В этой комнате MultiFrame заметно смягчает шум сверху — полный класс СП пока держит удар.'}
        </p>
        {hybridRose ? (
          <p className={styles.classShift}>
            Сейчас: <b>{HYBRID_CLASS_LABELS[beforeClass]}</b>
            <span className={styles.arrow} aria-hidden>
              {' → '}
            </span>
            с MultiFrame: <b className={styles.accent}>{HYBRID_CLASS_LABELS[afterClass]}</b>
          </p>
        ) : (
          <>
            <p className={styles.classShift}>
              Полный класс СП: <b>{HYBRID_CLASS_LABELS[beforeClass]}</b>
              {beforeClass === afterClass
                ? ' — не меняется, пока удар вне нормы'
                : (
                    <>
                      <span className={styles.arrow} aria-hidden>
                        {' → '}
                      </span>
                      с MultiFrame:{' '}
                      <b className={styles.accent}>{HYBRID_CLASS_LABELS[afterClass]}</b>
                    </>
                  )}
            </p>
            <ul className={styles.channels}>
              <li>
                <span className={styles.channelName}>Воздух</span>
                {channelShort(airBeforeClass, 'air')}
                <span className={styles.arrow} aria-hidden>
                  {' → '}
                </span>
                <b className={airRose ? styles.accent : undefined}>
                  {channelShort(airAfterClass, 'air')}
                </b>
                <span className={styles.channelMeta}>
                  Rw {sim.before.Rw} → {sim.after.Rw}
                </span>
              </li>
              <li>
                <span className={styles.channelName}>Удар</span>
                {channelShort(impactBeforeClass, 'impact')}
                <span className={styles.arrow} aria-hidden>
                  {' → '}
                </span>
                <b>{channelShort(impactAfterClass, 'impact')}</b>
                <span className={styles.channelMeta}>
                  Lnw {sim.before.Lnw} → {sim.after.Lnw}
                </span>
              </li>
            </ul>
            <p className={styles.channelWhy}>
              Полный класс СП — это «И» по двум каналам. Сейчас удар Lnw {sim.after.Lnw} при норме
              В ≤ {NORMS.V.Lnw}: MultiFrame смягчает шаги, но норму по удару чаще закрывает пол у
              соседа сверху. Без потолка воздух останется слабым — материал как раз про него.
            </p>
          </>
        )}

        <div
          className={styles.ladder}
          aria-label={
            ladderByAir
              ? 'Шкала по воздушному шуму'
              : 'Шкала комфортности помещения (полный класс СП)'
          }
        >
          <div className={styles.ladderTrack} aria-hidden />
          {LADDER.map((cls) => {
            const isBefore = cls === ladderBefore;
            const isAfter = cls === ladderAfter && !sameLadderRung;
            const tag = sameLadderRung && isBefore
              ? 'полный класс'
              : isBefore
                ? 'Сейчас'
                : isAfter
                  ? 'MultiFrame'
                  : '';
            return (
              <div
                key={cls}
                className={`${styles.rung} ${isBefore ? styles.rungBefore : ''} ${
                  isAfter ? styles.rungAfter : ''
                }`}
              >
                <span className={styles.rungTag}>{tag}</span>
                <span className={styles.rungDot} />
                <span className={styles.rungName}>{LADDER_SHORT[cls]}</span>
              </div>
            );
          })}
        </div>
        {ladderByAir ? (
          <p className={styles.ladderCaption}>
            Шкала по воздушному шуму. Удар: {channelShort(impactBeforeClass, 'impact')} →{' '}
            {channelShort(impactAfterClass, 'impact')} — норма СП по удару потолком не закрывается.
          </p>
        ) : null}
        {sameLadderRung && !hybridRose && !airRose ? (
          <p className={styles.ladderCaption}>
            Полный класс не сдвигается: удар ещё вне нормы СП. Ниже — насколько станет тише.
          </p>
        ) : null}

        {roomLabel ? (
          <p className={styles.roomMeta}>
            {roomLabel}
            {room.ceilingAreaM2 ? ` · ${room.ceilingAreaM2} м²` : ''}
          </p>
        ) : null}
        <p className={styles.normNote}>{NORM_FOOTNOTE}</p>
      </div>

      <section className={styles.normTable} aria-label="Классы комфорта в дБ">
        <h2>Классы комфорта в дБ</h2>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Уровень комфорта</th>
                <th>
                  Воздушный, Rw
                  <span>чем больше, тем лучше</span>
                </th>
                <th>
                  Ударный, Lnw
                  <span>чем меньше, тем лучше</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {NORM_ROWS.map((r) => {
                const isBefore = r.cls === beforeClass;
                const isAfter = r.cls === afterClass && hybridRose;
                const isStuck = r.cls === afterClass && !hybridRose;
                return (
                  <tr
                    key={r.cls}
                    className={`${isBefore || isStuck ? styles.rowBefore : ''} ${
                      isAfter ? styles.rowAfter : ''
                    }`}
                  >
                    <td>
                      <span className={styles.rowName}>{LADDER_SHORT[r.cls]}</span>
                      {isBefore && !isStuck ? (
                        <span className={styles.rowTagNow}>сейчас</span>
                      ) : null}
                      {isAfter ? (
                        <span className={styles.rowTagMf}>MultiFrame</span>
                      ) : null}
                      {isStuck ? (
                        <span className={styles.rowTagNow}>полный класс</span>
                      ) : null}
                    </td>
                    <td>
                      {r.rw} <em>дБ</em>
                    </td>
                    <td>
                      {r.lnw} <em>дБ</em>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>
          Категории — СП 51.13330.2011 «Защита от шума», табл. 2 (межквартирные
          перекрытия).
          {!hybridRose
            ? ` Полный класс требует и Rw, и Lnw. С MultiFrame воздух ${sim.after.Rw} дБ (${channelShort(airAfterClass, 'air')}), удар ${sim.after.Lnw} дБ — норма В по удару ≤ ${NORMS.V.Lnw}, потолок один её не закрывает.`
            : ''}
        </p>
      </section>

      <div className={styles.dual}>
        <article className={`${styles.emotionCard} ${styles.before}`}>
          <span className={styles.tag}>Сейчас</span>
          <ul>
            <li>Соседи сверху слышны слишком отчётливо</li>
            <li>Бытовые звуки сверху легко различить</li>
            <li>Сейчас: {HYBRID_CLASS_LABELS[beforeClass]}</li>
          </ul>
        </article>
        <article className={`${styles.emotionCard} ${styles.after}`}>
          <span className={styles.tag}>С MultiFrame</span>
          <ul>
            <li>В комнате заметно спокойнее</li>
            <li>Ударный и воздушный шум воспринимаются мягче</li>
            <li>
              {hybridRose
                ? `С MultiFrame: ${HYBRID_CLASS_LABELS[afterClass]}`
                : airRose
                  ? `Воздух → ${HYBRID_CLASS_LABELS[airAfterClass]}; полный класс СП ещё держит удар`
                  : `Тише по ощущению; полный класс СП ещё держит удар`}
            </li>
          </ul>
        </article>
      </div>

      <section className={styles.quieter} aria-label="Насколько станет тише">
        <header>
          <h2>Насколько станет тише</h2>
          <p>{SIMULATION_BADGE}</p>
        </header>

        <div className={styles.deltaGrid}>
          <article className={styles.deltaCard}>
            <span className={styles.deltaKind}>Звукоизоляция воздушного шума</span>
            <p className={styles.deltaValue}>
              <span>+</span>
              {airDb}
              <small>дБ</small>
            </p>
            <p className={styles.deltaHint}>
              Rw {sim.before.Rw} → {sim.after.Rw}: чем больше — тем тише речь и музыка сверху.
            </p>
          </article>
          <article className={styles.deltaCard}>
            <span className={styles.deltaKind}>Уровень ударного шума</span>
            <p className={styles.deltaValue}>
              <span>−</span>
              {impactDb}
              <small>дБ</small>
            </p>
            <p className={styles.deltaHint}>
              Lnw {sim.before.Lnw} → {sim.after.Lnw}: чем меньше — тем мягче шаги и удары.
            </p>
          </article>
        </div>

        <div className={styles.qRow}>
          <div className={styles.qHead}>
            <span className={styles.qName}>Воздушный шум</span>
            <span className={styles.qEx}>голоса, ТВ, музыка сверху</span>
          </div>
          <div
            className={styles.qBar}
            role="img"
            aria-label={`Воздушный шум: тише примерно на ${sim.perceivedAirPct}%`}
          >
            <span className={styles.qFillAfter} style={{ width: `${airAfter}%` }} />
            <span className={styles.qFillBefore} style={{ width: `${airBefore}%` }} />
          </div>
          <p className={styles.qHero}>≈ на {sim.perceivedAirPct}% тише по ощущению</p>
        </div>

        <div className={styles.qRow}>
          <div className={styles.qHead}>
            <span className={styles.qName}>Ударный шум</span>
            <span className={styles.qEx}>шаги, бег детей, падения предметов</span>
          </div>
          <div
            className={styles.qBar}
            role="img"
            aria-label={`Ударный шум: тише примерно на ${sim.perceivedImpactPct}%`}
          >
            <span className={styles.qFillAfter} style={{ width: `${impactAfter}%` }} />
            <span className={styles.qFillBefore} style={{ width: `${impactBefore}%` }} />
          </div>
          <p className={styles.qHero}>≈ на {sim.perceivedImpactPct}% тише по ощущению</p>
        </div>

        <p className={styles.legend}>
          <span className={styles.legendBefore} /> сейчас
          <span className={styles.legendAfter} /> с MultiFrame
        </p>

        <div className={styles.charts}>
          <header>
            <h3>Изоляция по частотам</h3>
            <p>
              Кривые — изоляция этой конструкции (плита, дом, пол, натяжной). «После» — с частотным
              Δ MultiFrame. Чем выше линия — тем лучше изоляция (тише в комнате).
            </p>
          </header>
          <SpectrumChart
            title="Воздушный шум"
            subtitle="R(f), дБ · чем выше — тем тише речь и музыка сверху"
            series={airSpectrum}
            yLabel="дБ"
          />
          <SpectrumChart
            title="Ударный шум"
            subtitle="По полосам Гц · чем выше — тем мягче шаги и удары"
            series={impactSpectrum}
            yLabel="дБ"
          />
        </div>

        <p className={styles.qNote}>
          {DISCLAIMER_SIMULATION} Индексы — про перекрытие; громкость в комнате — ещё и про
          то, как шумят сверху.
        </p>
      </section>

      <CompactAudio pairs={session.audio.pairs} sim={sim} />

      <div className={styles.features}>
        <h2>Почему именно MultiFrame</h2>
        <ul>
          <li>
            <strong>Обычный натяжной потолок усиливает шум сверху, как полотно барабана.</strong>
            <span>
              MultiFrame рассеивает энергию в самой панели — комната воспринимается спокойнее,
              без тяжёлого каркаса.
            </span>
          </li>
          <li>
            <strong>Монтаж идёт так же быстро, как у обычного натяжного потолка.</strong>
            <span>Быстро собирается на объекте: без долгой стройки и лишней потери высоты.</span>
          </li>
        </ul>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" fullWidth onClick={() => setShowLead((v) => !v)}>
          Запросить консультацию или подбор
        </Button>
      </div>

      {showLead ? (
        <form className={styles.form} onSubmit={onLead}>
          <h3>Заявка на консультацию</h3>
          <p>Разберём ваш случай, подберём материал.</p>
          <Field label="Имя">
            <TextInput
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как к вам обращаться"
            />
          </Field>
          <Field label="Телефон">
            <TextInput
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 …"
            />
          </Field>
          <Button type="submit" fullWidth disabled={sent}>
            {sent ? 'Заявка принята' : 'Отправить'}
          </Button>
        </form>
      ) : null}

      <Button variant="ghost" onClick={restart}>
        Пройти ещё раз
      </Button>
    </Screen>
  );
}
