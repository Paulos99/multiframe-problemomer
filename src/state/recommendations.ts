import type {
  NoiseType,
  RoomAnswers,
  RoomWishOption,
} from './types';

function endsWithPeriod(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return /[.!?…]$/.test(t) ? t : `${t}.`;
}

function roomContext(room: RoomAnswers): string {
  switch (room.roomType) {
    case 'bedroom':
      return 'В этой спальне';
    case 'kids':
      return 'В этой детской';
    case 'living':
      return 'В этой гостиной';
    case 'kitchen':
      return 'В этой кухне';
    case 'office':
      return 'В этом кабинете';
    default:
      return 'В этом помещении';
  }
}

function slabDiagnosis(room: RoomAnswers): string {
  const { slabType: slab, houseType: house } = room;

  if (slab === 'hollow' || (slab === 'unknown' && (house === 'panel' || house === 'block'))) {
    return 'пустотная плита, которая заметно проводит разговоры и структурные удары';
  }
  if (slab === 'wood' || (slab === 'unknown' && house === 'wood')) {
    return 'лёгкое перекрытие, которое быстро отзывается на шаги, падения и низкие частоты';
  }
  if (slab === 'monolith' || (slab === 'unknown' && (house === 'monolith' || house === 'brick'))) {
    return 'жёсткое железобетонное перекрытие: оно сдерживает часть голосов, но хорошо передаёт шаги и удары';
  }
  return 'само перекрытие, через которое проходят и воздушный, и структурный шум';
}

function ceilingDiagnosis(room: RoomAnswers): string | null {
  switch (room.plannedCeiling) {
    case 'stretch':
      return 'пустой зазор под натяжным потолком способен добавить звуку гулкий «барабанный» оттенок';
    case 'gypsum':
      return 'закрытая полость под ГКЛ без поглощающего слоя почти не меняет этот путь';
    case 'plaster':
      return 'штукатурка или окраска акустически почти не меняют этот путь';
    case 'other_exists':
      return 'готовая отделка не разрывает этот путь без специального акустического слоя';
    default:
      return null;
  }
}

function caseDiagnosis(room: RoomAnswers): string {
  const ceiling = ceilingDiagnosis(room);
  return `${roomContext(room)} главное акустическое слабое место — ${slabDiagnosis(room)}${
    ceiling ? `; ${ceiling}` : ''
  }`;
}

function roomEffect(room: RoomAnswers): string {
  if (room.roomType === 'bedroom' || room.roomType === 'kids') {
    return ' и мешает отдыху';
  }
  if (room.roomType === 'office') {
    return ' и мешает сосредоточиться';
  }
  if (room.roomType === 'living') {
    return ' и не даёт по-настоящему расслабиться';
  }
  return '';
}

function casePriority(room: RoomAnswers, noiseType: NoiseType): string {
  const kind = room.noiseKind !== 'unknown' ? room.noiseKind : noiseType;

  if (room.roomWish === 'privacy_out') {
    return 'Если важна приватность, этот же слабый путь работает и в обратную сторону: речь и музыка из комнаты уходят через перекрытие наверх';
  }
  if (room.roomWish === 'music_recording') {
    return 'Для музыки и записи здесь важна не только изоляция: жёсткий потолок возвращает отражения в комнату, удлиняя эхо и снижая разборчивость';
  }

  if (room.noisyNeighbors === 'often_noisy') {
    if (kind === 'impact') {
      return `Регулярные шаги и удары сверху воспринимаются не как фон, а как резкие события, от которых трудно отвлечься${roomEffect(room)}`;
    }
    if (kind === 'airborne') {
      return `Когда голоса и музыка слышны часто, важна уже не только громкость: их разборчивость постоянно перетягивает внимание${roomEffect(room)}`;
    }
    return `Поскольку шаги и голоса появляются часто, комната не успевает возвращаться к тишине — такой меняющийся фон быстрее всего утомляет${roomEffect(room)}`;
  }

  if (room.noisyNeighbors === 'sometimes_noisy') {
    if (kind === 'impact') {
      return 'Даже эпизодические шаги и падения заметны сразу: удар приходит коротко и жёстко, поэтому его трудно воспринимать как фон';
    }
    if (kind === 'airborne') {
      return 'Разговоры и музыка появляются не постоянно, но остаются разборчивыми — именно поэтому их трудно перестать замечать';
    }
    return 'Шум приходит эпизодами, но хорошо узнаётся: то шаги, то речь — каждый такой момент снова возвращает внимание к соседям';
  }

  if (room.noisyNeighbors === 'usually_quiet') {
    return 'Сейчас сверху обычно спокойно, но у конструкции почти нет акустического запаса: при изменении режима у соседей звуки проявятся без дополнительного барьера';
  }

  if (kind === 'impact') {
    return 'Главный риск этой конструкции — структурный удар: шаги и падения входят в плиту и распространяются по ней дальше точки контакта';
  }
  if (kind === 'airborne') {
    return 'Главный риск этой конструкции — разборчивые голоса и музыка, которые проходят через перекрытие и потолочную полость';
  }
  return 'У конструкции есть два уязвимых канала сразу: плита проводит шаги, а потолочная полость сохраняет голоса и музыку разборчивыми';
}

function installTiming(room: RoomAnswers): string {
  if (room.objectStage === 'newbuild' || room.objectStage === 'renovation') {
    return 'MultiFrame здесь важно заложить до финишного потолка';
  }
  if (room.objectStage === 'occupied') {
    return 'MultiFrame здесь логично поставить при ближайшей доработке потолка';
  }
  return 'MultiFrame здесь нужен под финишным потолком';
}

function multiFrameHelp(room: RoomAnswers, noiseType: NoiseType): string {
  const kind = room.noiseKind !== 'unknown' ? room.noiseKind : noiseType;
  const impactHeavy = kind === 'impact' || kind === 'mixed';
  const hasDrum = room.plannedCeiling === 'stretch';

  let effect: string;
  if (room.roomWish === 'music_recording') {
    effect = 'панели сократят хвост отражений в комнате и одновременно добавят барьер на пути шума через плиту';
  } else if (room.roomWish === 'privacy_out') {
    effect = 'панели добавят поглощение со стороны комнаты и ослабят путь голоса вверх';
  } else if (kind === 'mixed') {
    effect = hasDrum
      ? 'панели снимут резонанс полости, снизят разборчивость голосов и смягчат шаги'
      : 'панели снизят разборчивость голосов и сделают шаги менее резкими';
  } else if (kind === 'impact') {
    effect = hasDrum
      ? 'панели снимут резонанс полости и сделают шаги и удары менее резкими'
      : 'панели добавят поглощение под перекрытием и смягчат шаги и удары';
  } else if (kind === 'airborne') {
    effect = hasDrum
      ? 'панели снимут резонанс полости и снизят разборчивость голосов и музыки'
      : 'панели добавят поглощение под перекрытием и снизят разборчивость голосов и музыки';
  } else {
    effect = 'панели превратят пустую потолочную полость в работающий акустический слой';
  }

  let honesty = '';
  if (impactHeavy && room.floorAbove === 'floating') {
    honesty =
      '; плавающий пол сверху уже снимает основную часть структурного удара, а система доработает остаточный шум как второй акустический рубеж';
  } else if (impactHeavy && room.floorAbove === 'ordinary') {
    honesty =
      '; потолок смягчит удар, но максимальный результат даёт развязанный пол у источника';
  } else if (impactHeavy) {
    honesty =
      '; по ударному шуму итог зависит и от конструкции пола сверху';
  }

  return `${installTiming(room)}: ${effect}${honesty}`;
}

/**
 * Expert recommendations for Result: acoustic character + problem + MultiFrame help.
 * Three connected sentences: diagnosis → lived effect → case-specific solution.
 */
export function caseVerdictParts(
  room: RoomAnswers,
  noiseType: NoiseType,
): readonly [string, string, string] {
  return [
    endsWithPeriod(caseDiagnosis(room)),
    endsWithPeriod(casePriority(room, noiseType)),
    endsWithPeriod(multiFrameHelp(room, noiseType)),
  ];
}

export function caseVerdict(room: RoomAnswers, noiseType: NoiseType): string {
  return caseVerdictParts(room, noiseType).join(' ');
}

/** Product value block: what is unique about the material, without repeating the case diagnosis. */
export const MULTIFRAME_PRODUCT_CLAIM =
  'Цельная акустическая поверхность внутри привычного потолка.';

export const MULTIFRAME_PRODUCT_BLURB =
  'Рельефные пористые панели MultiFrame стыкуются в сплошной бескаркасный слой: он рассеивает и поглощает энергию шума, а потолочная полость перестаёт подыгрывать перекрытию как пустой барабан. Снаружи остаётся чистый финишный потолок, внутри — работающая акустика без минваты, тяжёлого каркаса и долгой стройки.';

export const MULTIFRAME_PANEL_IMG = `${import.meta.env.BASE_URL}images/multiframe-panel-transparent.png`;

/** @deprecated Prefer caseVerdict. */
export function personalStory(room: RoomAnswers, noiseType: NoiseType): string[] {
  return [caseVerdict(room, noiseType)];
}

/** @deprecated Prefer caseVerdict. */
export function buildRecommendations(room: RoomAnswers, noiseType: NoiseType): string[] {
  return [caseVerdict(room, noiseType)];
}

export function wishLabelFor(wish: RoomWishOption): string {
  switch (wish) {
    case 'from_above':
      return 'Чтобы сверху стало тише';
    case 'privacy_out':
      return 'Чтобы вас меньше было слышно сверху';
    case 'music_recording':
      return 'Чтобы в комнате было меньше эха';
    case 'general':
      return 'Общий акустический комфорт';
    default:
      return 'Пока не определился';
  }
}
