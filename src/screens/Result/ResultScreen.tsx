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

function channelLabel(cls: ClassLabel, kind: 'air' | 'impact'): string {
  if (cls === 'below' && kind === 'impact') return 'Вне нормы';
  if (cls === 'below') return 'Дискомфорт';
  return HYBRID_CLASS_LABELS[cls];
}

function ChannelLadder({
  title,
  before,
  after,
  kind,
  meta,
}: {
  title: string;
  before: ClassLabel;
  after: ClassLabel;
  kind: 'air' | 'impact';
  meta: string;
}) {
  const rose = rung(after) > rung(before);
  const same = before === after;
  return (
    <article className={styles.channelCard} aria-label={`${title}: ${channelLabel(before, kind)} → ${channelLabel(after, kind)}`}>
      <header className={styles.channelHead}>
        <div>
          <span className={styles.channelTitle}>{title}</span>
          <p className={styles.channelShift}>
            {channelLabel(before, kind)}
            <span className={styles.arrow} aria-hidden>
              {' → '}
            </span>
            <b className={rose ? styles.accent : undefined}>{channelLabel(after, kind)}</b>
          </p>
        </div>
        <span className={styles.channelMeta}>{meta}</span>
      </header>
      <div className={styles.ladder} aria-hidden>
        <div className={styles.ladderTrack} />
        {LADDER.map((cls) => {
          const isBefore = cls === before;
          const isAfter = cls === after && !same;
          const both = same && isBefore;
          const tag = both ? 'сейчас · MF' : isBefore ? 'Сейчас' : isAfter ? 'MF' : '';
          return (
            <div
              key={cls}
              className={`${styles.rung} ${isBefore || both ? styles.rungBefore : ''} ${
                isAfter ? styles.rungAfter : ''
              } ${both ? styles.rungBoth : ''}`}
            >
              <span className={styles.rungTag}>{tag}</span>
              <span className={styles.rungDot} />
              <span className={styles.rungName}>{LADDER_SHORT[cls]}</span>
            </div>
          );
        })}
      </div>
      {same && kind === 'impact' && after === 'below' ? (
        <p className={styles.channelNote}>
          Норма В по удару — Lnw ≤ {NORMS.V.Lnw}. Потолок смягчает, полную норму чаще закрывает пол
          сверху.
        </p>
      ) : null}
      {rose ? (
        <p className={styles.channelNote}>
          {kind === 'air'
            ? 'Воздух поднялся по шкале комфорта СП.'
            : 'Удар стал мягче по шкале комфорта СП.'}
        </p>
      ) : null}
    </article>
  );
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
  const airRose = rung(airAfterClass) > rung(airBeforeClass);
  const impactRose = rung(impactAfterClass) > rung(impactBeforeClass);
  const hybridRose = rung(afterClass) > rung(beforeClass);

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

  const oneLiner = (() => {
    if (airRose && impactRose) {
      return 'В этой комнате MultiFrame поднимает комфорт и по воздуху, и по удару.';
    }
    if (airRose) {
      return `MultiFrame заметно поднимает комфорт по воздуху → «${channelLabel(airAfterClass, 'air')}».`;
    }
    if (impactRose) {
      return `MultiFrame смягчает удар → «${channelLabel(impactAfterClass, 'impact')}».`;
    }
    return 'В этой комнате MultiFrame делает шум сверху мягче — смотрите уровни по каналам.';
  })();

  return (
    <Screen
      dense
      title="Акустический профиль помещения"
      subtitle="Ориентир комфорта для вашей комнаты и следующий шаг к расчёту"
    >
      <div className={styles.verdict} role="status">
        <p className={styles.oneLiner}>{oneLiner}</p>
        <p className={styles.classShift}>
          Уровни комфорта считаются <b>отдельно</b> для воздуха (Rw) и удара (Lnw) — так честнее, чем
          один общий класс.
        </p>

        <div className={styles.channelGrid}>
          <ChannelLadder
            title="Воздушный шум"
            before={airBeforeClass}
            after={airAfterClass}
            kind="air"
            meta={`Rw ${sim.before.Rw} → ${sim.after.Rw}`}
          />
          <ChannelLadder
            title="Ударный шум"
            before={impactBeforeClass}
            after={impactAfterClass}
            kind="impact"
            meta={`Lnw ${sim.before.Lnw} → ${sim.after.Lnw}`}
          />
        </div>

        <p className={styles.hybridNote}>
          Полный класс СП (оба канала сразу): <b>{HYBRID_CLASS_LABELS[beforeClass]}</b>
          {hybridRose ? (
            <>
              <span className={styles.arrow} aria-hidden>
                {' → '}
              </span>
              <b className={styles.accent}>{HYBRID_CLASS_LABELS[afterClass]}</b>
            </>
          ) : (
            <> — {HYBRID_CLASS_LABELS[afterClass]}</>
          )}
          . Требует Rw и Lnw вместе; потолок один редко закрывает норму по удару.
        </p>

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
                const airNow = r.cls === airBeforeClass;
                const airMf = r.cls === airAfterClass;
                const impNow = r.cls === impactBeforeClass;
                const impMf = r.cls === impactAfterClass;
                const rowHit = airNow || airMf || impNow || impMf;
                return (
                  <tr
                    key={r.cls}
                    className={`${rowHit ? styles.rowHit : ''} ${
                      airMf || impMf ? styles.rowAfter : ''
                    } ${airNow || impNow ? styles.rowBefore : ''}`}
                  >
                    <td>
                      <span className={styles.rowName}>{LADDER_SHORT[r.cls]}</span>
                    </td>
                    <td>
                      {r.rw} <em>дБ</em>
                      {airNow && !airMf ? <span className={styles.rowTagNow}>сейчас</span> : null}
                      {airMf && !airNow ? <span className={styles.rowTagMf}>MultiFrame</span> : null}
                      {airNow && airMf ? (
                        <span className={styles.rowTagMf}>сейчас · MF</span>
                      ) : null}
                    </td>
                    <td>
                      {r.lnw} <em>дБ</em>
                      {impNow && !impMf ? <span className={styles.rowTagNow}>сейчас</span> : null}
                      {impMf && !impNow ? <span className={styles.rowTagMf}>MultiFrame</span> : null}
                      {impNow && impMf ? (
                        <span className={styles.rowTagMf}>сейчас · MF</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>
          Категории — СП 51.13330.2011 «Защита от шума», табл. 2. Метки в колонках — где стоит
          ваш воздух и ваш удар по отдельности, не один общий класс.
        </p>
      </section>

      <div className={styles.dual}>
        <article className={`${styles.emotionCard} ${styles.before}`}>
          <span className={styles.tag}>Сейчас</span>
          <ul>
            <li>Соседи сверху слышны слишком отчётливо</li>
            <li>Бытовые звуки сверху легко различить</li>
            <li>
              Воздух: {channelLabel(airBeforeClass, 'air')} · удар:{' '}
              {channelLabel(impactBeforeClass, 'impact')}
            </li>
          </ul>
        </article>
        <article className={`${styles.emotionCard} ${styles.after}`}>
          <span className={styles.tag}>С MultiFrame</span>
          <ul>
            <li>В комнате заметно спокойнее</li>
            <li>Ударный и воздушный шум воспринимаются мягче</li>
            <li>
              Воздух: {channelLabel(airAfterClass, 'air')} · удар:{' '}
              {channelLabel(impactAfterClass, 'impact')}
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
          {DISCLAIMER_SIMULATION} Индексы — про перекрытие; громкость в комнате — ещё и про то,
          как шумят сверху.
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
