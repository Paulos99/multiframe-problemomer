import { useState, type FormEvent } from 'react';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { Disclaimer } from '../../ui/Disclaimer';
import { Field, TextInput } from '../../ui/Field';
import { CompactAudio } from '../../ui/CompactAudio';
import { SpectrumChart } from '../../ui/SpectrumChart';
import { useSession } from '../../state/SessionContext';
import {
  HYBRID_CLASS_LABELS,
  NORM_FOOTNOTE,
  ROOM_TYPE_LABELS,
  SIMULATION_BADGE,
  type ClassLabel,
  type DerivedSimSide,
} from '../../state/types';
import { NORMS, classCyr, deriveSimulation } from '../../state/simulation';
import { buildAirSpectrum, buildImpactSpectrum } from '../../state/spectrum';
import styles from './ResultScreen.module.css';

const SCALE: ClassLabel[] = ['A', 'B', 'V', 'below'];

/** Worst-channel class for client-facing official scale (both Rw and Lnw must pass). */
function strictClass(side: DerivedSimSide): ClassLabel {
  if (side.Rw >= NORMS.A.Rw && side.Lnw <= NORMS.A.Lnw) return 'A';
  if (side.Rw >= NORMS.B.Rw && side.Lnw <= NORMS.B.Lnw) return 'B';
  if (side.Rw >= NORMS.V.Rw && side.Lnw <= NORMS.V.Lnw) return 'V';
  return 'below';
}

function scaleIndex(label: ClassLabel): number {
  return SCALE.indexOf(label);
}

export function ResultScreen() {
  const { session, restart } = useSession();
  const room = session.answers.room;
  const sim = session.derived?.simulation ?? deriveSimulation(session.answers);
  const beforeStrict = strictClass(sim.before);
  const afterStrict = strictClass(sim.after);
  const classRose = scaleIndex(afterStrict) < scaleIndex(beforeStrict);
  const beforeClass = HYBRID_CLASS_LABELS[beforeStrict];
  const afterClass = classRose
    ? HYBRID_CLASS_LABELS[afterStrict]
    : afterStrict === 'below' &&
        (sim.after.Rw > sim.before.Rw || sim.after.Lnw < sim.before.Lnw)
      ? 'Ближе к нормативному классу'
      : HYBRID_CLASS_LABELS[afterStrict];
  const scaleAfterMark: ClassLabel =
    afterStrict !== 'below' ? afterStrict : 'V';
  const [showLead, setShowLead] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const airDelta = Math.abs(sim.delta.Rw);
  const impactDelta = Math.abs(sim.delta.Lnw);
  const airSpectrum = buildAirSpectrum(sim.delta.Rw);
  const impactSpectrum = buildImpactSpectrum(sim.delta.Lnw);
  const roomLabel = room.roomType ? ROOM_TYPE_LABELS[room.roomType] : null;

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
          {classRose
            ? 'Уровень комфорта помещения заметно возрастает по официальной классификации.'
            : 'По официальным индексам Rw и Lnw комфорт помещения заметно усиливается — комната ближе к нормативным классам.'}
        </p>
        <p className={styles.classShift}>
          Сейчас: {beforeClass}
          <span aria-hidden> → </span>
          с MultiFrame: {afterClass}
        </p>

        <div className={styles.scale} aria-label="Шкала комфортности А Б В">
          {SCALE.map((cls) => {
            const isBefore = cls === beforeStrict;
            const isAfter = cls === (classRose ? afterStrict : scaleAfterMark);
            const name = cls === 'below' ? 'ниже' : classCyr(cls);
            return (
              <div
                key={cls}
                className={`${styles.scaleStep} ${isBefore ? styles.scaleBefore : ''} ${isAfter ? styles.scaleAfter : ''}`}
              >
                <span className={styles.scaleDot} />
                <span>{name}</span>
              </div>
            );
          })}
        </div>

        <p className={styles.normLine}>
          Нормы ориентира: Rw ≥ {NORMS.V.Rw}…{NORMS.A.Rw} · Lnw ≤ {NORMS.V.Lnw}…
          {NORMS.A.Lnw}
        </p>
        <p className={styles.indices}>
          Rw {sim.before.Rw} → {sim.after.Rw} дБ · Lnw {sim.before.Lnw} →{' '}
          {sim.after.Lnw} дБ
        </p>
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
          </ul>
        </article>
        <article className={`${styles.emotionCard} ${styles.after}`}>
          <span className={styles.tag}>С MultiFrame</span>
          <ul>
            <li>В комнате заметно спокойнее</li>
            <li>Ударный и воздушный шум воспринимаются мягче</li>
          </ul>
        </article>
      </div>

      <section className={styles.deltas} aria-label="Снижение шума">
        <header>
          <h2>Снижение шума в помещении</h2>
          <p>{SIMULATION_BADGE}</p>
        </header>
        <div className={styles.deltaGrid}>
          <div className={styles.deltaCard}>
            <span className={styles.deltaKind}>Воздушный шум · Rw</span>
            <p className={styles.deltaValue}>
              <span>+</span>
              {airDelta}
              <small>дБ</small>
            </p>
            <p className={styles.deltaHint}>
              Общий индекс изоляции растёт — речь, музыка, лай сверху тише.
            </p>
            <p className={styles.deltaRange}>
              ориентир +{sim.deltaRange.Rw[0]}…+{sim.deltaRange.Rw[1]} дБ
            </p>
          </div>
          <div className={styles.deltaCard}>
            <span className={styles.deltaKind}>Ударный шум · Lnw</span>
            <p className={styles.deltaValue}>
              <span>−</span>
              {impactDelta}
              <small>дБ</small>
            </p>
            <p className={styles.deltaHint}>
              Уровень ударного шума падает — бег, мебель, когти мягче.
            </p>
            <p className={styles.deltaRange}>
              ориентир −{sim.deltaRange.Lnw[0]}…−{sim.deltaRange.Lnw[1]} дБ
            </p>
          </div>
        </div>
      </section>

      <section className={styles.charts} aria-label="Графики по частотам">
        <header>
          <h2>По частотам</h2>
          <p>
            Форма кривых — по частотным измерениям MultiFrame; сдвиг подогнан к
            ориентиру вашей комнаты.
          </p>
        </header>
        <SpectrumChart
          title="Изоляция воздушного шума"
          subtitle="R(f), дБ · выше = тише сверху"
          series={airSpectrum}
          yLabel="дБ"
        />
        <SpectrumChart
          title="Изоляция ударного шума"
          subtitle="По полосам Гц · выше = лучше гасится удар"
          series={impactSpectrum}
          yLabel="дБ"
        />
      </section>

      <CompactAudio pairs={session.audio.pairs} sim={sim} />

      <div className={styles.features}>
        <h2>Почему это удобно клиенту</h2>
        <ul>
          <li>
            <strong>
              Обычный натяжной усиливает шум сверху, как полотно барабана.
            </strong>
            <span>
              MultiFrame рассеивает энергию в панели — комната воспринимается
              спокойнее без тяжёлого каркаса.
            </span>
          </li>
          <li>
            <strong>Монтаж в темпе обычного натяжного потолка.</strong>
            <span>
              Быстро собирается на объекте: без долгой стройки и лишней потери
              высоты.
            </span>
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
