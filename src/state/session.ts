import type {
  AudioState,
  CtaPayload,
  RoomSubstep,
  SessionState,
  WizardStep,
} from './types';
import { ROOM_SUBSTEPS, WIZARD_STEPS, CALCULATOR_URL } from './types';
import { deriveProfile } from './derive';
import { DEMO_AUDIO_PAIRS } from '../audio/demoAudio';

function defaultRoom() {
  return {
    roomType: null as SessionState['answers']['room']['roomType'],
    ceilingAreaM2: null as number | null,
    slabType: 'unknown' as const,
    slabThickness: 'unknown' as const,
    floorAbove: 'unknown' as const,
    houseType: 'unknown' as const,
    objectStage: 'unknown' as const,
    plannedCeiling: 'unknown' as const,
    noisyNeighbors: 'unknown' as const,
  };
}

export function createInitialSession(): SessionState {
  const audio: AudioState = {
    mode: 'demo_stub',
    pairs: DEMO_AUDIO_PAIRS,
    demoSet: true,
  };

  return {
    schemaVersion: 2,
    step: 'start',
    roomSubstep: ROOM_SUBSTEPS[0]!,
    answers: {
      interestFor: 'self',
      room: defaultRoom(),
      scope: 'ceiling',
    },
    derived: null,
    audio,
    cta: {
      roomType: null,
      ceilingAreaM2: null,
    },
  };
}

export function roomSubstepIndex(sub: RoomSubstep): number {
  return ROOM_SUBSTEPS.indexOf(sub);
}

export function nextRoomSubstep(sub: RoomSubstep): RoomSubstep | null {
  const i = roomSubstepIndex(sub);
  if (i < 0 || i >= ROOM_SUBSTEPS.length - 1) return null;
  return ROOM_SUBSTEPS[i + 1]!;
}

export function prevRoomSubstep(sub: RoomSubstep): RoomSubstep | null {
  const i = roomSubstepIndex(sub);
  if (i <= 0) return null;
  return ROOM_SUBSTEPS[i - 1]!;
}

export function isLastRoomSubstep(sub: RoomSubstep): boolean {
  return roomSubstepIndex(sub) === ROOM_SUBSTEPS.length - 1;
}

export function buildCta(session: SessionState): CtaPayload {
  return {
    roomType: session.answers.room.roomType,
    ceilingAreaM2: session.answers.room.ceilingAreaM2,
  };
}

export function withDerived(session: SessionState): SessionState {
  const derived = deriveProfile(session.answers);
  return {
    ...session,
    derived,
    cta: buildCta(session),
    audio: {
      mode: 'demo_stub',
      pairs: DEMO_AUDIO_PAIRS,
      demoSet: true,
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
    case 'result':
      return true;
    default:
      return false;
  }
}

export function roomNextHint(session: SessionState): string | null {
  if (session.step !== 'room') return null;
  if (session.roomSubstep !== 'basics') return null;
  if (session.answers.room.roomType == null) return 'выберите тип';
  if (
    session.answers.room.ceilingAreaM2 == null ||
    session.answers.room.ceilingAreaM2 <= 0
  ) {
    return 'укажите площадь';
  }
  return null;
}

export function buildCalculatorUrl(cta: CtaPayload, base = CALCULATOR_URL): string {
  const url = new URL(base);
  if (cta.ceilingAreaM2 != null && cta.ceilingAreaM2 > 0) {
    url.searchParams.set('area', String(cta.ceilingAreaM2));
  }
  if (cta.roomType) url.searchParams.set('roomType', cta.roomType);
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
