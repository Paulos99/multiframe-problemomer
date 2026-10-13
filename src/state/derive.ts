import type { DerivedProfile, NoiseType, SessionAnswers } from './types';
import { deriveSimulation } from './simulation';
import { caseVerdict } from './recommendations';
import { noiseKindToType, wishNoiseType } from './wish';

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
  const verdict = caseVerdict(answers.room, noiseType);
  return {
    comfortLevel,
    noiseType,
    whyMultiFrame: [verdict],
    disclaimer: 'expert_not_engineering',
    simulation,
  };
}
