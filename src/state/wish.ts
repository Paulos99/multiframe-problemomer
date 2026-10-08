import type { NoiseType, PlannedCeilingOption, RoomWishOption } from './types';

export type WishAudioGroup = 'air' | 'impact' | 'mixed';

/** Demo order: the first group is the selling point for this job. */
export function wishAudioOrder(wish: RoomWishOption): WishAudioGroup[] {
  switch (wish) {
    case 'from_above':
      return ['impact', 'air', 'mixed'];
    case 'privacy_out':
    case 'music_recording':
      return ['air', 'mixed', 'impact'];
    case 'general':
    case 'other':
    default:
      return ['air', 'impact', 'mixed'];
  }
}

export function wishPrimaryGroup(wish: RoomWishOption): WishAudioGroup {
  return wishAudioOrder(wish)[0]!;
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
      return 'Вы хотите тише шаги и голоса сверху. MultiFrame на потолке смягчает и топот, и разговоры, которые доходят через плиту.';
    case 'privacy_out':
      return 'Вы хотите, чтобы соседи сверху меньше слышали вас. Потолок с MultiFrame глушит голоса и музыку, которые уходят вверх через плиту. Стены и двери на это почти не влияют — это уже другая изоляция.';
    case 'music_recording':
      return 'Вы хотите, чтобы музыка и запись звучали чище. Панель MultiFrame поглощает эхо в комнате. Заодно сверху становится тише посторонний фон.';
    case 'general':
      return 'Вы хотите, чтобы в комнате стало спокойнее в целом. MultiFrame снижает и голоса сверху, и шаги — без узкой настройки под одну проблему.';
    case 'other':
      return 'Ниже — полный профиль комнаты с MultiFrame, без привязки к одной задаче.';
  }
}

export function wishAudioLead(wish: RoomWishOption): string {
  switch (wish) {
    case 'from_above':
      return 'Сначала топот и голоса — так обычно шумят сверху.';
    case 'privacy_out':
      return 'Сначала голоса: речь уходит вверх через плиту.';
    case 'music_recording':
      return 'Сравните голоса и смешанный шум: меньше фона — чище своё звучание.';
    case 'general':
    case 'other':
    default:
      return 'Один и тот же звук — сейчас и с MultiFrame в этой комнате.';
  }
}

/** Qualitative sound-correction note (not Rw/Lnw). */
export function wishSoundCorrectionLine(wish: RoomWishOption): string | null {
  if (wish !== 'music_recording') return null;
  return 'Отдельно: перфорация MultiFrame уменьшает эхо в самой комнате. Это не то же самое, что изоляция от соседей.';
}

/** Stretch-ceiling drum effect — auto from planned ceiling, not a Q8 card. */
export function stretchDrumLine(plannedCeiling: PlannedCeilingOption): string | null {
  if (plannedCeiling !== 'stretch_planned') return null;
  return 'Под обычным натяжным потолком воздух в зазоре может усиливать шум сверху, как барабан. MultiFrame это усиление снимает: энергия уходит в панель, а не гудит в полотне.';
}
