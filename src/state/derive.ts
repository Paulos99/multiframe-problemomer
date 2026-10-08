import type {
  ComfortLevel,
  DerivedProfile,
  NoiseType,
  RoomWishOption,
  SessionAnswers,
} from './types';
import { deriveSimulation } from './simulation';
import { wishNoiseType, wishScenarioLine } from './wish';

function whyFor(
  noiseType: NoiseType,
  comfort: ComfortLevel,
  wish: RoomWishOption,
): string[] {
  const why: string[] = [];
  if (wish !== 'other') why.push(wishScenarioLine(wish));
  if (noiseType === 'impact' || noiseType === 'mixed') {
    why.push(
      'Шаги сверху идут через плиту. MultiFrame на потолке смягчает этот удар.',
    );
  }
  if (noiseType === 'airborne' || noiseType === 'mixed') {
    why.push(
      'Голоса и музыка тоже проходят через плиту. Потолок с MultiFrame делает этот фон мягче.',
    );
  }
  if (comfort === 'bothers') {
    why.push('Если шум уже мешает, лучше заложить акустику до монтажа потолка.');
  } else {
    why.push('С MultiFrame сверху становится тише. Каркас не нужен, потолок почти не опускается.');
  }
  return why.slice(0, 4);
}

function inferNoiseType(answers: SessionAnswers): NoiseType {
  const n = answers.room.noisyNeighbors;
  let fallback: NoiseType = 'mixed';
  if (n === 'often_noisy' || n === 'sometimes_noisy') fallback = 'mixed';
  else if (n === 'usually_quiet') fallback = 'airborne';
  return wishNoiseType(answers.room.roomWish, fallback);
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
