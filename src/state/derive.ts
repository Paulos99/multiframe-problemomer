import type {
  ComfortLevel,
  DerivedProfile,
  NoiseType,
  RoomWishOption,
  SessionAnswers,
} from './types';
import { deriveSimulation } from './simulation';
import { buildRecommendations, personalStory } from './recommendations';
import { noiseKindToType, wishNoiseType, wishScenarioLine } from './wish';

function whyFor(
  noiseType: NoiseType,
  comfort: ComfortLevel,
  wish: RoomWishOption,
  answers: SessionAnswers,
): string[] {
  const why: string[] = [];
  if (wish !== 'other') why.push(wishScenarioLine(wish));

  const story = personalStory(answers.room, noiseType);
  for (const p of story) {
    if (!why.includes(p)) why.push(p);
  }

  const recs = buildRecommendations(answers.room, noiseType);
  for (const r of recs) {
    if (!why.includes(r)) why.push(r);
  }

  if (noiseType === 'impact' || noiseType === 'mixed') {
    const line =
      'Шаги сверху идут через плиту. MultiFrame на потолке смягчает этот удар.';
    if (!why.includes(line)) why.push(line);
  }
  if (noiseType === 'airborne' || noiseType === 'mixed') {
    const line =
      'Голоса и музыка тоже проходят через плиту. Потолок с MultiFrame делает этот фон мягче.';
    if (!why.includes(line)) why.push(line);
  }
  if (comfort === 'bothers') {
    const line = 'Если шум уже мешает, лучше заложить акустику до монтажа потолка.';
    if (!why.includes(line)) why.push(line);
  } else {
    const line =
      'С MultiFrame сверху становится тише. Каркас не нужен, потолок почти не опускается.';
    if (!why.includes(line)) why.push(line);
  }
  return why.slice(0, 6);
}

function inferNoiseType(answers: SessionAnswers): NoiseType {
  const fromKind = noiseKindToType(answers.room.noiseKind);
  if (fromKind) return fromKind;

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
    whyMultiFrame: whyFor(noiseType, comfortLevel, answers.room.roomWish, answers),
    disclaimer: 'expert_not_engineering',
    simulation,
  };
}
