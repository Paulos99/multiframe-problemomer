import { Screen } from '../../ui/Screen';
import { CardSelect } from '../../ui/CardSelect';
import { Field, TextInput } from '../../ui/Field';
import { useSession } from '../../state/SessionContext';
import {
  FLOOR_ABOVE_OPTIONS,
  HOUSE_TYPE_OPTIONS,
  NOISY_NEIGHBORS_OPTIONS,
  OBJECT_STAGE_OPTIONS,
  PLANNED_CEILING_OPTIONS,
  ROOM_SUBSTEPS,
  ROOM_TYPE_LABELS,
  SLAB_THICKNESS_OPTIONS,
  SLAB_TYPE_OPTIONS,
  type RoomSubstep,
  type RoomType,
} from '../../state/types';
import { roomNextHint, roomSubstepIndex } from '../../state/session';
import { copyForInterest } from '../../state/interestCopy';
import styles from './RoomScreen.module.css';

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS) as RoomType[];

const SUBSTEP_COPY: Record<
  RoomSubstep,
  { title: string; subtitle: string }
> = {
  basics: {
    title: 'Тип комнаты и площадь',
    subtitle: 'Обязательные поля — для профиля и ссылки на калькулятор.',
  },
  slabType: {
    title: 'Тип перекрытия',
    subtitle: 'Если не уверены — выберите «Не знаю».',
  },
  slabThickness: {
    title: 'Толщина перекрытия',
    subtitle: 'Ориентир по разбросам; точность не обязательна.',
  },
  floorAbove: {
    title: 'Пол сверху',
    subtitle: 'Есть ли плавающая схема или шумоизоляция в полу у соседей.',
  },
  houseType: {
    title: 'Тип дома',
    subtitle: 'Помогает уточнить типичное перекрытие, если оно неизвестно.',
  },
  objectStage: {
    title: 'Стадия объекта',
    subtitle: 'На каком этапе сейчас квартира или объект.',
  },
  plannedCeiling: {
    title: 'Планируемый потолок',
    subtitle: 'Планируете натяжной или потолок уже есть.',
  },
  noisyNeighbors: {
    title: 'Шумные соседи сверху',
    subtitle: 'Как обычно шумят сверху — не оценка «мешает ли».',
  },
};

export function RoomScreen() {
  const {
    session,
    setRoomType,
    setCeilingArea,
    setSlabType,
    setSlabThickness,
    setFloorAbove,
    setHouseType,
    setObjectStage,
    setPlannedCeiling,
    setNoisyNeighbors,
    canGoNext,
  } = useSession();
  const room = session.answers.room;
  const sub = session.roomSubstep;
  const interestCopy = copyForInterest(session.answers.interestFor);
  const copy =
    sub === 'basics'
      ? { ...SUBSTEP_COPY.basics, subtitle: interestCopy.roomBasicsSubtitle }
      : SUBSTEP_COPY[sub];
  const hint = roomNextHint(session);
  const idx = roomSubstepIndex(sub);
  const total = ROOM_SUBSTEPS.length;
  const progressPct = Math.round(((idx + 1) / total) * 100);

  return (
    <Screen stickyHead title={copy.title} subtitle={copy.subtitle}>
      <div className={styles.progressWrap} aria-hidden>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>
      <p className={styles.stepMeta} aria-live="polite">
        Вопрос {idx + 1} из {total}
      </p>

      {sub === 'basics' ? (
        <>
          <div className={styles.grid}>
            {ROOM_TYPES.map((type) => (
              <CardSelect
                key={type}
                dense
                title={ROOM_TYPE_LABELS[type]}
                selected={room.roomType === type}
                onClick={() => setRoomType(type)}
              />
            ))}
          </div>

          <Field
            label="Площадь потолка, м²"
            hint="Нужна для ссылки на калькулятор MultiFRAME"
          >
            <TextInput
              type="number"
              inputMode="decimal"
              min={1}
              step={0.1}
              placeholder="Например, 18"
              value={room.ceilingAreaM2 ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setCeilingArea(v === '' ? null : Number(v));
              }}
            />
          </Field>

          {!canGoNext && hint ? (
            <p className={styles.validation} role="status">
              {hint}
            </p>
          ) : null}
        </>
      ) : null}

      {sub === 'slabType' ? (
        <div className={styles.grid}>
          {SLAB_TYPE_OPTIONS.map((opt) => (
            <CardSelect
              key={opt.id}
              dense
              title={opt.label}
              selected={room.slabType === opt.id}
              onClick={() => setSlabType(opt.id)}
            />
          ))}
        </div>
      ) : null}

      {sub === 'slabThickness' ? (
        <div className={styles.grid}>
          {SLAB_THICKNESS_OPTIONS.map((opt) => (
            <CardSelect
              key={opt.id}
              dense
              title={opt.label}
              selected={room.slabThickness === opt.id}
              onClick={() => setSlabThickness(opt.id)}
            />
          ))}
        </div>
      ) : null}

      {sub === 'floorAbove' ? (
        <div className={styles.grid}>
          {FLOOR_ABOVE_OPTIONS.map((opt) => (
            <CardSelect
              key={opt.id}
              dense
              title={opt.label}
              selected={room.floorAbove === opt.id}
              onClick={() => setFloorAbove(opt.id)}
            />
          ))}
        </div>
      ) : null}

      {sub === 'houseType' ? (
        <div className={styles.grid}>
          {HOUSE_TYPE_OPTIONS.map((opt) => (
            <CardSelect
              key={opt.id}
              dense
              title={opt.label}
              selected={room.houseType === opt.id}
              onClick={() => setHouseType(opt.id)}
            />
          ))}
        </div>
      ) : null}

      {sub === 'objectStage' ? (
        <div className={styles.grid}>
          {OBJECT_STAGE_OPTIONS.map((opt) => (
            <CardSelect
              key={opt.id}
              dense
              title={opt.label}
              selected={room.objectStage === opt.id}
              onClick={() => setObjectStage(opt.id)}
            />
          ))}
        </div>
      ) : null}

      {sub === 'plannedCeiling' ? (
        <div className={styles.grid}>
          {PLANNED_CEILING_OPTIONS.map((opt) => (
            <CardSelect
              key={opt.id}
              dense
              title={opt.label}
              selected={room.plannedCeiling === opt.id}
              onClick={() => setPlannedCeiling(opt.id)}
            />
          ))}
        </div>
      ) : null}

      {sub === 'noisyNeighbors' ? (
        <div className={styles.grid}>
          {NOISY_NEIGHBORS_OPTIONS.map((opt) => (
            <CardSelect
              key={opt.id}
              dense
              title={opt.label}
              selected={room.noisyNeighbors === opt.id}
              onClick={() => setNoisyNeighbors(opt.id)}
            />
          ))}
        </div>
      ) : null}
    </Screen>
  );
}
