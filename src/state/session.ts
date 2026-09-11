import type { AudioPair, AudioState, CtaPayload, SessionState, WizardStep } from './types';
import { WIZARD_STEPS } from './types';
import { deriveProfile } from './derive';
import { DEMO_AUDIO_PAIRS } from '../audio/demoAudio';

export function createInitialSession(): SessionState {
  const audio: AudioState = {
    mode: 'demo_stub',
    pairs: DEMO_AUDIO_PAIRS,
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
  return {
    ...session,
    derived,
    cta: buildCta(session),
    audio: session.audio.pairs.length
      ? session.audio
      : { mode: 'demo_stub', pairs: DEMO_AUDIO_PAIRS as AudioPair[] },
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
