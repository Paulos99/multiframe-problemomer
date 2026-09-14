import { useState, type FormEvent } from 'react';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { Disclaimer } from '../../ui/Disclaimer';
import { Field, TextInput } from '../../ui/Field';
import { CompactAudio } from '../../ui/CompactAudio';
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
  airQuietPct,
  comfortClassFor,
  deriveSimulation,
  impactQuietPct,
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

function rung(cls: ClassLabel): number {
  return LADDER.indexOf(cls);
}

export function ResultScreen() {
  const { session, restart } = useSession();
  const room = session.answers.room;
  const sim = session.derived?.simulation ?? deriveSimulation(session.answers);

  const beforeClass = comfortClassFor(sim.before.Rw, sim.before.Lnw);
  const afterClass = comfortClassFor(sim.after.Rw, sim.after.Lnw);
  const rose = rung(afterClass) > rung(beforeClass);

  const airBefore = airQuietPct(sim.before.Rw);
  const airAfter = airQuietPct(sim.after.Rw);
  const impactBefore = impactQuietPct(sim.before.Lnw);
  const impactAfter = impactQuietPct(sim.after.Lnw);

  const airDb = Math.abs(sim.delta.Rw);
  const impactDb = Math.abs(sim.delta.Lnw);
  const roomLabel = room.roomType ? ROOM_TYPE_LABELS[room.roomType] : null;

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
      title="Акустический профиль"
      subtitle="Ориентир комфорта для вашей комнаты и следующий шаг к расчёту"
    >
      <div className={styles.verdict} role="status">
        <p className={styles.oneLiner}>
          {rose
            ? 'В этой комнате MultiFrame поднимает комфорт на ступень выше.'
            : 'В этой комнате MultiFrame заметно повышает акустический комфорт.'}
        </p>
        <p className={styles.classShift}>
          Сейчас: <b>{HYBRID_CLASS_LABELS[beforeClass]}</b>
          <span className={styles.arrow} aria-hidden>
            {' → '}
          </span>
          с MultiFrame: <b className={styles.accent}>{HYBRID_CLASS_LABELS[afterClass]}</b>
        </p>

        <div className={styles.ladder} aria-label="Шкала комфортности помещения">
          <div className={styles.ladderTrack} aria-hidden />
          {LADDER.map((cls) => {
            const isBefore = cls === beforeClass;
            const isAfter = cls === afterClass;
            const tag = isBefore ? 'Сейчас' : isAfter ? 'MultiFrame' : '';
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

        {roomLabel ? (
          <p className={styles.roomMeta}>
            {roomLabel}
            {room.ceilingAreaM2 ? ` · ${room.ceilingAreaM2} м²` : ''}
          </p>
        ) : null}
        <p className={styles.normNote}>{NORM_FOOTNOTE}</p>
      </div>

      <div className={styles.dual}>
        <article className={`${styles.emotionCard} ${styles.before}`}>
          <span className={styles.tag}>Сейчас</span>
          <ul>
            <li>Соседи сверху слышны слишком отчётливо</li>
            <li>Бытовые звуки сверху легко различить</li>
            <li className={styles.cardClass}>Сейчас: {HYBRID_CLASS_LABELS[beforeClass]}</li>
          </ul>
        </article>
        <article className={`${styles.emotionCard} ${styles.after}`}>
          <span className={styles.tag}>С MultiFrame</span>
          <ul>
            <li>В комнате заметно спокойнее</li>
            <li>Ударный и воздушный шум воспринимаются мягче</li>
            <li className={styles.cardClass}>С MultiFrame: {HYBRID_CLASS_LABELS[afterClass]}</li>
          </ul>
        </article>
      </div>

      <section className={styles.quieter} aria-label="Насколько станет тише">
        <header>
          <h2>Насколько станет тише</h2>
          <p>{SIMULATION_BADGE}</p>
        </header>

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
          <div className={styles.qMeta}>
            <span className={styles.qHero}>≈ на {sim.perceivedAirPct}% тише</span>
            <span className={styles.qDb}>
              изоляция {sim.before.Rw} → {sim.after.Rw} дБ · чем больше, тем тише
              <em className={styles.qGain}> +{airDb}</em>
            </span>
          </div>
        </div>

        <div className={styles.qRow}>
          <div className={styles.qHead}>
            <span className={styles.qName}>Ударный шум</span>
            <span className={styles.qEx}>шаги, беготня, падения сверху</span>
          </div>
          <div
            className={styles.qBar}
            role="img"
            aria-label={`Ударный шум: тише примерно на ${sim.perceivedImpactPct}%`}
          >
            <span className={styles.qFillAfter} style={{ width: `${impactAfter}%` }} />
            <span className={styles.qFillBefore} style={{ width: `${impactBefore}%` }} />
          </div>
          <div className={styles.qMeta}>
            <span className={styles.qHero}>≈ на {sim.perceivedImpactPct}% тише</span>
            <span className={styles.qDb}>
              ударный фон {sim.before.Lnw} → {sim.after.Lnw} дБ · чем меньше, тем тише
              <em className={styles.qGain}> −{impactDb}</em>
            </span>
          </div>
        </div>

        <p className={styles.legend}>
          <span className={styles.legendBefore} /> сейчас
          <span className={styles.legendAfter} /> с MultiFrame
        </p>
        <p className={styles.qNote}>{DISCLAIMER_SIMULATION}</p>
      </section>

      <CompactAudio pairs={session.audio.pairs} sim={sim} />

      <div className={styles.features}>
        <h2>Почему это работает на комфорт</h2>
        <ul>
          <li>
            <strong>Обычный натяжной усиливает шум сверху, как полотно барабана.</strong>
            <span>
              MultiFrame рассеивает энергию в самой панели — комната воспринимается
              спокойнее, без тяжёлого каркаса.
            </span>
          </li>
          <li>
            <strong>Работает и по воздуху, и по удару.</strong>
            <span>
              Речь и музыка сверху звучат дальше, шаги и падения — мягче; шкала дБ
              логарифмическая, поэтому разница слышна отчётливо.
            </span>
          </li>
          <li>
            <strong>Монтаж в темпе обычного натяжного потолка.</strong>
            <span>Быстро собирается на объекте: без долгой стройки и лишней потери высоты.</span>
          </li>
          <li>
            <strong>Решение, с которым спокойно жить в комнате.</strong>
            <span>Состав и сертификаты подтверждают уместность системы в жилом интерьере.</span>
          </li>
        </ul>
      </div>

      <Disclaimer />

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
