import type {
  NoiseType,
  NoisyNeighborsOption,
  ObjectStageOption,
  RoomAnswers,
  RoomWishOption,
} from './types';
import {
  NOISE_KIND_OPTIONS,
  NOISY_NEIGHBORS_OPTIONS,
  PLANNED_CEILING_OPTIONS,
  ROOM_WISH_OPTIONS,
  shouldAskNoiseKind,
} from './types';
import { ceilingContextLine } from './wish';

function optLabel<T extends string>(
  options: { id: T; label: string }[],
  id: T,
): string {
  return options.find((o) => o.id === id)?.label ?? '';
}

function painLine(noisy: NoisyNeighborsOption): string | null {
  if (noisy === 'often_noisy') {
    return 'Вы отметили, что сверху часто шумно — это сильная боль: MultiFrame как раз закрывает ощущение «соседи всегда слышны».';
  }
  if (noisy === 'sometimes_noisy') {
    return 'Шум сверху бывает не постоянно, но уже мешает. В такие моменты разница «сейчас / с MultiFrame» особенно заметна.';
  }
  if (noisy === 'usually_quiet') {
    return 'Сейчас сверху обычно тихо — MultiFrame всё равно поднимает запас комфорта и страхует от будущих соседей.';
  }
  return null;
}

function noiseFocusLine(noiseType: NoiseType, room: RoomAnswers): string | null {
  if (shouldAskNoiseKind(room.noisyNeighbors) && room.noiseKind !== 'unknown') {
    if (room.noiseKind === 'impact') {
      return 'Вам важнее ударный шум (топот, бег). На итогах смотрите блок удара и процент «тише» по Lnw — потолок смягчает, а пол у соседа часто нужен для нормы.';
    }
    if (room.noiseKind === 'airborne') {
      return 'Вам важнее голоса и музыка сверху. Смотрите изоляцию воздуха (Rw) и демо «воздушный шум» — MultiFrame здесь даёт самый понятный эффект.';
    }
    if (room.noiseKind === 'mixed') {
      return 'Слышны и шаги, и голоса — смотрите оба канала: воздух и удар. MultiFrame работает по обоим, но по-разному.';
    }
  }
  if (noiseType === 'impact') {
    return 'Акцент на ударный шум сверху — шаги и падения через плиту.';
  }
  if (noiseType === 'airborne') {
    return 'Акцент на воздушный шум — голоса и музыка через плиту.';
  }
  return 'Ниже — и воздух, и удар: так обычно шумят сверху в жилых домах.';
}

function stageLine(stage: ObjectStageOption): string | null {
  if (stage === 'newbuild') {
    return 'Объект до заселения — лучший момент заложить акустику до финишного потолка.';
  }
  if (stage === 'renovation') {
    return 'Идёт ремонт — удобно добавить MultiFrame до натяжного или другого финиша.';
  }
  if (stage === 'occupied') {
    return 'Уже живут — систему можно поставить при замене потолка, без долгой стройки.';
  }
  return null;
}

/**
 * 1–2 paragraph personal story for Result (ceiling + wish + noise pain).
 */
export function personalStory(room: RoomAnswers, noiseType: NoiseType): string[] {
  const paragraphs: string[] = [];
  const ceilingBit = ceilingContextLine(room.plannedCeiling);
  const pain = painLine(room.noisyNeighbors);

  const leadParts: string[] = [];
  if (room.plannedCeiling !== 'unknown') {
    leadParts.push(
      `Потолок: ${optLabel(PLANNED_CEILING_OPTIONS, room.plannedCeiling).toLowerCase()}.`,
    );
  }
  if (room.roomWish !== 'other') {
    leadParts.push(`Цель: ${optLabel(ROOM_WISH_OPTIONS, room.roomWish).toLowerCase()}.`);
  }
  if (
    shouldAskNoiseKind(room.noisyNeighbors) &&
    room.noiseKind !== 'unknown'
  ) {
    leadParts.push(
      `Слышите сверху: ${optLabel(NOISE_KIND_OPTIONS, room.noiseKind).toLowerCase()}.`,
    );
  } else if (room.noisyNeighbors !== 'unknown') {
    leadParts.push(
      `Соседи: ${optLabel(NOISY_NEIGHBORS_OPTIONS, room.noisyNeighbors).toLowerCase()}.`,
    );
  }

  if (leadParts.length > 0) {
    paragraphs.push(
      `${leadParts.join(' ')} В вашем случае MultiFrame даёт персональный эффект: тише сверху и спокойнее в комнате.`,
    );
  }

  if (pain) paragraphs.push(pain);
  if (ceilingBit && room.plannedCeiling !== 'stretch') {
    paragraphs.push(ceilingBit);
  }
  // stretch drum is shown separately via stretchDrumLine in UI

  void noiseType;
  return paragraphs.slice(0, 3);
}

/**
 * Bullet recommendations for Result block.
 */
export function buildRecommendations(
  room: RoomAnswers,
  noiseType: NoiseType,
): string[] {
  const items: string[] = [];
  const pain = painLine(room.noisyNeighbors);
  if (pain) items.push(pain);

  const focus = noiseFocusLine(noiseType, room);
  if (focus) items.push(focus);

  const ceiling = ceilingContextLine(room.plannedCeiling);
  if (ceiling) items.push(ceiling);

  const stage = stageLine(room.objectStage);
  if (stage) items.push(stage);

  if (noiseType === 'impact' || noiseType === 'mixed') {
    items.push(
      'По ударному шуму потолок смягчает, но норму комфорта часто закрывает ещё и пол у соседа сверху.',
    );
  }

  if (room.roomWish === 'music_recording') {
    items.push('Для эха в комнате сравните блок «акустический комфорт» и демо на слух.');
  }

  // Dedupe while preserving order
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const line of items) {
    if (seen.has(line)) continue;
    seen.add(line);
    unique.push(line);
  }
  return unique.slice(0, 5);
}

export function wishLabelFor(wish: RoomWishOption): string {
  return optLabel(ROOM_WISH_OPTIONS, wish);
}
