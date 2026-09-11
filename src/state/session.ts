import type { AudioPair, AudioState, CtaPayload, SessionState, WizardStep } from './types';
import { WIZARD_STEPS, CALCULATOR_URL } from './types';
import { deriveProfile } from './derive';
import { DEMO_AUDIO_PAIRS, pairsForScenarios } from '../audio/demoAudio';

export function createInitialSession(): SessionState {
  const audio: AudioState = {
    mode: 'demo_stub',
    pairs: DEMO_AUDIO_PAIRS,
    demoSet: true,
  };

  return {
    schemaVersion: 1,
    step: 'start',
    answers: {
      room: {
        roomType: null,
        ceilingAreaM2: null,
      },
      scenarios: [],
      scope: 'ceiling',
    },
    derived: null,
    audio,
    cta: {
      roomType: null,
      ceilingAreaM2: null,
      scenarios: [],
    },
  };
}

export function buildCta(session: SessionState): CtaPayload {
  return {
    roomType: session.answers.room.roomType,
    ceilingAreaM2: session.answers.room.ceilingAreaM2,
    scenarios: [...session.answers.scenarios],
  };
}

export function withDerived(session: SessionState): SessionState {
  const derived = deriveProfile(session.answers);
  const { pairs, demoSet } = pairsForScenarios(session.answers.scenarios);
  return {
    ...session,
    derived,
    cta: buildCta(session),
    audio: {
      mode: 'demo_stub',
      pairs,
      demoSet,
    },
  };
}

export function stepIndex(step: WizardStep): number {
  return WIZARD_STEPS.indexOf(step);
}

export function nextStep(step: WizardStep): WizardStep | null {
  const i = stepIndex(step);
  if (i < 0 || i >= WIZARD_STEPS.length - 1) return null;
  return WIZARD_STEPS[i + 1]!;
}

export function prevStep(step: WizardStep): WizardStep | null {
  const i = stepIndex(step);
  if (i <= 0) return null;
  return WIZARD_STEPS[i - 1]!;
}

export function canProceed(session: SessionState): boolean {
  switch (session.step) {
    case 'start':
      return true;
    case 'room':
      return (
        session.answers.room.roomType != null &&
        session.answers.room.ceilingAreaM2 != null &&
        session.answers.room.ceilingAreaM2 > 0
      );
    case 'scenarios':
      return session.answers.scenarios.length > 0;
    case 'current':
      return session.answers.current != null;
    case 'beforeAfter':
    case 'audio':
    case 'result':
      return true;
    default:
      return false;
  }
}

/** Room step inline hint when Далее disabled */
export function roomNextHint(session: SessionState): string | null {
  if (session.step !== 'room') return null;
  if (session.answers.room.roomType == null) return 'выберите тип';
  if (
    session.answers.room.ceilingAreaM2 == null ||
    session.answers.room.ceilingAreaM2 <= 0
  ) {
    return 'укажите площадь';
  }
  return null;
}

/** Calculator CTA: area + roomType + scenarios (comma-separated enums). */
export function buildCalculatorUrl(cta: CtaPayload, base = CALCULATOR_URL): string {
  const url = new URL(base);
  if (cta.ceilingAreaM2 != null && cta.ceilingAreaM2 > 0) {
    url.searchParams.set('area', String(cta.ceilingAreaM2));
  }
  if (cta.roomType) url.searchParams.set('roomType', cta.roomType);
  if (cta.scenarios.length) {
    url.searchParams.set('scenarios', cta.scenarios.join(','));
  }
  return url.toString();
}

export function toSessionJson(session: SessionState): string {
  const full = withDerived(session);
  return JSON.stringify(
    {
      schemaVersion: full.schemaVersion,
      answers: full.answers,
      derived: full.derived,
      audio: full.audio,
      cta: full.cta,
    },
    null,
    2,
  );
}

export type { AudioPair };
