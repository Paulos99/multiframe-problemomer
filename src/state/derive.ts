import type {
  ComfortLevel,
  DerivedProfile,
  NoiseType,
  RoomWishOption,
  SessionAnswers,
} from './types';
import { deriveSimulation } from './simulation';

function wishLine(wish: RoomWishOption): string | null {
  switch (wish) {
    case 'music':
      return 'Для музыки в этой комнате важнее, насколько мягче станут голоса и бас сверху.';
    case 'tv':
      return 'Для телевизора важнее воздушный шум: речь и звук сверху должны меньше пробиваться.';
    case 'child_sleep':
      return 'Для сна ребёнка важны и шаги, и голоса — оба канала в этой комнате.';
    default:
      return null;
  }
}

function whyFor(
  noiseType: NoiseType,
  comfort: ComfortLevel,
  wish: RoomWishOption,
): string[] {
  const why: string[] = [];
  const fromWish = wishLine(wish);
  if (fromWish) why.push(fromWish);
  if (noiseType === 'impact' || noiseType === 'mixed') {
    why.push(
      'Ударный шум сверху идёт через плиту — бескаркасная MultiFrame работает на потолке, без каркаса.',
    );
  }
  if (noiseType === 'airborne' || noiseType === 'mixed') {
    why.push(
      'Воздушный шум тоже проходит через перекрытие; акустика потолка смягчает «соседский фон».',
    );
  }
  if (comfort === 'bothers') {
    why.push('Если шум уже мешает, акустику лучше заложить до монтажа потолка.');
  } else {
    why.push('MultiFrame добавляет ощущение «тише сверху» без потери высоты на каркас.');
  }
  return why.slice(0, 4);
}

function inferNoiseType(answers: SessionAnswers): NoiseType {
  const wish = answers.room.roomWish;
  if (wish === 'music' || wish === 'tv') return 'airborne';
  if (wish === 'child_sleep') return 'mixed';
  const n = answers.room.noisyNeighbors;
  if (n === 'often_noisy' || n === 'sometimes_noisy') return 'mixed';
  if (n === 'usually_quiet') return 'airborne';
  return 'mixed';
}

export function deriveProfile(answers: SessionAnswers): DerivedProfile {
  const simulation = deriveSimulation(answers);
  const comfortLevel = simulation.feelingBefore;
  const noiseType = inferNoiseType(answers);
  return {
    comfortLevel,
    noiseType,
    whyMultiFrame: whyFor(noiseType, comfortLevel, answers.room.roomWish),
    disclaimer: 'expert_not_engineering',
    simulation,
  };
}
