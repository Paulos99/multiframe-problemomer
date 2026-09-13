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
  ROOM_TYPE_LABELS,
  SLAB_THICKNESS_OPTIONS,
  SLAB_TYPE_OPTIONS,
  type RoomType,
} from '../../state/types';
import { roomNextHint } from '../../state/session';
import styles from './RoomScreen.module.css';

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS) as RoomType[];

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
  const hint = roomNextHint(session);

  return (
    <Screen
      stickyHead
      title="Комната и потолок"
      subtitle="Опишите помещение. Этаж не спрашиваем — важен потолок и перекрытие сверху."
    >
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

      <Field label="Площадь потолка, м²" hint="Нужна для ссылки на калькулятор MultiFRAME">
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

      <section className={styles.block}>
        <h2>Тип перекрытия</h2>
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
      </section>

      <section className={styles.block}>
        <h2>Толщина перекрытия</h2>
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
      </section>

      <section className={styles.block}>
        <h2>Пол сверху</h2>
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
      </section>

      <section className={styles.block}>
        <h2>Тип дома</h2>
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
      </section>

      <section className={styles.block}>
        <h2>Стадия объекта</h2>
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
      </section>

      <section className={styles.block}>
        <h2>Планируемый потолок</h2>
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
      </section>

      <section className={styles.block}>
        <h2>Шумные соседи сверху</h2>
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
      </section>
    </Screen>
  );
}
