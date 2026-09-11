import type {
  ComfortLevel,
  DerivedProfile,
  NoiseScenario,
  NoiseType,
  SessionAnswers,
} from './types';

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

function whyFor(noiseType: NoiseType, scenarios: NoiseScenario[], comfort: ComfortLevel): string[] {
  const why: string[] = [];

  if (noiseType === 'impact' || noiseType === 'mixed') {
    why.push(
      'Ударный шум сверху идёт через плиту перекрытия — бескаркасная система MultiFrame работает именно на потолке, без каркаса.',
    );
  }
  if (noiseType === 'airborne' || noiseType === 'mixed') {
    why.push(
      'Воздушный шум (голоса, ТВ, музыка) тоже проходит через перекрытие; акустический комфорт потолка помогает смягчить «соседский фон».',
    );
  }
  if (scenarios.includes('steps') || scenarios.includes('drop')) {
    why.push('Шаги и падения — самые частые жалобы при выборе натяжного потолка без акустической подготовки.');
  }
  if (comfort === 'bothers') {
    why.push('Если шум уже мешает жить, имеет смысл заложить акустику до монтажа потолка — потом дороже и сложнее.');
  } else if (comfort === 'quiet') {
    why.push('Даже при умеренном фоне акустика потолка — страховка комфорта на годы, особенно в спальне и детской.');
  } else {
    why.push('MultiFrame добавляет ощущение «тише сверху» к обычному натяжному потолку — без потери высоты на каркас.');
  }

  return why.slice(0, 4);
}

/** Client-side expert qualitative model — no fake ΔRw / ΔLnw */
export function deriveProfile(answers: SessionAnswers): DerivedProfile {
  const comfort =
    answers.current?.comfortLevel ??
    (answers.scenarios.length >= 4
      ? 'bothers'
      : answers.scenarios.length >= 2
        ? 'ok'
        : 'quiet');

  const noiseType = answers.current?.noiseType ?? classifyNoise(answers.scenarios);

  return {
    comfortLevel: comfort,
    noiseType,
    whyMultiFrame: whyFor(noiseType, answers.scenarios, comfort),
    disclaimer: 'expert_not_engineering',
  };
}

export function buildPlainWhy(
  comfort: ComfortLevel,
  noiseType: NoiseType,
  scenarios: NoiseScenario[],
): string {
  const scenHint =
    scenarios.length === 0
      ? 'шум сверху'
      : scenarios.length === 1
        ? 'этот сценарий'
        : 'эти сценарии';

  if (comfort === 'bothers') {
    return `Вам мешает ${scenHint}. По типу это ${
      noiseType === 'impact' ? 'ударный' : noiseType === 'airborne' ? 'воздушный' : 'смешанный'
    } шум через перекрытие — типичная задача для бескаркасной акустики потолка.`;
  }
  if (comfort === 'ok') {
    return `Шум заметный, но терпимый. Часто именно на этапе выбора потолка решают: оставить «как у всех» или заложить акустический комфорт.`;
  }
  return `Сейчас относительно тихо. Проблемомер помогает понять, стоит ли всё же усилить потолок MultiFrame — как запас комфорта.`;
}
