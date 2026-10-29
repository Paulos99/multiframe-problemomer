import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FELT_STEPS,
  IMPACT_HIGH_NOTE,
  IMPACT_SCALE_STEPS,
  NORM_ROWS,
  airFeltAfterMultiFrame,
  airFeltFromIndex,
  comfortClassAfterMultiFrame,
  comfortClassFor,
  comfortTransitionLabel,
  comfortTransitionRank,
  deriveSimulation,
  impactFeltAfterMultiFrame,
  impactFeltFromIndex,
  mergeComfortTransitions,
} from './simulation';
import { applyMultiFrame } from './acoustic/multiframe';
import { buildConstruction } from './acoustic/construction';
import {
  FLOOR_ABOVE_OPTIONS,
  HOUSE_TYPE_OPTIONS,
  NOISY_NEIGHBORS_OPTIONS,
  OBJECT_STAGE_OPTIONS,
  PLANNED_CEILING_OPTIONS,
  SLAB_THICKNESS_OPTIONS,
  SLAB_TYPE_OPTIONS,
  HYBRID_CLASS_LABELS,
  SCALE_LEVELS,
  SCALE_LEVEL_LABELS,
  type ClassLabel,
  type RoomAnswers,
  type SessionAnswers,
} from './types';

/** СП 51: А > Б > В > ниже В (уровень «Дискомфорт»). */
const RANK: Record<ClassLabel, number> = { below: 0, V: 1, B: 2, A: 3 };

function* allRooms(): Generator<RoomAnswers> {
  for (const slab of SLAB_TYPE_OPTIONS)
    for (const thick of SLAB_THICKNESS_OPTIONS)
      for (const floor of FLOOR_ABOVE_OPTIONS)
        for (const house of HOUSE_TYPE_OPTIONS)
          for (const ceiling of PLANNED_CEILING_OPTIONS)
            for (const neighbors of NOISY_NEIGHBORS_OPTIONS)
              for (const stage of OBJECT_STAGE_OPTIONS)
                yield {
                  roomType: 'living',
                  roomTypeCustom: '',
                  ceilingAreaM2: 18,
                  slabType: slab.id,
                  slabThickness: thick.id,
                  floorAbove: floor.id,
                  houseType: house.id,
                  objectStage: stage.id,
                  plannedCeiling: ceiling.id,
                  noisyNeighbors: neighbors.id,
                  noiseKind: 'mixed',
                  roomWishes: ['from_above', 'privacy_out', 'music_recording'],
                };
}

const answers = (room: RoomAnswers): SessionAnswers =>
  ({ interestFor: 'self', room, scope: 'ceiling' }) as SessionAnswers;

describe('MultiFrame never lowers the comfort class', () => {
  const failures: string[] = [];
  for (const room of allRooms()) {
    const sim = deriveSimulation(answers(room));
    const before = comfortClassFor(sim.before.Rw, sim.before.Lnw);
    const after = comfortClassFor(sim.after.Rw, sim.after.Lnw);
    const tag = `${room.slabType}/${room.slabThickness}/${room.floorAbove}/${room.houseType}/${room.plannedCeiling}`;
    if (RANK[after] < RANK[before]) failures.push(`class ${tag}: ${before}→${after}`);
    if (sim.after.Rw < sim.before.Rw) failures.push(`Rw ${tag}: ${sim.before.Rw}→${sim.after.Rw}`);
    if (sim.after.Lnw > sim.before.Lnw) failures.push(`Lnw ${tag}: ${sim.before.Lnw}→${sim.after.Lnw}`);
    if (sim.reverb.echoInRoomAfter > sim.reverb.echoInRoomBefore) failures.push(`echo ${tag}`);
  }

  it('for every problem-meter input: class, Rw, Lnw and echo never get worse', () => {
    assert.deepEqual(failures.slice(0, 10), []);
  });

  it('a slab already at class-A impact (Lnw 55) is not pushed to 56 by the soft floor', () => {
    const room = {
      ...allRooms().next().value!,
      slabType: 'monolith',
      slabThickness: 'over_250',
      floorAbove: 'floating',
      houseType: 'monolith',
    } as RoomAnswers;
    const constr = buildConstruction(room);
    const mf = applyMultiFrame(constr);
    assert.ok(mf.Lnw <= constr.Lnw);
    assert.ok(mf.deltaLnw <= 0);
  });
});

describe('analytics «→» pair order', () => {
  it('renders before on the left and after on the right, in three levels', () => {
    assert.equal(comfortTransitionLabel('below', 'V'), 'Дискомфорт → Комфорт');
    assert.equal(comfortTransitionLabel('V', 'B'), 'Комфорт → Комфорт');
    assert.equal(comfortTransitionLabel('B', 'A'), 'Комфорт → Высокий комфорт');
    assert.equal(comfortTransitionLabel('below', 'A'), 'Дискомфорт → Высокий комфорт');
  });

  it('merges the old four classes into three levels', () => {
    const merged = mergeComfortTransitions([
      { key: 'below→V', count: 4 },
      { key: 'V→B', count: 2 },
      { key: 'B→B', count: 1 },
      { key: 'V→V', count: 3 },
      { key: 'B→A', count: 5 },
    ]);
    assert.deepEqual(Object.fromEntries(merged.map((m) => [m.key, m.count])), {
      'discomfort→comfort': 4,
      'comfort→comfort': 6,
      'comfort→high': 5,
    });
    assert.equal(comfortTransitionLabel('comfort', 'high'), 'Комфорт → Высокий комфорт');
    assert.ok(comfortTransitionRank('comfort→comfort') < comfortTransitionRank('discomfort→high'));
  });
});

describe('шкала Проблемомера: ровно три уровня', () => {
  it('имеет три названия и никаких «допустимо / ниже допустимого»', () => {
    assert.deepEqual(SCALE_LEVELS, ['discomfort', 'comfort', 'high']);
    assert.deepEqual(FELT_STEPS, SCALE_LEVELS);
    const names = [
      ...Object.values(SCALE_LEVEL_LABELS),
      ...Object.values(HYBRID_CLASS_LABELS),
      ...NORM_ROWS.map((r) => `${r.label} ${r.sp}`),
    ].join(' | ');
    assert.deepEqual(Object.values(SCALE_LEVEL_LABELS), ['Дискомфорт', 'Комфорт', 'Высокий комфорт']);
    assert.doesNotMatch(names, /допустим|сильный дискомфорт|важно для вас|до 17 дБ/i);
    assert.equal(new Set(NORM_ROWS.map((r) => r.label)).size, 3);
  });

  it('воздух: Rw от порогов СП (54 и 50 дБ)', () => {
    assert.equal(airFeltFromIndex(54), 'high');
    assert.equal(airFeltFromIndex(53), 'comfort');
    assert.equal(airFeltFromIndex(50), 'comfort');
    assert.equal(airFeltFromIndex(49), 'discomfort');
  });

  it('удар: три точки шкалы, но расчёт выше «Комфорта» не поднимает; пояснение к «Высокому комфорту»', () => {
    assert.equal(impactFeltFromIndex(40), 'comfort'); // «Высокий комфорт» по удару — только с полом у соседей сверху
    assert.equal(impactFeltFromIndex(60), 'comfort');
    assert.equal(impactFeltFromIndex(61), 'discomfort');
    assert.deepEqual(IMPACT_SCALE_STEPS, ['discomfort', 'comfort', 'high']);
    assert.equal(IMPACT_HIGH_NOTE, 'достижим только со звукоизоляцией пола у соседей сверху');
    assert.equal(NORM_ROWS[0].label, 'Высокий комфорт');
    assert.equal(NORM_ROWS[0].lnwNote, IMPACT_HIGH_NOTE);
    assert.equal(NORM_ROWS[1].lnwNote, undefined);
  });

  it('с MultiFrame итог по комнате не выше «Комфорта»: класс А требует высокого комфорта по удару', () => {
    assert.equal(comfortClassAfterMultiFrame(60, 50), 'B');
    assert.equal(comfortClassAfterMultiFrame(54, 55), 'B');
    assert.equal(comfortClassAfterMultiFrame(41, 75), 'V');
    for (const room of allRooms()) {
      const sim = deriveSimulation(answers(room));
      assert.notEqual(comfortClassAfterMultiFrame(sim.after.Rw, sim.after.Lnw), 'A');
      assert.notEqual(impactFeltAfterMultiFrame(sim.after.Lnw), 'high');
    }
  });

  it('классы СП сводятся к уровням: А → высокий, Б и В → комфорт, ниже В → дискомфорт', () => {
    assert.equal(HYBRID_CLASS_LABELS.A, 'Высокий комфорт');
    assert.equal(HYBRID_CLASS_LABELS.B, 'Комфорт');
    assert.equal(HYBRID_CLASS_LABELS.V, 'Комфорт');
    assert.equal(HYBRID_CLASS_LABELS.below, 'Дискомфорт');
  });

  it('«с MultiFrame» никогда не «Дискомфорт», «сейчас» — может быть', () => {
    assert.equal(airFeltAfterMultiFrame(41), 'comfort');
    assert.equal(impactFeltAfterMultiFrame(75), 'comfort');
    assert.equal(comfortClassAfterMultiFrame(41, 75), 'V');
    assert.equal(airFeltFromIndex(41), 'discomfort');
    let afterDiscomfort = 0;
    let impactAfterHigh = 0;
    for (const room of allRooms()) {
      const sim = deriveSimulation(answers(room));
      if (airFeltAfterMultiFrame(sim.after.Rw) === 'discomfort') afterDiscomfort++;
      if (impactFeltAfterMultiFrame(sim.after.Lnw) === 'discomfort') afterDiscomfort++;
      if (comfortClassAfterMultiFrame(sim.after.Rw, sim.after.Lnw) === 'below') afterDiscomfort++;
      if (impactFeltAfterMultiFrame(sim.after.Lnw) === ('high' as string)) impactAfterHigh++;
    }
    assert.equal(afterDiscomfort, 0);
    assert.equal(impactAfterHigh, 0);
  });
});
