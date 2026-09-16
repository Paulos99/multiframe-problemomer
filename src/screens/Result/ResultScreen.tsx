import { useState, type FormEvent } from 'react';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { Field, TextInput } from '../../ui/Field';
import { CompactAudio } from '../../ui/CompactAudio';
import { SpectrumChart } from '../../ui/SpectrumChart';
import { useSession } from '../../state/SessionContext';
import {
  EVERYDAY_COMFORT_LABELS,
  HYBRID_CLASS_LABELS,
  LOG_DB_FOOTNOTE,
  ROOM_TYPE_LABELS,
  SIMULATION_BADGE,
  type ClassLabel,
  type RoomWishOption,
} from '../../state/types';
import {
  NORMS,
  airClassFor,
  deriveSimulation,
  impactClassFor,
} from '../../state/simulation';
import {
  buildCalculatorUrl,
  buildClientSummary,
  buildLeadHandoff,
} from '../../state/session';
import styles from './ResultScreen.module.css';

/** Comfort ladder, worst → best (so «выше» reads left → right). */
const LADDER: ClassLabel[] = ['below', 'V', 'B', 'A'];

const LADDER_SHORT: Record<ClassLabel, string> = {
  below: 'Ниже В',
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

/** Zoom quietness so «после» sits near the right edge; прирост читается сразу. */
function quietBarScale(before: number, after: number): { beforePct: number; afterPct: number } {
  const lo = Math.max(0, Math.min(before, after) - Math.max(6, (after - before) * 0.2));
  const targetAfter = 90;
  const span = Math.max(1, (Math.max(after, before + 1) - lo) / (targetAfter / 100));
  const map = (v: number) => Math.round(((v - lo) / span) * 1000) / 10;
  const beforePct = Math.min(92, Math.max(8, map(before)));
  const afterPct = Math.min(96, Math.max(beforePct + 10, map(after)));
  return { beforePct, afterPct };
}

function everyday(cls: ClassLabel): string {
  return EVERYDAY_COMFORT_LABELS[cls];
}

function currentHeadline(air: ClassLabel, impact: ClassLabel): string {
  if (air === 'below' && impact === 'below') {
    return 'Сейчас комфорт в этом помещении ниже допустимого — и по голосам, и по шагам.';
  }
  if (air === 'below') {
    return `Сейчас по голосам уровень «${everyday(air)}» — ниже допустимого по шкале комфортности.`;
  }
  if (impact === 'below') {
    return `Сейчас по шагам уровень «${everyday(impact)}» — ниже допустимого. Голоса ближе к «${everyday(air)}».`;
  }
  return `Сейчас в помещении ориентир «${everyday(air)}» по голосам и «${everyday(impact)}» по шагам.`;
}

function wishLead(wish: RoomWishOption): string | null {
  switch (wish) {
    case 'music':
      return 'Вы отметили музыку — ниже смотрите, как изменятся голоса и бас сверху.';
    case 'tv':
      return 'Вы отметили телевизор — ниже смотрите воздушный шум: речь и звук сверху.';
    case 'child_sleep':
      return 'Вы отметили сон ребёнка — важны и шаги, и голоса.';
    default:
      return null;
  }
}

const SCALE_STEP: Record<ClassLabel, { letter: string; label: string }> = {
  below: { letter: '', label: 'Ниже В' },
  V: { letter: 'В', label: 'Допустимый' },
  B: { letter: 'Б', label: 'Комфорт' },
  A: { letter: 'А', label: 'Высокий' },
};

function scaleStepLabel(cls: ClassLabel): string {
  const step = SCALE_STEP[cls];
  return step.letter ? `${step.letter} · ${step.label}` : step.label;
}

function ScaleRow({
  title,
  example,
  before,
  after,
  beforeValue,
  afterValue,
  metric,
  lowerIsBetter = false,
}: {
  title: string;
  example: string;
  before: ClassLabel;
  after: ClassLabel;
  beforeValue: number;
  afterValue: number;
  metric: string;
  lowerIsBetter?: boolean;
}) {
  const same = before === after;

  return (
    <tr
      className={styles.resultScaleRow}
      role="row"
      aria-label={`${title}: сейчас ${scaleStepLabel(before)}, с MultiFrame ${scaleStepLabel(after)}`}
    >
      <th scope="row" role="rowheader">
        <strong>{title}</strong>
        <span>{example}</span>
        <small>
          {metric}: {beforeValue} → {afterValue} дБ
          <i>{lowerIsBetter ? 'меньше — лучше' : 'больше — лучше'}</i>
        </small>
      </th>
      {LADDER.map((cls) => {
        const isBefore = cls === before;
        const isAfter = cls === after;
        const both = same && isBefore;
        return (
          <td key={cls} data-level={cls} role="cell">
            {both ? (
              <span className={styles.scaleStateBoth}>
                <b>Сейчас + MF</b>
                <small>класс тот же</small>
              </span>
            ) : (
              <>
                {isBefore ? <span className={styles.scaleStateNow}>Сейчас</span> : null}
                {isAfter ? <span className={styles.scaleStateAfter}>MultiFrame</span> : null}
              </>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function ComfortScale({
  airBefore,
  airAfter,
  impactBefore,
  impactAfter,
  airBeforeValue,
  airAfterValue,
  impactBeforeValue,
  impactAfterValue,
}: {
  airBefore: ClassLabel;
  airAfter: ClassLabel;
  impactBefore: ClassLabel;
  impactAfter: ClassLabel;
  airBeforeValue: number;
  airAfterValue: number;
  impactBeforeValue: number;
  impactAfterValue: number;
}) {
  return (
    <section className={styles.comfortScale} aria-label="Официальная шкала комфортности">
      <header className={styles.scaleIntro}>
        <h2>Шкала комфортности</h2>
        <p>
          Основана на СП 51.13330.2011: <b>А</b> — высокий комфорт, <b>Б</b> — комфорт,
          <b> В</b> — допустимый уровень. «Ниже В» означает, что минимальный уровень ещё не
          достигнут.
        </p>
      </header>

      <div className={styles.scaleDirection} aria-hidden>
        Комфорт растёт <span>→</span>
      </div>

      <div className={styles.resultScaleWrap}>
        <table
          className={styles.resultScale}
          role="table"
          aria-label="Результат по шкале комфортности"
        >
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader">Что слышно</th>
              {LADDER.map((cls) => (
                <th key={cls} scope="col" role="columnheader">
                  <b>{SCALE_STEP[cls].letter || 'Ниже В'}</b>
                  <span>{cls === 'below' ? 'ниже нормы' : SCALE_STEP[cls].label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            <ScaleRow
              title="Голоса и музыка"
              example="речь, телевизор, лай"
              before={airBefore}
              after={airAfter}
              beforeValue={airBeforeValue}
              afterValue={airAfterValue}
              metric="Rw"
            />
            <ScaleRow
              title="Шаги и удары"
              example="топот, бег, падения"
              before={impactBefore}
              after={impactAfter}
              beforeValue={impactBeforeValue}
              afterValue={impactAfterValue}
              metric="Lnw"
              lowerIsBetter
            />
          </tbody>
        </table>
      </div>

      {impactAfter === 'below' ? (
        <p className={styles.scaleLimit}>
          <b>Почему шаги всё ещё ниже В:</b> потолок смягчает ударный шум, но минимальную норму
          обычно обеспечивает ещё и звукоизолированный пол у соседа сверху.
        </p>
      ) : null}
    </section>
  );
}

export function ResultScreen() {
  const { session, restart } = useSession();
  const room = session.answers.room;
  const sim = session.derived?.simulation ?? deriveSimulation(session.answers);
  const whyLines = session.derived?.whyMultiFrame ?? [];

  const airBeforeClass = airClassFor(sim.before.Rw);
  const airAfterClass = airClassFor(sim.after.Rw);
  const impactBeforeClass = impactClassFor(sim.before.Lnw);
  const impactAfterClass = impactClassFor(sim.after.Lnw);
  const airRose = rung(airAfterClass) > rung(airBeforeClass);
  const impactRose = rung(impactAfterClass) > rung(impactBeforeClass);

  const airBefore = sim.quietAirBefore;
  const airAfter = sim.quietAirAfter;
  const impactBefore = sim.quietImpactBefore;
  const impactAfter = sim.quietImpactAfter;
  const airBar = quietBarScale(airBefore, airAfter);
  const impactBar = quietBarScale(impactBefore, impactAfter);

  const airDb = Math.abs(sim.delta.Rw);
  const impactDb = Math.abs(sim.delta.Lnw);
  const roomLabel = room.roomType ? ROOM_TYPE_LABELS[room.roomType] : null;
  const airSpectrum = sim.airSpectrum;
  const impactSpectrum = sim.impactSpectrum;
  const calcUrl = buildCalculatorUrl(session.cta);
  const roomReason =
    whyLines.find((line) => !line.toLocaleLowerCase('ru').includes('каркас')) ??
    whyLines[0] ??
    'Система работает с шумом, который приходит сверху через перекрытие.';
  const wishNote = wishLead(room.roomWish);

  const [showLead, setShowLead] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);

  function openCalc() {
    window.open(calcUrl, '_blank', 'noopener,noreferrer');
  }

  function onLead(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const handoff = buildLeadHandoff(session, { name: name.trim(), phone: phone.trim() });
    console.info('[lead-demo]', handoff);
    setSent(true);
  }

  async function onCopySummary() {
    const text = buildClientSummary(session);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.info('[summary-copy-fallback]', text);
    }
  }

  const mfTitle = (() => {
    if (airRose && impactRose) {
      return 'С MultiFrame заметно тише и голоса, и шаги сверху.';
    }
    if (airRose) {
      return 'С MultiFrame заметно тише голоса и музыка сверху.';
    }
    if (impactRose) {
      return 'С MultiFrame заметно мягче шаги и удары сверху.';
    }
    return 'С MultiFrame шум сверху воспринимается мягче.';
  })();

  const mfLead =
    impactAfterClass === 'below'
      ? `По голосам ориентир поднимается до «${everyday(airAfterClass)}». Шаги станут мягче примерно на ${sim.perceivedImpactPct}%, но полную норму по удару потолок один закрывает редко.`
      : `По голосам — «${everyday(airAfterClass)}», по шагам — «${everyday(impactAfterClass)}».`;

  return (
    <Screen
      dense
      title="Акустический профиль помещения"
      subtitle="Ориентир комфорта для вашего объекта и следующий шаг к расчёту"
    >
      <section className={styles.verdict} aria-label="Текущая ситуация без MultiFrame">
        <span className={styles.resultEyebrow}>Текущая ситуация</span>
        <h2 className={styles.oneLiner}>{currentHeadline(airBeforeClass, impactBeforeClass)}</h2>
        <p className={styles.verdictLead}>
          Без MultiFrame. Простыми словами: как сейчас слышны голоса и шаги сверху. Ориентир по
          СП 51.13330.2011, не лабораторный замер.
        </p>
        {wishNote ? <p className={styles.verdictLead}>{wishNote}</p> : null}

        <div className={styles.nowGrid}>
          <article className={styles.nowCard} data-level={airBeforeClass}>
            <span>Голоса и музыка</span>
            <strong>{everyday(airBeforeClass)}</strong>
            <p>Речь, телевизор, лай. Сейчас: {HYBRID_CLASS_LABELS[airBeforeClass]}.</p>
          </article>
          <article className={styles.nowCard} data-level={impactBeforeClass}>
            <span>Шаги и удары</span>
            <strong>{everyday(impactBeforeClass)}</strong>
            <p>Шаги, мебель, падения. Сейчас: {HYBRID_CLASS_LABELS[impactBeforeClass]}.</p>
          </article>
        </div>

        <p className={styles.roomMeta}>
          {[roomLabel, room.ceilingAreaM2 ? `${room.ceilingAreaM2} м²` : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </section>

      <section className={styles.effect} aria-label="Эффект MultiFrame">
        <header className={styles.sectionHead}>
          <span className={styles.resultEyebrow}>С MultiFrame</span>
          <h2>{mfTitle}</h2>
          <p>{mfLead}</p>
        </header>

        <div className={styles.effectGrid}>
          <article className={styles.effectCard}>
            <header>
              <div>
                <strong>Голоса и музыка</strong>
                <span>
                  сейчас «{everyday(airBeforeClass)}» → «{everyday(airAfterClass)}»
                </span>
              </div>
              <b>≈ {sim.perceivedAirPct}% тише</b>
            </header>
            <div
              className={styles.qBar}
              role="img"
              aria-label={`Голоса и музыка: примерно на ${sim.perceivedAirPct}% тише`}
            >
              <span className={styles.qFillAfter} style={{ width: `${airBar.afterPct}%` }} />
              <span className={styles.qFillBefore} style={{ width: `${airBar.beforePct}%` }} />
              <span className={styles.qMark} style={{ left: `${airBar.beforePct}%` }} />
              <span
                className={`${styles.qMark} ${styles.qMarkMf}`}
                style={{ left: `${airBar.afterPct}%` }}
              />
            </div>
            <p>
              <b>+{airDb} дБ к изоляции.</b> Разговоры и телевизор сверху будут различаться
              заметно меньше.
            </p>
          </article>

          <article className={styles.effectCard}>
            <header>
              <div>
                <strong>Шаги и удары</strong>
                <span>
                  сейчас «{everyday(impactBeforeClass)}» → «{everyday(impactAfterClass)}»
                </span>
              </div>
              <b>≈ {sim.perceivedImpactPct}% тише</b>
            </header>
            <div
              className={styles.qBar}
              role="img"
              aria-label={`Шаги и удары: примерно на ${sim.perceivedImpactPct}% тише`}
            >
              <span className={styles.qFillAfter} style={{ width: `${impactBar.afterPct}%` }} />
              <span className={styles.qFillBefore} style={{ width: `${impactBar.beforePct}%` }} />
              <span className={styles.qMark} style={{ left: `${impactBar.beforePct}%` }} />
              <span
                className={`${styles.qMark} ${styles.qMarkMf}`}
                style={{ left: `${impactBar.afterPct}%` }}
              />
            </div>
            <p>
              <b>−{impactDb} дБ уровня удара.</b> Шаги станут мягче; полную норму по удару потолок
              один закрывает редко.
            </p>
          </article>
        </div>

        <CompactAudio pairs={session.audio.pairs} sim={sim} />

        <p className={styles.effectNote}>
          {LOG_DB_FOOTNOTE} Значения — {SIMULATION_BADGE.toLowerCase()}.
        </p>
      </section>

      <section className={styles.reasons} aria-label="Почему MultiFrame подходит">
        <header className={styles.sectionHead}>
          <h2>Почему MultiFrame подходит</h2>
          <p>Три причины для этого помещения — без повторения расчёта.</p>
        </header>

        <div className={styles.reasonList}>
          <article>
            <span>01</span>
            <div>
              <strong>Под ваш потолок</strong>
              <p>{roomReason}</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <strong>Без эффекта барабана</strong>
              <p>
                Обычная плёнка сама по себе не решает проблему; MultiFrame рассеивает энергию
                шума в панели.
              </p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <strong>Без тяжёлой стройки</strong>
              <p>
                Монтаж в темпе натяжного потолка, без долгой стройки и лишней потери высоты.
              </p>
            </div>
          </article>
        </div>

        <p className={styles.reasonConclusion}>
          Для этого помещения MultiFrame объединяет акустический эффект и привычный формат
          натяжного потолка.
        </p>
      </section>

      <section className={styles.technical} aria-label="Расчёт и нормы">
        <header className={styles.technicalHead}>
          <span>Подробности</span>
          <h2>Расчёт и нормы</h2>
          <p>
            Сравнение сейчас и с MultiFrame по официальной шкале, затем изоляция по частотам
            на вашем перекрытии.
          </p>
        </header>

        <ComfortScale
          airBefore={airBeforeClass}
          airAfter={airAfterClass}
          impactBefore={impactBeforeClass}
          impactAfter={impactAfterClass}
          airBeforeValue={sim.before.Rw}
          airAfterValue={sim.after.Rw}
          impactBeforeValue={sim.before.Lnw}
          impactAfterValue={sim.after.Lnw}
        />

        <section className={styles.normTable} aria-label="Классы комфорта в дБ">
          <h3>Пороги шкалы в децибелах</h3>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Уровень</th>
                  <th>
                    Голоса, Rw
                    <span>больше — лучше</span>
                  </th>
                  <th>
                    Шаги, Lnw
                    <span>меньше — лучше</span>
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
                        <span className={styles.rowName}>
                          {everyday(r.cls)} · {LADDER_SHORT[r.cls]}
                        </span>
                      </td>
                      <td>
                        {r.rw} <em>дБ</em>
                        {airNow && !airMf ? (
                          <span className={styles.rowTagNow}>сейчас</span>
                        ) : null}
                        {airMf && !airNow ? (
                          <span className={styles.rowTagMf}>MultiFrame</span>
                        ) : null}
                        {airNow && airMf ? (
                          <span className={styles.rowTagMf}>сейчас · MF</span>
                        ) : null}
                      </td>
                      <td>
                        {r.lnw} <em>дБ</em>
                        {impNow && !impMf ? (
                          <span className={styles.rowTagNow}>сейчас</span>
                        ) : null}
                        {impMf && !impNow ? (
                          <span className={styles.rowTagMf}>MultiFrame</span>
                        ) : null}
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
            А, Б и В — уровни по СП 51.13330.2011. «Некомфортно» — ниже минимального порога В.
          </p>
        </section>

        <div className={styles.charts}>
          <header>
            <h3>Изоляция по частотам</h3>
            <p>
              Чем выше линия, тем лучше конструкция сдерживает соответствующие частоты шума.
              Это опора вывода MultiFrame, не первый экран.
            </p>
          </header>
          <SpectrumChart
            title="Голоса и музыка"
            subtitle="R(f), дБ · воздушный шум сверху"
            series={airSpectrum}
            yLabel="дБ"
          />
          <SpectrumChart
            title="Шаги и удары"
            subtitle="Изоляция по полосам Гц · ударный шум"
            series={impactSpectrum}
            yLabel="дБ"
          />
        </div>

        <p className={styles.technicalNote}>
          Rw показывает изоляцию от голосов и музыки: больше — лучше. Lnw показывает уровень
          ударного шума: меньше — лучше.
        </p>
      </section>

      <section className={styles.nextStep} aria-label="Следующий шаг">
        <header>
          <h2>Следующий шаг</h2>
          <p>Вы уже видите профиль помещения — в калькуляторе останется уточнить комплектацию.</p>
        </header>

        <div className={styles.nextActions}>
          <Button fullWidth onClick={openCalc}>
            Открыть калькулятор MultiFrame
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setShowLead((v) => !v)}>
            Запросить консультацию или подбор
          </Button>
          <Button variant="ghost" fullWidth onClick={() => void onCopySummary()}>
            {copied ? 'Сводка скопирована' : 'Скопировать сводку'}
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
            {sent ? (
              <div className={styles.leadSuccess}>
                <button type="button" className={styles.inlineLink} onClick={openCalc}>
                  Открыть калькулятор MultiFrame
                </button>
              </div>
            ) : null}
          </form>
        ) : null}
      </section>

      <Button variant="ghost" onClick={restart}>
        Пройти ещё раз
      </Button>
    </Screen>
  );
}
