import type {
  ComfortLevel,
  DerivedProfile,
  NoiseScenario,
  NoiseType,
  SessionAnswers,
} from './types';
import { buildSimulation } from './simulation';

const IMPACT: NoiseScenario[] = ['steps', 'drop', 'furniture', 'repair'];
const AIRBORNE: NoiseScenario[] = ['talk', 'tv', 'music'];

function classifyNoise(scenarios: NoiseScenario[]): NoiseType {
  const hasImpact = scenarios.some((s) => IMPACT.includes(s));
  const hasAirborne = scenarios.some((s) => AIRBORNE.includes(s));
  if (hasImpact && hasAirborne) return 'mixed';
  if (hasImpact) return 'impact';
  if (hasAirborne) return 'airborne';
  return 'mixed';
}

function whyFor(
  noiseType: NoiseType,
  scenarios: NoiseScenario[],
  comfort: ComfortLevel,
): string[] {
  const why: string[] = [];
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
  if (scenarios.includes('steps') || scenarios.includes('drop')) {
    why.push('Шаги и падения — самые частые жалобы без акустической подготовки потолка.');
  }
  if (comfort === 'bothers') {
    why.push('Если шум уже мешает, акустику лучше заложить до монтажа потолка.');
  } else if (comfort === 'quiet') {
    why.push('Даже при умеренном фоне акустика потолка — запас комфорта на годы.');
  } else {
    why.push('MultiFrame добавляет ощущение «тише сверху» без потери высоты на каркас.');
  }
  return why.slice(0, 4);
}

export function deriveProfile(answers: SessionAnswers): DerivedProfile {
  const comfortLevel =
    answers.current?.comfortLevel ??
    (answers.scenarios.length >= 4
      ? 'bothers'
      : answers.scenarios.length >= 2
        ? 'ok'
        : 'quiet');
  const noiseType = answers.current?.noiseType ?? classifyNoise(answers.scenarios);
  return {
    comfortLevel,
    noiseType,
    whyMultiFrame: whyFor(noiseType, answers.scenarios, comfortLevel),
    disclaimer: 'expert_not_engineering',
    simulation: buildSimulation(answers),
  };
}

export function buildPlainWhy(
  comfort: ComfortLevel,
  noiseType: NoiseType,
  scenarios: NoiseScenario[],
): string {
  const hint =
    scenarios.length === 0
      ? 'шум сверху'
      : scenarios.length === 1
        ? 'этот сценарий'
        : 'эти сценарии';
  if (comfort === 'bothers') {
    return `Вам мешает ${hint}. По типу это ${
      noiseType === 'impact' ? 'ударный' : noiseType === 'airborne' ? 'воздушный' : 'смешанный'
    } шум через перекрытие — типичная задача для бескаркасной акустики потолка.`;
  }
  if (comfort === 'ok') {
    return 'Шум заметный, но терпимый. Часто на этапе выбора потолка решают: «как у всех» или с акустическим комфортом.';
  }
  return 'Сейчас относительно тихо. Проблемомер помогает понять, стоит ли усилить потолок MultiFrame — как запас комфорта.';
}
