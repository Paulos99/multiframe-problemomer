import { useState, type FormEvent } from 'react';
import { Screen } from '../../ui/Screen';
import { Button } from '../../ui/Button';
import { Disclaimer } from '../../ui/Disclaimer';
import { Field, TextInput } from '../../ui/Field';
import { CompactAudio } from '../../ui/CompactAudio';
import { useSession } from '../../state/SessionContext';
import {
  HYBRID_CLASS_LABELS,
  NORM_FOOTNOTE,
  ROOM_TYPE_LABELS,
} from '../../state/types';
import { deriveSimulation } from '../../state/simulation';
import styles from './ResultScreen.module.css';

export function ResultScreen() {
  const { session, restart } = useSession();
  const room = session.answers.room;
  const sim = session.derived?.simulation ?? deriveSimulation(session.answers);
  const beforeClass = HYBRID_CLASS_LABELS[sim.before.classLabel];
  const afterClass = HYBRID_CLASS_LABELS[sim.after.classLabel];
  const [showLead, setShowLead] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

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
          В этой комнате MultiFrame поднимает комфорт на ступень выше.
        </p>
        <p className={styles.classShift}>
          Сейчас: {beforeClass} → с MultiFrame: {afterClass}
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

      <CompactAudio pairs={session.audio.pairs} sim={sim} />

      <div className={styles.features}>
        <h2>Почему MultiFrame</h2>
        <ul>
          <li>
            <strong>Обычный натяжной усиливает шум сверху, как полотно барабана.</strong>
            <span>MultiFrame рассеивает энергию в панели — комната тише.</span>
          </li>
          <li>
            <strong>Спокойно жить в жилом интерьере.</strong>
            <span>Состав и сертификаты — не «чисто строительный» материал.</span>
          </li>
          <li>
            <strong>Монтаж в темпе обычного натяжного.</strong>
            <span>Быстро, без тяжёлого каркаса и долгой стройки.</span>
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
