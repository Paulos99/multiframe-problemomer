import type { NoiseType, PlannedCeilingOption, RoomWishOption } from './types';

export type WishAudioGroup = 'air' | 'impact' | 'mixed';

/** Airborne always above impact. Mixed sits with the job (recording/privacy). */
export function wishAudioOrder(wish: RoomWishOption): WishAudioGroup[] {
  switch (wish) {
    case 'privacy_out':
    case 'music_recording':
      return ['air', 'mixed', 'impact'];
    case 'from_above':
    case 'general':
    case 'other':
    default:
      return ['air', 'impact', 'mixed'];
  }
}

export function wishPrimaryGroup(wish: RoomWishOption): WishAudioGroup {
  if (wish === 'from_above') return 'impact';
  if (wish === 'privacy_out' || wish === 'music_recording') return 'air';
  return 'air';
}

export function wishNoiseType(wish: RoomWishOption, fallback: NoiseType): NoiseType {
  if (wish === 'privacy_out' || wish === 'music_recording') return 'airborne';
  if (wish === 'from_above') return 'mixed';
  return fallback;
}

/** Result callout: how MultiFrame answers the chosen job. */
export function wishScenarioLine(wish: RoomWishOption): string {
  switch (wish) {
    case 'from_above':
      return 'Вы хотите, чтобы сверху стало тише. MultiFrame на потолке смягчает топот и разговоры, которые доходят через плиту.';
    case 'privacy_out':
      return 'Вы хотите, чтобы соседи сверху меньше слышали вас. Потолок с MultiFrame глушит голоса и музыку, которые уходят вверх через плиту.';
    case 'music_recording':
      return 'Вы хотите, чтобы музыка и запись звучали чище. Панель MultiFrame поглощает эхо в комнате, и сверху тоже становится тише.';
    case 'general':
      return 'Вы хотите, чтобы в комнате стало спокойнее. MultiFrame снижает и голоса сверху, и шаги.';
    case 'other':
      return 'Так выглядит профиль комнаты с MultiFrame.';
  }
}

export function wishAudioLead(wish: RoomWishOption): string {
  switch (wish) {
    case 'from_above':
      return 'Сначала топот и голоса — так обычно шумят сверху.';
    case 'privacy_out':
      return 'Сначала голоса: речь уходит вверх через плиту.';
    case 'music_recording':
      return 'Сравните голоса и смешанный шум. Когда фона меньше, запись звучит чище.';
    case 'general':
    case 'other':
    default:
      return 'Один и тот же звук сейчас и с MultiFrame в этой комнате.';
  }
}

/** Qualitative sound-correction note (not Rw/Lnw). */
export function wishSoundCorrectionLine(wish: RoomWishOption): string | null {
  if (wish !== 'music_recording') return null;
  return 'Перфорация MultiFrame ещё уменьшает эхо в самой комнате.';
}

/** Stretch-ceiling drum effect — auto from planned ceiling, not a Q8 card. */
export function stretchDrumLine(plannedCeiling: PlannedCeilingOption): string | null {
  if (plannedCeiling !== 'stretch_planned') return null;
  return 'Под обычным натяжным потолком зазор может гудеть, как барабан, и усиливать шум сверху. MultiFrame это снимает.';
}
