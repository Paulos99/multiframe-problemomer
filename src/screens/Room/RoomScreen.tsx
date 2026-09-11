import { Screen } from '../../ui/Screen';
import { CardSelect } from '../../ui/CardSelect';
import { Field, TextInput, Select } from '../../ui/Field';
import { useSession } from '../../state/SessionContext';
import {
  NORMS_SLAB_TYPICAL,
  ROOM_TYPE_LABELS,
  SLAB_TYPE_LABELS,
  type RoomType,
  type SlabType,
} from '../../state/types';
import styles from './RoomScreen.module.css';

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS) as RoomType[];

export function RoomScreen() {
  const { session, setRoomType, setCeilingArea, setFloorSlab } = useSession();
  const room = session.answers.room;
  const slab = room.floorSlab;

  const educational =
    slab && slab.type !== 'unknown' ? NORMS_SLAB_TYPICAL[slab.type] : null;

  return (
    <Screen
      title="Комната и потолок"
      subtitle="Опишите помещение. Этаж не спрашиваем — важен только потолок и перекрытие сверху."
    >
      <div className={styles.grid}>
        {ROOM_TYPES.map((type) => (
          <CardSelect
            key={type}
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

      <div className={styles.optional}>
        <h2>Перекрытие сверху (по желанию)</h2>
        <p>Только для образовательного контекста — не обещание эффекта MultiFrame.</p>
        <div className={styles.row}>
          <Field label="Тип плиты">
            <Select
              value={slab?.type ?? ''}
              onChange={(e) => {
                const v = e.target.value as SlabType | '';
                if (!v) {
                  setFloorSlab(undefined);
                  return;
                }
                setFloorSlab({ type: v, thicknessMm: slab?.thicknessMm });
              }}
            >
              <option value="">Не указывать</option>
              {(Object.keys(SLAB_TYPE_LABELS) as SlabType[]).map((t) => (
                <option key={t} value={t}>
                  {SLAB_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Толщина, мм">
            <TextInput
              type="number"
              inputMode="numeric"
              min={50}
              max={400}
              placeholder="опционально"
              disabled={!slab}
              value={slab?.thicknessMm ?? ''}
              onChange={(e) => {
                if (!slab) return;
                const v = e.target.value;
                setFloorSlab({
                  ...slab,
                  thicknessMm: v === '' ? undefined : Number(v),
                });
              }}
            />
          </Field>
        </div>
        {educational ? (
          <aside className={styles.edu}>
            <strong>Справка по типичным перекрытиям</strong>
            <span>{educational.thicknessHint}</span>
            <p>{educational.note}</p>
          </aside>
        ) : null}
      </div>
    </Screen>
  );
}
