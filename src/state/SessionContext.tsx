import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ComfortLevel,
  FloorSlab,
  NoiseScenario,
  NoiseType,
  RoomType,
  SessionState,
  WizardStep,
} from './types';
import {
  canProceed,
  createInitialSession,
  nextStep,
  prevStep,
  withDerived,
} from './session';
import { buildPlainWhy } from './derive';

interface SessionApi {
  session: SessionState;
  goNext: () => void;
  goBack: () => void;
  goTo: (step: WizardStep) => void;
  restart: () => void;
  setRoomType: (roomType: RoomType) => void;
  setCeilingArea: (area: number | null) => void;
  setFloorSlab: (slab: FloorSlab | undefined) => void;
  toggleScenario: (s: NoiseScenario) => void;
  setCurrentState: (comfort: ComfortLevel, noiseType: NoiseType) => void;
  canGoNext: boolean;
}

const SessionContext = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(createInitialSession);

  const patch = useCallback((fn: (s: SessionState) => SessionState) => {
    setSession((prev) => fn(prev));
  }, []);

  const goNext = useCallback(() => {
    setSession((prev) => {
      if (!canProceed(prev)) return prev;
      const n = nextStep(prev.step);
      if (!n) return prev;
      let next = { ...prev, step: n };
      if (n === 'beforeAfter' || n === 'audio' || n === 'result') {
        next = withDerived(next);
      }
      return next;
    });
  }, []);

  const goBack = useCallback(() => {
    setSession((prev) => {
      const p = prevStep(prev.step);
      if (!p) return prev;
      return { ...prev, step: p };
    });
  }, []);

  const goTo = useCallback((step: WizardStep) => {
    setSession((prev) => ({ ...prev, step }));
  }, []);

  const restart = useCallback(() => {
    setSession(createInitialSession());
  }, []);

  const setRoomType = useCallback(
    (roomType: RoomType) => {
      patch((s) => ({
        ...s,
        answers: { ...s.answers, room: { ...s.answers.room, roomType } },
      }));
    },
    [patch],
  );

  const setCeilingArea = useCallback(
    (ceilingAreaM2: number | null) => {
      patch((s) => ({
        ...s,
        answers: { ...s.answers, room: { ...s.answers.room, ceilingAreaM2 } },
      }));
    },
    [patch],
  );

  const setFloorSlab = useCallback(
    (floorSlab: FloorSlab | undefined) => {
      patch((s) => ({
        ...s,
        answers: { ...s.answers, room: { ...s.answers.room, floorSlab } },
      }));
    },
    [patch],
  );

  const toggleScenario = useCallback(
    (scenario: NoiseScenario) => {
      patch((s) => {
        const has = s.answers.scenarios.includes(scenario);
        const scenarios = has
          ? s.answers.scenarios.filter((x) => x !== scenario)
          : [...s.answers.scenarios, scenario];
        return { ...s, answers: { ...s.answers, scenarios } };
      });
    },
    [patch],
  );

  const setCurrentState = useCallback(
    (comfortLevel: ComfortLevel, noiseType: NoiseType) => {
      patch((s) => ({
        ...s,
        answers: {
          ...s.answers,
          current: {
            comfortLevel,
            noiseType,
            whyPlain: buildPlainWhy(comfortLevel, noiseType, s.answers.scenarios),
          },
        },
      }));
    },
    [patch],
  );

  const value = useMemo<SessionApi>(
    () => ({
      session,
      goNext,
      goBack,
      goTo,
      restart,
      setRoomType,
      setCeilingArea,
      setFloorSlab,
      toggleScenario,
      setCurrentState,
      canGoNext: canProceed(session),
    }),
    [
      session,
      goNext,
      goBack,
      goTo,
      restart,
      setRoomType,
      setCeilingArea,
      setFloorSlab,
      toggleScenario,
      setCurrentState,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionApi {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
