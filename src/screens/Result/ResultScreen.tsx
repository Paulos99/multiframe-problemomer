import { useState, type FormEvent } from 'react';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { Disclaimer } from '../../ui/Disclaimer';
import { Field, TextInput } from '../../ui/Field';
import { useSession } from '../../state/SessionContext';
import {
  CALCULATOR_URL,
  COMFORT_LABELS,
  NOISE_TYPE_LABELS,
  ROOM_TYPE_LABELS,
  SCENARIO_LABELS,
} from '../../state/types';
import { toSessionJson } from '../../state/session';
import styles from './ResultScreen.module.css';

export function ResultScreen() {
  const { session, restart } = useSession();
  const derived = session.derived;
  const room = session.answers.room;
  const [showLead, setShowLead] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const area = room.ceilingAreaM2;
  const calcUrl = new URL(CALCULATOR_URL);
  if (area && area > 0) calcUrl.searchParams.set('area', String(area));

  const consultUrl = `mailto:info@example.stp?subject=${encodeURIComponent(
    'Консультация MultiFrame Проблемомер',
  )}&body=${encodeURIComponent(
    `Здравствуйте!\n\nХочу консультацию по MultiFrame.\nКомната: ${
      room.roomType ? ROOM_TYPE_LABELS[room.roomType] : '—'
    }\nПлощадь: ${area ?? '—'} м²\nСценарии: ${session.answers.scenarios
      .map((s) => SCENARIO_LABELS[s].title)
      .join(', ')}\n\nPayload JSON:\n${toSessionJson(session)}`,
  )}`;

  function onLead(e: FormEvent) {
    e.preventDefault();
    // Stub lead form — payload ready for CRM wiring
    console.info('[lead-stub]', {
      name,
      phone,
      cta: session.cta,
      derived: session.derived,
    });
    setSent(true);
  }

  return (
    <Screen
      title="Акустический профиль"
      subtitle="Качественная экспертная картина — основа для следующего шага к MultiFRAME."
    >
      <div className={styles.profile}>
        <div className={styles.row}>
          <span>Комфорт</span>
          <strong>
            {derived ? COMFORT_LABELS[derived.comfortLevel] : '—'}
          </strong>
        </div>
        <div className={styles.row}>
          <span>Тип шума</span>
          <strong>{derived ? NOISE_TYPE_LABELS[derived.noiseType] : '—'}</strong>
        </div>
        <div className={styles.row}>
          <span>Комната</span>
          <strong>
            {room.roomType ? ROOM_TYPE_LABELS[room.roomType] : '—'}
            {area ? ` · ${area} м²` : ''}
          </strong>
        </div>
        <div className={styles.scenarios}>
          {session.answers.scenarios.map((s) => (
            <span key={s}>{SCENARIO_LABELS[s].title}</span>
          ))}
        </div>
      </div>

      {derived?.whyMultiFrame?.length ? (
        <div className={styles.why}>
          <h2>Почему MultiFrame уместен</h2>
          <ul>
            {derived.whyMultiFrame.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Disclaimer />

      <div className={styles.actions}>
        <a className={styles.linkBtn} href={calcUrl.toString()} target="_blank" rel="noreferrer">
          Расчёт материалов
        </a>
        <a className={styles.linkSecondary} href={consultUrl}>
          Консультация
        </a>
        <Button variant="secondary" fullWidth onClick={() => setShowLead((v) => !v)}>
          Оставить заявку
        </Button>
      </div>

      {showLead ? (
        <form className={styles.form} onSubmit={onLead}>
          <h3>Заявка (заглушка)</h3>
          <p>Данные не отправляются на сервер — только console и локальный stub.</p>
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
            {sent ? 'Заявка принята (stub)' : 'Отправить'}
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
