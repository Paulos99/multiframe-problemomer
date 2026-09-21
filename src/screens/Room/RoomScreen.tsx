import { useState } from 'react';
import { Screen } from '../../ui/Screen';
import { CardSelect } from '../../ui/CardSelect';
import { Field, TextInput } from '../../ui/Field';
import { useSession } from '../../state/SessionContext';
import {
  HOUSE_TYPE_OPTIONS,
  NOISY_NEIGHBORS_OPTIONS,
  OBJECT_STAGE_OPTIONS,
  PLANNED_CEILING_OPTIONS,
  ROOM_FACTOR_GROUP,
  ROOM_FACTOR_GROUP_LABEL,
  ROOM_SUBSTEPS,
  ROOM_TYPE_LABELS,
  ROOM_WISH_OPTIONS,
  SLAB_THICKNESS_OPTIONS,
  SLAB_TYPE_OPTIONS,
  type RoomSubstep,
  type RoomType,
} from '../../state/types';
import { roomNextHint, roomSubstepIndex } from '../../state/session';
import styles from './RoomScreen.module.css';

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS) as RoomType[];

const SUBSTEP_TITLE: Record<RoomSubstep, string> = {
  houseType: 'Укажите тип дома',
  slabType: 'Выберите тип перекрытия',
  slabThickness: 'Выберите толщину перекрытия',
  basics: 'Укажите тип комнаты и площадь',
  plannedCeiling: 'Выберите планируемый потолок',
  objectStage: 'Укажите стадию объекта',
  noisyNeighbors: 'Укажите шум сверху',
  roomWish: 'Какую задачу должен решить MultiFrame?',
};

export function RoomScreen() {
  const {
    session,
    setRoomType,
    setCeilingArea,
    setSlabType,
    setSlabThickness,
    setHouseType,
    setObjectStage,
    setPlannedCeiling,
    setNoisyNeighbors,
    setRoomWish,
    canGoNext,
  } = useSession();
  const [wishPicked, setWishPicked] = useState(false);
  const room = session.answers.room;
  const sub = session.roomSubstep;
  const hint = roomNextHint(session);
  const idx = roomSubstepIndex(sub);
  const total = ROOM_SUBSTEPS.length;
  const progressPct = Math.round(((idx + 1) / total) * 100);
  const factorLabel = ROOM_FACTOR_GROUP_LABEL[ROOM_FACTOR_GROUP[sub]];

  return (
    <Screen
      stickyHead
      eyebrow={factorLabel}
      lead={`Вопрос ${idx + 1} из ${total} · ${factorLabel}`}
      title={SUBSTEP_TITLE[sub]}
    >
      <div className={styles.progressWrap} aria-hidden>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

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

      {sub === 'roomWish' ? (
        <div className={styles.grid}>
          {ROOM_WISH_OPTIONS.map((opt) => (
            <CardSelect
              key={opt.id}
              dense
              title={opt.label}
              selected={wishPicked && room.roomWish === opt.id}
              onClick={() => {
                setWishPicked(true);
                setRoomWish(opt.id);
              }}
            />
          ))}
        </div>
      ) : null}
    </Screen>
  );
}
