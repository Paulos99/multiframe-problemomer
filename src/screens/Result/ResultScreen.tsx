import { useState, type FormEvent } from 'react';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { Disclaimer } from '../../ui/Disclaimer';
import { Field, TextInput } from '../../ui/Field';
import { SimCompare } from '../../ui/SimCompare';
import { CompactAudio } from '../../ui/CompactAudio';
import { useSession } from '../../state/SessionContext';
import {
  HYBRID_CLASS_LABELS,
  NORM_FOOTNOTE,
  ROOM_TYPE_LABELS,
} from '../../state/types';
import { buildCalculatorUrl, toSessionJson } from '../../state/session';
import { deriveSimulation } from '../../state/simulation';
import styles from './ResultScreen.module.css';

export function ResultScreen() {
  const { session, restart } = useSession();
  const derived = session.derived;
  const room = session.answers.room;
  const sim = derived?.simulation ?? deriveSimulation(session.answers);
  const beforeClass = HYBRID_CLASS_LABELS[sim.before.classLabel];
  const afterClass = HYBRID_CLASS_LABELS[sim.after.classLabel];
  const [showLead, setShowLead] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const calcUrl = buildCalculatorUrl(session.cta);
  const airDelta = Math.abs(sim.delta.Rw);
  const impactDelta = Math.abs(sim.delta.Lnw);

  function onLead(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    console.info('[lead-demo]', {
      name,
      phone,
      cta: session.cta,
      derived: session.derived,
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
          В этой комнате MultiFrame поднимает комфорт на ступень выше.
        </p>
        <p className={styles.classShift}>
          Сейчас: {beforeClass} → с MultiFrame: {afterClass}
        </p>
        <p className={styles.normNote}>{NORM_FOOTNOTE}</p>
      </div>

      <div className={styles.dual}>
        <article className={`${styles.emotionCard} ${styles.before}`}>
          <span className={styles.tag}>Сейчас</span>
          <h2>Без MultiFrame</h2>
          <ul>
            <li>Соседи сверху слышны слишком отчётливо</li>
            <li>Бытовые звуки сверху легко различить</li>
            <li>Сейчас: {beforeClass}</li>
          </ul>
        </article>

        <article className={`${styles.emotionCard} ${styles.after}`}>
          <span className={styles.tag}>С MultiFrame</span>
          <h2>С MultiFrame</h2>
          <ul>
            <li>В комнате заметно спокойнее</li>
            <li>Ударный и воздушный шум воспринимаются мягче</li>
            <li>С MultiFrame: {afterClass}</li>
          </ul>
        </article>
      </div>

      <CompactAudio pairs={session.audio.pairs} sim={sim} />

      <div className={styles.profile}>
        <div className={styles.row}>
          <span>Комната</span>
          <strong>
            {room.roomType ? ROOM_TYPE_LABELS[room.roomType] : '—'}
            {room.ceilingAreaM2 ? ` · ${room.ceilingAreaM2} м²` : ''}
          </strong>
        </div>
      </div>

      <div className={styles.simSecondary}>
        <p className={styles.simLead}>Оценка в цифрах</p>
        <SimCompare sim={sim} tone="secondary" />
      </div>

      {derived?.whyMultiFrame?.length ? (
        <div className={styles.why}>
          <h2>Почему MultiFrame уместен</h2>
          <ul>
            {derived.whyMultiFrame.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.features}>
        <h2>Почему MultiFrame</h2>

        <article className={styles.feature}>
          <h3>
            Сейчас: {beforeClass} → с MultiFrame: {afterClass}
          </h3>
          <p>
            Так комната читается на шкале комфортности: это понятный ориентир для
            вашего случая и мягкая опора на нормативные представления о тишине, без
            претензии на лабораторный вердикт.
          </p>
        </article>

        <article className={styles.feature}>
          <h3>
            Ориентиры снижения шума: по воздуху около −{airDelta} дБ, по удару около −
            {impactDelta} дБ.
          </h3>
          <p>
            Обе оценки собраны под параметры этой комнаты. Поскольку шкала децибел
            логарифмическая, даже небольшое снижение на слух ощущается заметно
            спокойнее.
          </p>
        </article>

        <article className={styles.feature}>
          <h3>
            Под обычным натяжным потолком воздух в зазоре усиливает шум сверху, как
            полотно барабана.
          </h3>
          <p>
            MultiFrame рассеивает эту энергию в панели, и комната воспринимается
            спокойнее.
          </p>
        </article>

        <article className={styles.feature}>
          <h3>Решение, с которым спокойно жить в комнате.</h3>
          <p>
            Состав и сертификаты подтверждают, что система уместна в жилом интерьере и
            не воспринимается как «чисто строительный» материал.
          </p>
        </article>

        <article className={styles.feature}>
          <h3>Монтаж идёт в том же темпе, что и обычный натяжной потолок.</h3>
          <p>
            Панели собираются быстро, без тяжёлого каркаса и без ощущения затяжной
            стройки на объекте.
          </p>
        </article>

        <article className={styles.feature}>
          <h3>Панель нового поколения с продуманной архитектурой.</h3>
          <p>
            Жёсткий контур вместе с перфорацией рассеивает энергию шума в пространстве
            над полотном.
          </p>
        </article>
      </div>

      <Disclaimer />

      <div className={styles.actions}>
        <a className={styles.linkBtn} href={calcUrl} target="_blank" rel="noreferrer">
          Открыть калькулятор MultiFrame
        </a>
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
          <details className={styles.payload}>
            <summary>CTA payload (schemaVersion 1)</summary>
            <pre>{toSessionJson(session)}</pre>
          </details>
        </form>
      ) : null}

      <Button variant="ghost" onClick={restart}>
        Пройти ещё раз
      </Button>
    </Screen>
  );
}
