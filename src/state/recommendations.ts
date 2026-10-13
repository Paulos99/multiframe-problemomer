import type {
  HouseTypeOption,
  NoiseType,
  PlannedCeilingOption,
  RoomAnswers,
  RoomWishOption,
  SlabTypeOption,
} from './types';
import { shouldAskNoiseKind } from './types';

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function endsWithPeriod(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return /[.!?…]$/.test(t) ? t : `${t}.`;
}

/** How this construction typically carries sound — expert characterization. */
function acousticCharacter(room: RoomAnswers): string {
  const house = room.houseType;
  const slab = room.slabType;
  const ceiling = room.plannedCeiling;

  const slabBit = slabCharacter(slab, house);
  const ceilingBit = ceilingCharacter(ceiling);
  const place =
    room.roomType === 'bedroom' || room.roomType === 'kids'
      ? 'В жилой комнате, где важна тишина,'
      : room.roomType === 'office'
        ? 'В кабинете,'
        : 'В этом помещении';

  if (slabBit && ceilingBit) {
    return `${place} ${slabBit}, а ${ceilingBit}`;
  }
  if (slabBit) {
    return `${place} ${slabBit}`;
  }
  if (ceilingBit) {
    return `${place} ${ceilingBit}`;
  }
  return `${place} шум сверху проходит через плиту и зависит от того, что лежит между перекрытием и финишным потолком`;
}

function slabCharacter(slab: SlabTypeOption, house: HouseTypeOption): string | null {
  if (slab === 'hollow' || (slab === 'unknown' && (house === 'panel' || house === 'block'))) {
    return 'пустотная плита хорошо пропускает и удар, и голоса — конструкция «звонкая»';
  }
  if (slab === 'wood' || (slab === 'unknown' && house === 'wood')) {
    return 'деревянное перекрытие слабо держит ударный шум и низкие частоты';
  }
  if (slab === 'monolith' || (slab === 'unknown' && (house === 'monolith' || house === 'brick'))) {
    return 'сплошная ж/б плита тяжелее пустотной, но в жилом доме без акустики сверху всё равно слышны и шаги, и речь';
  }
  if (house === 'panel') {
    return 'в панельном доме перекрытие обычно пустотное и довольно «прозрачное» для шума соседей';
  }
  if (house === 'block') {
    return 'в блочном доме перекрытие часто пустотное, и шум сверху доходит отчётливо';
  }
  return null;
}

function ceilingCharacter(ceiling: PlannedCeilingOption): string | null {
  switch (ceiling) {
    case 'stretch':
      return 'воздушный зазор под обычным натяжным работает как барабан и может усиливать звук сверху';
    case 'gypsum':
      return 'гипсокартон или подвес сам по себе почти не спасает от шума через плиту';
    case 'plaster':
      return 'штукатурка или покраска почти не добавляют изоляции от соседей сверху';
    case 'other_exists':
      return 'уже смонтированный потолок мало что меняет, пока между плитой и финишем нет акустического слоя';
    default:
      return null;
  }
}

function problemLine(room: RoomAnswers, noiseType: NoiseType): string | null {
  const kind =
    shouldAskNoiseKind(room.noisyNeighbors) && room.noiseKind !== 'unknown'
      ? room.noiseKind
      : null;

  const freq = room.noisyNeighbors;
  let noisePart: string | null = null;
  if (freq === 'often_noisy') {
    if (kind === 'impact') noisePart = 'Сверху часто слышен топот и шаги — это мешает отдыхать';
    else if (kind === 'airborne') noisePart = 'Сверху часто доходят голоса и музыка — фон не отпускает';
    else if (kind === 'mixed') noisePart = 'Сверху часто слышны и шаги, и голоса — помещение почти не даёт тишины';
    else noisePart = 'Сверху часто шумно — соседи слышны слишком отчётливо';
  } else if (freq === 'sometimes_noisy') {
    if (kind === 'impact') noisePart = 'Иногда сверху проходит топот — в такие моменты комната теряет комфорт';
    else if (kind === 'airborne') noisePart = 'Иногда сверху пробиваются голоса и музыка';
    else if (kind === 'mixed') noisePart = 'Иногда сверху слышны и шаги, и разговоры';
    else noisePart = 'Шум сверху бывает не постоянно, но уже заметно снижает комфорт';
  } else if (freq === 'usually_quiet') {
    noisePart = 'Сейчас сверху обычно тихо, но запас по изоляции всё равно полезен на будущее';
  } else if (noiseType === 'impact') {
    noisePart = 'Главный риск здесь — ударный шум: шаги и падения через плиту';
  } else if (noiseType === 'airborne') {
    noisePart = 'Главный риск здесь — воздушный шум: речь и музыка через перекрытие';
  }

  const wish = room.roomWish;
  let wishPart: string | null = null;
  if (wish === 'from_above') wishPart = 'нужно, чтобы сверху стало заметно тише';
  else if (wish === 'privacy_out') wishPart = 'важно, чтобы вас меньше было слышно сверху';
  else if (wish === 'music_recording') wishPart = 'мешает эхо в самой комнате';
  else if (wish === 'general') wishPart = 'нужен спокойный акустический фон';

  if (noisePart && wishPart) return `${noisePart} Вам ${wishPart}`;
  if (noisePart) return noisePart;
  if (wishPart) return `Вам ${wishPart}`;
  return null;
}

function multiFrameHelp(room: RoomAnswers, noiseType: NoiseType): string {
  const impactHeavy =
    noiseType === 'impact' ||
    noiseType === 'mixed' ||
    room.noiseKind === 'impact' ||
    room.noiseKind === 'mixed';
  const airHeavy =
    noiseType === 'airborne' ||
    room.noiseKind === 'airborne' ||
    room.roomWish === 'privacy_out';
  const drum = room.plannedCeiling === 'stretch';

  const timing =
    room.objectStage === 'newbuild' || room.objectStage === 'renovation'
      ? 'лучше заложить панели до финишного потолка'
      : room.objectStage === 'occupied'
        ? 'можно поставить при замене или доработке потолка'
        : 'стоит поставить под финишный потолок';

  let core: string;
  if (room.roomWish === 'music_recording') {
    core = `MultiFrame ${timing}: панель гасит эхо в комнате и одновременно смягчает фон сверху`;
  } else if (room.roomWish === 'privacy_out') {
    core = `MultiFrame ${timing}: слой под потолком глушит голоса и музыку, которые уходят вверх через плиту`;
  } else if (impactHeavy && airHeavy) {
    core = `MultiFrame ${timing}: удар сверху станет мягче, голоса и музыка — тише`;
  } else if (impactHeavy) {
    core = `MultiFrame ${timing}: топот и шаги сверху станут заметно мягче`;
  } else if (airHeavy) {
    core = `MultiFrame ${timing}: голоса и музыка сверху станут заметно мягче`;
  } else if (drum) {
    core = `MultiFrame ${timing}: панели убирают «барабан» под натяжным и делают фон сверху спокойнее`;
  } else {
    core = `MultiFrame ${timing}: сверху станет тише, а в комнате спокойнее`;
  }

  if (impactHeavy) {
    core +=
      '. Полную норму по удару часто добивает ещё пол у соседа сверху — потолок закрывает свою часть задачи';
  } else if (drum) {
    core += '. Именно акустический слой под полотном решает усиление в зазоре';
  }

  return endsWithPeriod(capitalize(core));
}

/**
 * Expert recommendations for Result: acoustic character + problem + MultiFrame help.
 * 2–3 connected sentences; answers shape wording without sounding like a field dump.
 */
export function caseVerdict(room: RoomAnswers, noiseType: NoiseType): string {
  const s1 = endsWithPeriod(acousticCharacter(room));
  const problem = problemLine(room, noiseType);
  const s3 = multiFrameHelp(room, noiseType);

  if (problem) {
    return `${s1} ${endsWithPeriod(problem)} ${s3}`;
  }
  return `${s1} ${s3}`;
}

/** Short static blurb for the product card next to recommendations. */
export const MULTIFRAME_PRODUCT_BLURB =
  'MultiFrame — бескаркасные акустические панели под натяжной или другой финишный потолок. Пористый материал с рельефной поверхностью рассеивает и поглощает энергию шума, панели стыкуются без каркаса и минваты — сверху остаётся привычное полотно.';

export const MULTIFRAME_PANEL_IMG = `${import.meta.env.BASE_URL}images/multiframe-panel.jpg`;

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
