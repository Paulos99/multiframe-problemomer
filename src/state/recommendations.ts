import type {
  HouseTypeOption,
  NoiseType,
  NoisyNeighborsOption,
  ObjectStageOption,
  PlannedCeilingOption,
  RoomAnswers,
  RoomType,
  RoomWishOption,
  SlabThicknessOption,
  SlabTypeOption,
} from './types';
import {
  ROOM_TYPE_LABELS,
  shouldAskNoiseKind,
} from './types';

function housePhrase(house: HouseTypeOption): string | null {
  switch (house) {
    case 'panel':
      return 'в панельном доме';
    case 'block':
      return 'в блочном доме';
    case 'brick':
      return 'в кирпичном доме';
    case 'monolith':
      return 'в монолитном доме';
    case 'wood':
      return 'в доме с деревянными перекрытиями';
    default:
      return null;
  }
}

function slabPhrase(type: SlabTypeOption, thick: SlabThicknessOption): string | null {
  const kind =
    type === 'hollow'
      ? 'пустотной плитой'
      : type === 'monolith'
        ? 'сплошной ж/б плитой'
        : type === 'wood'
          ? 'деревянным перекрытием'
          : null;
  const mm =
    thick === 'up_to_160'
      ? 'до ~160 мм'
      : thick === 'about_160_200'
        ? '~160–200 мм'
        : thick === 'about_200_250'
          ? '~200–250 мм'
          : thick === 'over_250'
            ? 'толще ~250 мм'
            : null;

  if (kind && mm) return `с ${kind} ${mm}`;
  if (kind) return `с ${kind}`;
  if (mm) return `с перекрытием ${mm}`;
  return null;
}

function roomPhrase(roomType: RoomType | null, area: number | null): string | null {
  const name = roomType && roomType !== 'other' ? ROOM_TYPE_LABELS[roomType].toLowerCase() : null;
  if (name && area != null && area > 0) return `в ${nameGenitive(roomType!)} ~${formatArea(area)} м²`;
  if (name) return `в ${nameGenitive(roomType!)}`;
  if (area != null && area > 0) return `в помещении ~${formatArea(area)} м²`;
  return null;
}

/** Prepositional-ish room names for «в …». */
function nameGenitive(type: RoomType): string {
  switch (type) {
    case 'living':
      return 'гостиной';
    case 'bedroom':
      return 'спальне';
    case 'kids':
      return 'детской';
    case 'kitchen':
      return 'кухне';
    case 'office':
      return 'кабинете';
    default:
      return 'комнате';
  }
}

function formatArea(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
}

function stagePhrase(stage: ObjectStageOption): string | null {
  switch (stage) {
    case 'newbuild':
      return 'на стадии новостройки, до заселения';
    case 'renovation':
      return 'на стадии ремонта';
    case 'occupied':
      return 'в уже обжитом жилье';
    default:
      return null;
  }
}

function ceilingPhrase(ceiling: PlannedCeilingOption): { prep: string | null; drum: boolean } {
  switch (ceiling) {
    case 'stretch':
      return { prep: 'под натяжной потолок', drum: true };
    case 'gypsum':
      return { prep: 'под гипсокартонный или подвесной потолок', drum: false };
    case 'plaster':
      return { prep: 'при штукатурке или покраске потолка', drum: false };
    case 'other_exists':
      return { prep: 'при уже существующем потолке', drum: false };
    default:
      return { prep: null, drum: false };
  }
}

function noiseFrequencyPhrase(noisy: NoisyNeighborsOption): string | null {
  switch (noisy) {
    case 'often_noisy':
      return 'сверху часто шумно';
    case 'sometimes_noisy':
      return 'сверху бывает шумно';
    case 'usually_quiet':
      return 'сверху обычно тихо';
    default:
      return null;
  }
}

function noiseKindPhrase(room: RoomAnswers): string | null {
  if (!shouldAskNoiseKind(room.noisyNeighbors) || room.noiseKind === 'unknown') return null;
  switch (room.noiseKind) {
    case 'impact':
      return 'слышны топот и шаги';
    case 'airborne':
      return 'слышны голоса и музыка';
    case 'mixed':
      return 'слышны и шаги, и голоса';
    default:
      return null;
  }
}

function wishPhrase(wish: RoomWishOption): string | null {
  switch (wish) {
    case 'from_above':
      return 'вам важно, чтобы сверху стало тише';
    case 'privacy_out':
      return 'вам важно, чтобы вас меньше было слышно сверху';
    case 'music_recording':
      return 'вам важно убрать лишнее эхо в комнате';
    case 'general':
      return 'вам важен общий акустический комфорт';
    default:
      return null;
  }
}

function joinClauses(parts: string[]): string {
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} ${parts[1]}`;
  return parts.join(', ');
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function endsWithPeriod(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return /[.!?…]$/.test(t) ? t : `${t}.`;
}

/**
 * Practitioner-style case verdict: 2–3 connected sentences covering all known answers.
 */
export function caseVerdict(room: RoomAnswers, noiseType: NoiseType): string {
  const house = housePhrase(room.houseType);
  const slab = slabPhrase(room.slabType, room.slabThickness);
  const place = roomPhrase(room.roomType, room.ceilingAreaM2);
  const stage = stagePhrase(room.objectStage);
  const { prep: ceilingPrep, drum } = ceilingPhrase(room.plannedCeiling);
  const freq = noiseFrequencyPhrase(room.noisyNeighbors);
  const kind = noiseKindPhrase(room);
  const wish = wishPhrase(room.roomWish);

  // ——— Sentence 1: object ———
  const objectBits: string[] = [];
  if (house) objectBits.push(house);
  if (slab) objectBits.push(slab);
  if (place) objectBits.push(place);
  if (stage) objectBits.push(stage);
  if (ceilingPrep) objectBits.push(ceilingPrep);

  let s1: string;
  if (objectBits.length > 0) {
    let lead = capitalize(joinClauses(objectBits));
    if (drum) {
      lead +=
        ' зазор под полотном часто работает как барабан и усиливает шум сверху';
    } else if (room.plannedCeiling === 'gypsum') {
      lead +=
        ' сам по себе такой потолок слабо гасит шум сверху';
    } else if (room.plannedCeiling === 'plaster') {
      lead +=
        ' штукатурка почти не изолирует шум сверху';
    } else if (room.plannedCeiling === 'other_exists') {
      lead +=
        ' эффект зависит от того, что между плитой и финишем';
    } else {
      lead += ' акустика потолка заметно влияет на то, как слышен шум сверху';
    }
    s1 = endsWithPeriod(lead);
  } else {
    s1 = 'По ответам об объекте картина пока общая, но потолок всё равно задаёт, насколько слышен шум сверху.';
  }

  // ——— Sentence 2: request (noise + wish) ———
  const requestBits: string[] = [];
  if (freq && kind) {
    requestBits.push(`${freq}: ${kind}`);
  } else if (freq) {
    requestBits.push(freq);
  } else if (kind) {
    requestBits.push(kind);
  }
  if (wish) requestBits.push(wish);

  const hasRequest = requestBits.length > 0;
  let s2: string | null = null;
  if (hasRequest) {
    const body =
      requestBits.length === 1
        ? requestBits[0]!
        : requestBits.length === 2
          ? `${requestBits[0]}, и ${requestBits[1]}`
          : `${requestBits.slice(0, -1).join(', ')}, и ${requestBits[requestBits.length - 1]!}`;
    const timing =
      room.objectStage === 'newbuild' || room.objectStage === 'renovation'
        ? 'MultiFrame лучше заложить до финишного потолка'
        : room.objectStage === 'occupied'
          ? 'MultiFrame можно поставить при замене или доработке потолка'
          : 'потолок с MultiFrame здесь уместен';
    s2 = endsWithPeriod(capitalize(`${body} — ${timing}`));
  }

  // ——— Sentence 3: effect ———
  const impactHeavy =
    noiseType === 'impact' ||
    noiseType === 'mixed' ||
    room.noiseKind === 'impact' ||
    room.noiseKind === 'mixed';
  const airHeavy =
    noiseType === 'airborne' ||
    room.noiseKind === 'airborne' ||
    room.roomWish === 'privacy_out' ||
    room.roomWish === 'music_recording';

  let effect: string;
  if (room.roomWish === 'music_recording') {
    effect =
      'Панель снимает эхо в самой комнате и одновременно смягчает фон сверху';
  } else if (room.roomWish === 'privacy_out') {
    effect =
      'Потолок с MultiFrame глушит голоса и музыку, которые уходят вверх через плиту';
  } else if (impactHeavy && airHeavy) {
    effect =
      'Удар смягчится заметно, голоса и музыка сверху тоже станут мягче';
  } else if (impactHeavy) {
    effect = 'Топот и шаги сверху станут заметно мягче';
  } else if (airHeavy) {
    effect = 'Голоса и музыка сверху станут заметно мягче';
  } else if (room.noisyNeighbors === 'usually_quiet') {
    effect =
      'Даже если сейчас сверху тихо, MultiFrame поднимает запас комфорта и страхует от будущих соседей';
  } else {
    effect = 'С MultiFrame сверху станет тише, а в комнате спокойнее';
  }

  if (impactHeavy) {
    effect +=
      '; полную норму по удару часто добивает ещё пол у соседа сверху';
  } else if (drum) {
    effect += '; панели как раз убирают «барабан» под натяжным';
  }

  const s3 = endsWithPeriod(effect);

  // Assemble 2 or 3 sentences
  if (s2) {
    return `${s1} ${s2} ${s3}`;
  }
  // Fold timing into effect when no explicit noise/wish request
  const timingOnly =
    room.objectStage === 'newbuild'
      ? 'Лучший момент заложить MultiFrame — до финишного потолка. '
      : room.objectStage === 'renovation'
        ? 'Пока идёт ремонт, MultiFrame удобно поставить до финиша. '
        : '';
  return `${s1} ${timingOnly}${s3}`.replace(/\s+/g, ' ').trim();
}

/** @deprecated Prefer caseVerdict — kept for any leftover call sites. */
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
