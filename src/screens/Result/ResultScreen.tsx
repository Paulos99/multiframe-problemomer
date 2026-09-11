import { useState, type FormEvent } from 'react';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { Disclaimer } from '../../ui/Disclaimer';
import { Field, TextInput } from '../../ui/Field';
import { SimCompare } from '../../ui/SimCompare';
import { useSession } from '../../state/SessionContext';
import {
  COMFORT_LABELS,
  NOISE_TYPE_LABELS,
  ROOM_TYPE_LABELS,
  SCENARIO_LABELS,
} from '../../state/types';
import { buildCalculatorUrl, toSessionJson } from '../../state/session';
import { deriveSimulation } from '../../state/simulation';
import styles from './ResultScreen.module.css';

export function ResultScreen() {
  const { session, restart } = useSession();
  const derived = session.derived;
  const room = session.answers.room;
  const sim = derived?.simulation ?? deriveSimulation(session.answers);
  const comfort =
    derived?.comfortLevel ?? session.answers.current?.comfortLevel ?? 'ok';
  const [showLead, setShowLead] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const calcUrl = buildCalculatorUrl(session.cta);

  function onLead(e: FormEvent) {
    e.preventDefault();
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
      subtitle="Сначала ощущение эффекта — цифры вторичны. Затем расчёт MultiFRAME."
    >
      <div className={styles.dual}>
        <article className={`${styles.emotionCard} ${styles.before}`}>
          <span className={styles.tag}>Сейчас</span>
          <h2>Без MultiFrame</h2>
          <p className={styles.emotion}>Шум сверху остаётся «рядом»</p>
          <ul>
            <li>
              Ощущение: {derived ? COMFORT_LABELS[derived.comfortLevel] : COMFORT_LABELS[comfort]}
            </li>
            <li>Тип: {derived ? NOISE_TYPE_LABELS[derived.noiseType] : '—'}</li>
          </ul>
        </article>

        <article className={`${styles.emotionCard} ${styles.after}`}>
          <span className={styles.tag}>С MultiFrame</span>
          <h2>Эффект в ощущении</h2>
          <p className={styles.emotion}>Тише. Спокойнее. Свой потолок.</p>
          <ul>
            <li>Воздух: примерно вдвое спокойнее — шум как будто дальше</li>
            <li>Удар: тише; норму часто закрывает пол у соседа</li>
          </ul>
        </article>
      </div>

      <div className={styles.profile}>
        <div className={styles.row}>
          <span>Комната</span>
          <strong>
            {room.roomType ? ROOM_TYPE_LABELS[room.roomType] : '—'}
            {room.ceilingAreaM2 ? ` · ${room.ceilingAreaM2} м²` : ''}
          </strong>
        </div>
        <div className={styles.scenarios}>
          {session.answers.scenarios.map((s) => (
            <span key={s}>{SCENARIO_LABELS[s].title}</span>
          ))}
        </div>
      </div>

      <div className={styles.simSecondary}>
        <p className={styles.simLead}>Ориентиры в цифрах — вторичны к ощущению</p>
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

      <Disclaimer />

      <div className={styles.actions}>
        <a className={styles.linkSecondary} href={calcUrl} target="_blank" rel="noreferrer">
          Открыть калькулятор
        </a>
        <div className={styles.demoBlock}>
          <span className={styles.demoBadge}>демо</span>
          <p>
            Реальных контактов StP в этом MVP нет. «Консультация» и заявка — только
            демонстрационные заглушки.
          </p>
          <button type="button" className={styles.demoDisabled} disabled>
            Консультация (недоступно в демо)
          </button>
          <Button variant="secondary" fullWidth onClick={() => setShowLead((v) => !v)}>
            Оставить заявку (демо)
          </Button>
        </div>
      </div>

      {showLead ? (
        <form className={styles.form} onSubmit={onLead}>
          <h3>Заявка · демо</h3>
          <p>Никуда не отправляется — только console stub. Не inventированный корпоративный email.</p>
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
            {sent ? 'Принято (демо-stub)' : 'Отправить (демо)'}
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
