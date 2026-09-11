import { Screen } from '../../ui/Screen';
import { CardSelect } from '../../ui/CardSelect';
import { Field, TextInput, Select } from '../../ui/Field';
import { useSession } from '../../state/SessionContext';
import {
  ROOM_TYPE_LABELS,
  SLAB_KEY_LABELS,
  type RoomType,
  type SlabKey,
} from '../../state/types';
import { roomNextHint } from '../../state/session';
import styles from './RoomScreen.module.css';

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS) as RoomType[];
const SLAB_KEYS = Object.keys(SLAB_KEY_LABELS) as SlabKey[];

export function RoomScreen() {
  const { session, setRoomType, setCeilingArea, setFloorSlab, canGoNext } = useSession();
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
          {hint === 'выберите тип' ? 'выберите тип' : 'укажите площадь'}
        </p>
      ) : null}

      <div className={styles.optional}>
        <h2>Перекрытие сверху (по желанию)</h2>
        <p>Для оценочной симуляции. Если не указать — берём сплошную 180 мм.</p>
        <Field label="Тип / толщина плиты">
          <Select
            value={room.floorSlab?.key ?? room.floorSlab?.preset ?? ''}
            onChange={(e) => {
              const v = e.target.value as SlabKey | '';
              if (!v) {
                setFloorSlab(undefined);
                return;
              }
              setFloorSlab({ key: v });
            }}
          >
            <option value="">Не указывать (180 по умолчанию)</option>
            {SLAB_KEYS.map((k) => (
              <option key={k} value={k}>
                {SLAB_KEY_LABELS[k]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Screen>
  );
}
