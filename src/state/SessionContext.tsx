import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  FloorAboveOption,
  HouseTypeOption,
  InterestFor,
  NoisyNeighborsOption,
  ObjectStageOption,
  PlannedCeilingOption,
  RoomAnswers,
  RoomType,
  SessionState,
  SlabThicknessOption,
  SlabTypeOption,
  WizardStep,
} from './types';
import {
  canProceed,
  createInitialSession,
  nextStep,
  prevStep,
  withDerived,
} from './session';

interface SessionApi {
  session: SessionState;
  goNext: () => void;
  goBack: () => void;
  goTo: (step: WizardStep) => void;
  restart: () => void;
  setInterestFor: (v: InterestFor) => void;
  setRoomType: (roomType: RoomType) => void;
  setCeilingArea: (area: number | null) => void;
  patchRoom: (patch: Partial<RoomAnswers>) => void;
  setSlabType: (v: SlabTypeOption) => void;
  setSlabThickness: (v: SlabThicknessOption) => void;
  setFloorAbove: (v: FloorAboveOption) => void;
  setHouseType: (v: HouseTypeOption) => void;
  setObjectStage: (v: ObjectStageOption) => void;
  setPlannedCeiling: (v: PlannedCeilingOption) => void;
  setNoisyNeighbors: (v: NoisyNeighborsOption) => void;
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
      if (n === 'result') {
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

  const setInterestFor = useCallback(
    (interestFor: InterestFor) => {
      patch((s) => ({
        ...s,
        answers: { ...s.answers, interestFor },
      }));
    },
    [patch],
  );

  const patchRoom = useCallback(
    (roomPatch: Partial<RoomAnswers>) => {
      patch((s) => ({
        ...s,
        answers: {
          ...s.answers,
          room: { ...s.answers.room, ...roomPatch },
        },
      }));
    },
    [patch],
  );

  const setRoomType = useCallback(
    (roomType: RoomType) => patchRoom({ roomType }),
    [patchRoom],
  );

  const setCeilingArea = useCallback(
    (ceilingAreaM2: number | null) => patchRoom({ ceilingAreaM2 }),
    [patchRoom],
  );

  const setSlabType = useCallback(
    (slabType: SlabTypeOption) => patchRoom({ slabType }),
    [patchRoom],
  );
  const setSlabThickness = useCallback(
    (slabThickness: SlabThicknessOption) => patchRoom({ slabThickness }),
    [patchRoom],
  );
  const setFloorAbove = useCallback(
    (floorAbove: FloorAboveOption) => patchRoom({ floorAbove }),
    [patchRoom],
  );
  const setHouseType = useCallback(
    (houseType: HouseTypeOption) => patchRoom({ houseType }),
    [patchRoom],
  );
  const setObjectStage = useCallback(
    (objectStage: ObjectStageOption) => patchRoom({ objectStage }),
    [patchRoom],
  );
  const setPlannedCeiling = useCallback(
    (plannedCeiling: PlannedCeilingOption) => patchRoom({ plannedCeiling }),
    [patchRoom],
  );
  const setNoisyNeighbors = useCallback(
    (noisyNeighbors: NoisyNeighborsOption) => patchRoom({ noisyNeighbors }),
    [patchRoom],
  );

  const value = useMemo<SessionApi>(
    () => ({
      session,
      goNext,
      goBack,
      goTo,
      restart,
      setInterestFor,
      setRoomType,
      setCeilingArea,
      patchRoom,
      setSlabType,
      setSlabThickness,
      setFloorAbove,
      setHouseType,
      setObjectStage,
      setPlannedCeiling,
      setNoisyNeighbors,
      canGoNext: canProceed(session),
    }),
    [
      session,
      goNext,
      goBack,
      goTo,
      restart,
      setInterestFor,
      setRoomType,
      setCeilingArea,
      patchRoom,
      setSlabType,
      setSlabThickness,
      setFloorAbove,
      setHouseType,
      setObjectStage,
      setPlannedCeiling,
      setNoisyNeighbors,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionApi {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
