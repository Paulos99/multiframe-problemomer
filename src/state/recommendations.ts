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

function roomWhere(room: RoomAnswers): string {
  switch (room.roomType) {
    case 'bedroom':
      return 'спальне';
    case 'kids':
      return 'детской';
    case 'living':
      return 'гостиной';
    case 'kitchen':
      return 'кухне';
    case 'office':
      return 'кабинете';
    default:
      return 'комнате';
  }
}

function heardKind(room: RoomAnswers, noiseType: NoiseType): NoiseType | 'unknown' {
  if (room.noiseKind === 'impact' || room.noiseKind === 'airborne' || room.noiseKind === 'mixed') {
    return room.noiseKind;
  }
  return noiseType;
}

function slabSentence(room: RoomAnswers): string {
  const { slabType: slab, houseType: house } = room;
  if (slab === 'hollow' || (slab === 'unknown' && (house === 'panel' || house === 'block'))) {
    return 'Пустотная плита хорошо пропускает и шаги, и разговоры';
  }
  if (slab === 'wood' || (slab === 'unknown' && house === 'wood')) {
    return 'Деревянное перекрытие легко проводит шаги и низкий гул';
  }
  if (slab === 'monolith' || (slab === 'unknown' && (house === 'monolith' || house === 'brick'))) {
    return 'Бетонная плита частично задерживает голоса, но хорошо передаёт шаги и стук';
  }
  return 'Через перекрытие проходят и шаги, и разговоры';
}

function ceilingSentence(room: RoomAnswers): string | null {
  switch (room.plannedCeiling) {
    case 'stretch':
      return 'Пустой промежуток под натяжным потолком добавляет этому звуку гул';
    case 'gypsum':
      return 'Обычный гипсокартон сам по себе этот шум почти не останавливает';
    case 'plaster':
      return 'Штукатурка или краска от шума сверху почти не защищают';
    case 'other_exists':
      return 'Готовый потолок без звукоизоляционного слоя этот путь не закрывает';
    default:
      return null;
  }
}

function caseDiagnosis(room: RoomAnswers): string {
  return [slabSentence(room), ceilingSentence(room)].filter(Boolean).join('. ');
}

function fatigueSentence(room: RoomAnswers): string | null {
  switch (room.roomType) {
    case 'bedroom':
    case 'kids':
      return 'Отдохнуть в таком шуме трудно';
    case 'office':
      return 'Работать в таком шуме трудно';
    case 'living':
      return 'Расслабиться в таком шуме трудно';
    default:
      return null;
  }
}

function casePriority(room: RoomAnswers, noiseType: NoiseType): string {
  const where = roomWhere(room);
  const kind = heardKind(room, noiseType);

  if (room.roomWish === 'privacy_out') {
    return 'Ваши разговоры и музыка уходят наверх тем же путём, которым чужой шум приходит вниз';
  }
  if (room.roomWish === 'music_recording') {
    return 'Жёсткий потолок возвращает звук обратно в комнату, поэтому эхо долго не затихает';
  }

  if (room.noisyNeighbors === 'often_noisy') {
    const heard =
      kind === 'impact'
        ? `В ${where} часто слышны шаги и стук сверху`
        : kind === 'airborne'
          ? `В ${where} часто слышны голоса и музыка сверху`
          : `В ${where} часто слышны и шаги, и голоса: тихо не становится`;
    return [heard, fatigueSentence(room)].filter(Boolean).join('. ');
  }

  if (room.noisyNeighbors === 'sometimes_noisy') {
    if (kind === 'impact') {
      return 'Шаги бывают не каждый день, но каждый удар слышен резко и сразу отвлекает';
    }
    if (kind === 'airborne') {
      return 'Голоса и музыка появляются не постоянно, но их легко узнать, поэтому они всё равно мешают';
    }
    return 'Шум приходит время от времени: то шаги, то разговоры. Каждый такой момент снова обращает на себя внимание';
  }

  if (room.noisyNeighbors === 'usually_quiet') {
    return 'Сейчас сверху обычно тихо. Если соседи станут шумнее, звук пройдёт почти без препятствий';
  }

  if (kind === 'impact') return 'Сверху здесь в первую очередь проходят шаги и удары';
  if (kind === 'airborne') return 'Сверху здесь в первую очередь проходят голоса и музыка';
  return 'Сверху здесь могут быть слышны и шаги, и голоса';
}

function installSentence(room: RoomAnswers): string {
  if (room.objectStage === 'newbuild' || room.objectStage === 'renovation') {
    return 'Заложите MultiFrame до чистового потолка';
  }
  if (room.objectStage === 'occupied') {
    return 'Поставьте MultiFrame, когда будете делать или менять потолок';
  }
  return 'Поставьте MultiFrame под чистовой потолок';
}

function effectSentence(room: RoomAnswers, noiseType: NoiseType): string {
  const kind = heardKind(room, noiseType);
  if (room.roomWish === 'music_recording') {
    return 'Эха в комнате станет меньше, и шум сверху тоже притихнет';
  }
  if (room.roomWish === 'privacy_out') {
    return 'Вас будет меньше слышно наверху, и сверху тоже станет тише';
  }
  if (kind === 'impact') return 'Шаги и удары станут заметно мягче';
  if (kind === 'airborne') return 'Голоса и музыка сверху станут тише';
  return 'Шаги станут мягче, а голоса — тише';
}

function honestySentence(room: RoomAnswers, noiseType: NoiseType): string | null {
  if (room.roomWish === 'music_recording' || room.roomWish === 'privacy_out') return null;
  const kind = heardKind(room, noiseType);
  const impactHeavy = kind === 'impact' || kind === 'mixed';
  if (!impactHeavy) return null;
  if (room.floorAbove === 'floating') {
    return 'Пол сверху уже убрал основную часть удара, панели доберут оставшийся шум';
  }
  if (room.floorAbove === 'ordinary') {
    return 'Потолок смягчит шаг, но самый громкий топот убирает пол у соседей';
  }
  if (impactHeavy) {
    return 'Полную тишину по шагам даёт ещё и пол у соседей сверху';
  }
  return null;
}

function multiFrameHelp(room: RoomAnswers, noiseType: NoiseType): string {
  return [installSentence(room), effectSentence(room, noiseType), honestySentence(room, noiseType)]
    .filter(Boolean)
    .join('. ');
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

export interface ProductAbout {
  claim: string;
  paragraphs: readonly [string, string, string];
}

function materialEffect(room: RoomAnswers, noiseType: NoiseType): string {
  const kind = heardKind(room, noiseType);
  if (room.plannedCeiling === 'stretch') {
    return 'Каркас принимает удар, отверстия гасят голос и эхо, и пустой промежуток под полотном перестаёт гудеть.';
  }
  if (room.roomWish === 'music_recording') {
    return 'Отверстия забирают эхо внутри комнаты, а каркас ослабляет удар сверху.';
  }
  if (room.roomWish === 'privacy_out' || kind === 'airborne') {
    return 'Голос проходит в отверстия и затихает внутри панели, а не отражается обратно.';
  }
  if (kind === 'impact') {
    return 'Каркас принимает энергию шагов, а отверстия гасят остальной звук.';
  }
  return 'Каркас принимает удар, а отверстия рассеивают голос и эхо.';
}

/** Plain-language product explanation for a client who has not heard of MultiFrame. */
export function productAbout(room: RoomAnswers, noiseType: NoiseType): ProductAbout {
  return {
    claim: 'Звукоизоляция потолка без каркаса и минваты.',
    paragraphs: [
      'Это готовые панели: их крепят прямо к перекрытию и закрывают натяжным полотном, гипсокартоном или другой отделкой.',
      `Внутри — пружинящий каркас и открытый материал с отверстиями. ${materialEffect(room, noiseType)} Панели стыкуются в одно полотно.`,
      'Металлический каркас и минеральная вата не нужны. Один мастер ставит панель меньше чем за минуту, материал не пылит и подходит для жилых комнат.',
    ],
  };
}

export const MULTIFRAME_PRODUCT_CLAIM = 'Звукоизоляция потолка без каркаса и минваты.';

export const MULTIFRAME_PRODUCT_BLURB =
  'Это готовые панели под чистовой потолок. Пружинящий каркас принимает удар, отверстия гасят голос и эхо. Панели стыкуются в одно полотно без металлического каркаса и минеральной ваты.';

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
