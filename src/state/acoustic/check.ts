/**
 * Golden anchors for the acoustic model (Trofimov + material shapes + MultiFrame caps).
 * Run: npx tsx src/state/acoustic/check.ts
 */
import { applyMultiFrame } from './multiframe';
import { buildConstruction, constructionFixture } from './construction';
import { SPECTRUM_HZ } from './bands';
import { deriveSimulation, NORMS } from '../simulation';
import type { RoomAnswers, SessionAnswers } from '../types';
import { buildRoomAudioShape, playbackGainForReceivedDb } from '../../audio/roomAudioShape';

function sampleRoom(over: Partial<RoomAnswers> = {}): RoomAnswers {
  return {
    roomType: 'living',
    ceilingAreaM2: 18,
    slabType: 'monolith',
    slabThickness: 'about_160_200',
    floorAbove: 'unknown',
    houseType: 'monolith',
    objectStage: 'newbuild',
    plannedCeiling: 'stretch_planned',
    noisyNeighbors: 'unknown',
    roomWish: 'unknown',
    ...over,
  };
}

function sampleAnswers(roomOver: Partial<RoomAnswers> = {}): SessionAnswers {
  return {
    interestFor: 'self',
    room: sampleRoom(roomOver),
    scope: 'ceiling',
  };
}

function band(values: number[], hz: number): number {
  const i = SPECTRUM_HZ.indexOf(hz as (typeof SPECTRUM_HZ)[number]);
  return values[i] ?? 0;
}

export function assertModelAnchors(): string[] {
  const errors: string[] = [];

  const solid180 = constructionFixture({
    kind: 'solid',
    thicknessMm: 180,
    floor: 'bare',
    drum: false,
  });
  if (solid180.Rw !== 54 || solid180.Lnw !== 76) {
    errors.push(`solid 180 bare expected Rw 54 / Lnw 76, got ${solid180.Rw}/${solid180.Lnw}`);
  }

  const pk220 = constructionFixture({
    kind: 'hollow',
    thicknessMm: 220,
    floor: 'bare',
    drum: false,
  });
  if (pk220.Rw !== 52 || pk220.Lnw !== 74) {
    errors.push(`ПК 220 bare expected Rw 52 / Lnw 74, got ${pk220.Rw}/${pk220.Lnw}`);
  }

  const floating = constructionFixture({
    kind: 'solid',
    thicknessMm: 180,
    floor: 'floating',
    drum: false,
  });
  if (floating.Lnw > 58) {
    errors.push(`floating floor should drop Lnw well below 76, got ${floating.Lnw}`);
  }
  if (floating.Lnw >= solid180.Lnw) {
    errors.push(`floating Lnw ${floating.Lnw} should be < bare ${solid180.Lnw}`);
  }

  const dIso100 =
    band(floating.impactIsolation, 100) - band(solid180.impactIsolation, 100);
  const dIso500 =
    band(floating.impactIsolation, 500) - band(solid180.impactIsolation, 500);
  if (dIso500 < dIso100 + 6) {
    errors.push(
      `floating floor should help 500 Hz more than 100 Hz (ΔI 500=${dIso500.toFixed(1)} vs 100=${dIso100.toFixed(1)})`,
    );
  }

  const mfBare = applyMultiFrame(solid180);
  if (mfBare.Lnw <= NORMS.A.Lnw) {
    errors.push(`MultiFrame on bare slab must not reach Lnw ≤ ${NORMS.A.Lnw}, got ${mfBare.Lnw}`);
  }
  if (mfBare.deltaRw < 6 || mfBare.deltaRw > 14) {
    errors.push(`MultiFrame ΔRw out of 6–14, got ${mfBare.deltaRw}`);
  }
  if (Math.abs(mfBare.deltaLnw) < 4 || Math.abs(mfBare.deltaLnw) > 9) {
    errors.push(`MultiFrame |ΔLnw| on bare slab should be 4–9, got ${mfBare.deltaLnw}`);
  }

  const mfFloat = applyMultiFrame(floating);
  if (Math.abs(mfFloat.deltaLnw) > 4) {
    errors.push(`floating floor should shrink MultiFrame |ΔLnw| to ≤4, got ${mfFloat.deltaLnw}`);
  }

  const thinner = constructionFixture({
    kind: 'solid',
    thicknessMm: 140,
    floor: 'bare',
    drum: false,
  });
  if (thinner.Rw >= solid180.Rw) {
    errors.push(`140 mm should be weaker airborne than 180 mm (${thinner.Rw} vs ${solid180.Rw})`);
  }

  const wood = constructionFixture({
    kind: 'wood',
    thicknessMm: 200,
    floor: 'bare',
    drum: false,
  });
  if (band(wood.R, 100) > band(solid180.R, 100) - 6) {
    errors.push(
      `wood should be much weaker at 100 Hz than solid 180 (${band(wood.R, 100)} vs ${band(solid180.R, 100)})`,
    );
  }

  if (band(pk220.R, 125) >= band(solid180.R, 125) - 0.5) {
    errors.push(
      `ПК should dip more at 125 Hz than solid 180 (${band(pk220.R, 125)} vs ${band(solid180.R, 125)})`,
    );
  }

  const panel = constructionFixture({
    kind: 'solid',
    thicknessMm: 180,
    floor: 'bare',
    drum: false,
    houseType: 'panel',
  });
  const brick = constructionFixture({
    kind: 'solid',
    thicknessMm: 180,
    floor: 'bare',
    drum: false,
    houseType: 'brick',
  });
  if (panel.Rw >= brick.Rw) {
    errors.push(`panel flanking should lower Rw vs brick (${panel.Rw} vs ${brick.Rw})`);
  }

  const quiet = buildConstruction(sampleRoom({ noisyNeighbors: 'usually_quiet' }));
  const loud = buildConstruction(sampleRoom({ noisyNeighbors: 'often_noisy' }));
  if (quiet.Rw !== loud.Rw || quiet.Lnw !== loud.Lnw) {
    errors.push(
      `neighbors must not change construction indices (quiet ${quiet.Rw}/${quiet.Lnw} vs loud ${loud.Rw}/${loud.Lnw})`,
    );
  }

  const simQuiet = deriveSimulation(sampleAnswers({ noisyNeighbors: 'usually_quiet' }));
  const simLoud = deriveSimulation(sampleAnswers({ noisyNeighbors: 'often_noisy' }));
  if (simQuiet.before.Rw !== simLoud.before.Rw || simQuiet.before.Lnw !== simLoud.before.Lnw) {
    errors.push('deriveSimulation: neighbors changed Rw/Lnw');
  }
  if (simLoud.receivedAirDb.before <= simQuiet.receivedAirDb.before) {
    errors.push(
      `loud neighbors should raise received air (${simLoud.receivedAirDb.before} vs ${simQuiet.receivedAirDb.before})`,
    );
  }
  if (
    !simLoud.receivedAirBands?.before?.length ||
    simLoud.receivedAirBands.before.length !== SPECTRUM_HZ.length
  ) {
    errors.push('receivedAirBands.before missing or wrong length');
  }

  const shapeQuiet = buildRoomAudioShape(simQuiet, 'air', 'talk');
  const shapeLoud = buildRoomAudioShape(simLoud, 'air', 'talk');
  if (shapeLoud.beforeGainDb <= shapeQuiet.beforeGainDb) {
    errors.push(
      `audio beforeGain should rise with loud neighbors (${shapeLoud.beforeGainDb} vs ${shapeQuiet.beforeGainDb})`,
    );
  }
  if (playbackGainForReceivedDb(simLoud.receivedAirDb.before) <= playbackGainForReceivedDb(simQuiet.receivedAirDb.before)) {
    errors.push('playbackGainForReceivedDb not monotonic with received dBA');
  }
  const meanDelta =
    shapeLoud.deltaEqDb.reduce((a, b) => a + b, 0) / Math.max(1, shapeLoud.deltaEqDb.length);
  if (meanDelta >= 0) {
    errors.push(`MultiFrame air ΔL EQ should cut on average (got ${meanDelta})`);
  }

  const simKitchen = deriveSimulation(
    sampleAnswers({
      roomType: 'kitchen',
      floorAbove: 'ordinary',
      objectStage: 'occupied',
    }),
  );
  const simBedroom = deriveSimulation(
    sampleAnswers({
      roomType: 'bedroom',
      floorAbove: 'ordinary',
      objectStage: 'occupied',
    }),
  );
  if (simKitchen.receivedAirDb.before <= simBedroom.receivedAirDb.before) {
    errors.push(
      `kitchen should be louder than bedroom (${simKitchen.receivedAirDb.before} vs ${simBedroom.receivedAirDb.before})`,
    );
  }

  const simEmpty = deriveSimulation(
    sampleAnswers({
      objectStage: 'newbuild',
      floorAbove: 'ordinary',
      roomType: 'living',
    }),
  );
  const simFurnished = deriveSimulation(
    sampleAnswers({
      objectStage: 'occupied',
      floorAbove: 'ordinary',
      roomType: 'living',
    }),
  );
  if (simEmpty.receivedAirDb.before <= simFurnished.receivedAirDb.before) {
    errors.push(
      `unfurnished newbuild should be louder than occupied (${simEmpty.receivedAirDb.before} vs ${simFurnished.receivedAirDb.before})`,
    );
  }

  const simSmall = deriveSimulation(sampleAnswers({ ceilingAreaM2: 12, floorAbove: 'ordinary' }));
  const simLarge = deriveSimulation(sampleAnswers({ ceilingAreaM2: 32, floorAbove: 'ordinary' }));
  if (Math.abs(simSmall.receivedAirDb.before - simLarge.receivedAirDb.before) < 0.3) {
    errors.push(
      `area should move received level (12 m² ${simSmall.receivedAirDb.before} vs 32 m² ${simLarge.receivedAirDb.before})`,
    );
  }

  const thickMf = applyMultiFrame(
    constructionFixture({ kind: 'solid', thicknessMm: 250, floor: 'bare', drum: false }),
  );
  const thinMf = applyMultiFrame(thinner);
  if (thinMf.deltaRw < thickMf.deltaRw) {
    errors.push(
      `thinner slab should get ≥ ΔRw than thick (${thinMf.deltaRw} vs ${thickMf.deltaRw})`,
    );
  }

  // Product in-situ «сейчас» must look like a complaint case, not a lab pass.
  const panelLive = buildConstruction(
    sampleRoom({
      houseType: 'panel',
      slabType: 'hollow',
      slabThickness: 'about_200_250',
      floorAbove: 'ordinary',
      objectStage: 'occupied',
    }),
  );
  if (panelLive.Rw >= 50) {
    errors.push(`panel in-situ before should be Rw < 50 (got ${panelLive.Rw})`);
  }
  const defaultLive = buildConstruction(
    sampleRoom({
      slabType: 'unknown',
      slabThickness: 'unknown',
      houseType: 'unknown',
      floorAbove: 'unknown',
      objectStage: 'occupied',
    }),
  );
  if (defaultLive.Rw >= 50) {
    errors.push(`default occupied unknown before should be Rw < 50 (got ${defaultLive.Rw})`);
  }

  return errors;
}

const errors = assertModelAnchors();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('acoustic anchors ok');
}
