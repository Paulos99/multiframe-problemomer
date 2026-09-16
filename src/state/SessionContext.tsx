import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  HouseTypeOption,
  NoisyNeighborsOption,
  ObjectStageOption,
  PlannedCeilingOption,
  RoomAnswers,
  RoomType,
  RoomWishOption,
  SessionState,
  SlabThicknessOption,
  SlabTypeOption,
  WizardStep,
} from './types';
import { ROOM_SUBSTEPS } from './types';
import {
  canProceed,
  createInitialSession,
  nextRoomSubstep,
  nextStep,
  prevRoomSubstep,
  prevStep,
  withDerived,
} from './session';

interface SessionApi {
  session: SessionState;
  goNext: () => void;
  goBack: () => void;
  goTo: (step: WizardStep) => void;
  restart: () => void;
  setRoomType: (roomType: RoomType) => void;
  setCeilingArea: (area: number | null) => void;
  patchRoom: (patch: Partial<RoomAnswers>) => void;
  setSlabType: (v: SlabTypeOption) => void;
  setSlabThickness: (v: SlabThicknessOption) => void;
  setHouseType: (v: HouseTypeOption) => void;
  setObjectStage: (v: ObjectStageOption) => void;
  setPlannedCeiling: (v: PlannedCeilingOption) => void;
  setNoisyNeighbors: (v: NoisyNeighborsOption) => void;
  setRoomWish: (v: RoomWishOption) => void;
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

      if (prev.step === 'room') {
        const nextSub = nextRoomSubstep(prev.roomSubstep);
        if (nextSub) {
          return { ...prev, roomSubstep: nextSub };
        }
        return withDerived({ ...prev, step: 'result' });
      }

      const n = nextStep(prev.step);
      if (!n) return prev;
      let next = { ...prev, step: n };
      if (n === 'room') {
        next = { ...next, roomSubstep: ROOM_SUBSTEPS[0]! };
      }
      if (n === 'result') {
        next = withDerived(next);
      }
      return next;
    });
  }, []);

  const goBack = useCallback(() => {
    setSession((prev) => {
      if (prev.step === 'room') {
        const prevSub = prevRoomSubstep(prev.roomSubstep);
        if (prevSub) {
          return { ...prev, roomSubstep: prevSub };
        }
        return { ...prev, step: 'start', roomSubstep: ROOM_SUBSTEPS[0]! };
      }

      const p = prevStep(prev.step);
      if (!p) return prev;
      if (p === 'room') {
        return {
          ...prev,
          step: 'room',
          roomSubstep: ROOM_SUBSTEPS[ROOM_SUBSTEPS.length - 1]!,
        };
      }
      return { ...prev, step: p };
    });
  }, []);

  const goTo = useCallback((step: WizardStep) => {
    setSession((prev) => ({
      ...prev,
      step,
      roomSubstep:
        step === 'room' ? prev.roomSubstep : ROOM_SUBSTEPS[0]!,
    }));
  }, []);

  const restart = useCallback(() => {
    setSession(createInitialSession());
  }, []);

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
  const setRoomWish = useCallback(
    (roomWish: RoomWishOption) => patchRoom({ roomWish }),
    [patchRoom],
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
      patchRoom,
      setSlabType,
      setSlabThickness,
      setHouseType,
      setObjectStage,
      setPlannedCeiling,
      setNoisyNeighbors,
      setRoomWish,
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
      patchRoom,
      setSlabType,
      setSlabThickness,
      setHouseType,
      setObjectStage,
      setPlannedCeiling,
      setNoisyNeighbors,
      setRoomWish,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionApi {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
