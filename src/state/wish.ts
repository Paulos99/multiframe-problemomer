import type {
  NoiseKindOption,
  NoiseType,
  PlannedCeilingOption,
  RoomWishOption,
} from './types';

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

/** Map explicit noise-kind answer to NoiseType (unknown → null). */
export function noiseKindToType(kind: NoiseKindOption): NoiseType | null {
  if (kind === 'impact') return 'impact';
  if (kind === 'airborne') return 'airborne';
  if (kind === 'mixed') return 'mixed';
  return null;
}

/** Result callout: how MultiFrame answers the chosen everyday goal. */
export function wishScenarioLine(wish: RoomWishOption): string {
  switch (wish) {
    case 'from_above':
      return 'Вы хотите не слышать шум сверху. MultiFrame на потолке смягчает топот и разговоры, которые доходят через плиту.';
    case 'privacy_out':
      return 'Вы хотите, чтобы сверху не слышали вас. Потолок с MultiFrame глушит голоса и музыку, которые уходят вверх через плиту.';
    case 'music_recording':
      return 'Вы хотите меньше эха в комнате. Панель MultiFrame поглощает отражения, и сверху тоже становится тише.';
    case 'general':
      return 'Вам важен общий акустический комфорт. MultiFrame снижает и голоса сверху, и шаги.';
    case 'other':
      return 'Так выглядит профиль комнаты с MultiFrame — ниже разберём, что это даёт именно вам.';
  }
}

export function wishAudioLead(wish: RoomWishOption): string {
  switch (wish) {
    case 'from_above':
      return 'Сначала топот и голоса — так обычно шумят сверху.';
    case 'privacy_out':
      return 'Сначала голоса: речь уходит вверх через плиту.';
    case 'music_recording':
      return 'Сравните голоса и смешанный шум. Когда эха меньше, комната звучит спокойнее.';
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

/** Stretch-ceiling drum effect — only for stretch finish. */
export function stretchDrumLine(plannedCeiling: PlannedCeilingOption): string | null {
  if (plannedCeiling !== 'stretch') return null;
  return 'Под обычным натяжным потолком зазор может гудеть, как барабан, и усиливать шум сверху. Панели MultiFrame убирают этот эффект.';
}

/** Short ceiling-specific note for personalization (non-stretch). */
export function ceilingContextLine(plannedCeiling: PlannedCeilingOption): string | null {
  switch (plannedCeiling) {
    case 'stretch':
      return stretchDrumLine(plannedCeiling);
    case 'gypsum':
      return 'Гипсокартонный потолок сам по себе слабо гасит шум сверху. MultiFrame добавляет акустический слой без тяжёлого каркаса.';
    case 'plaster':
      return 'Штукатурка или покраска почти не изолируют шум сверху. MultiFrame можно заложить при обновлении потолка.';
    case 'other_exists':
      return 'Даже если потолок уже есть, MultiFrame имеет смысл при замене или доработке — эффект зависит от того, что между плитой и финишем.';
    default:
      return null;
  }
}
