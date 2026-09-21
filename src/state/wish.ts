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
      return 'Ваша задача — снизить шум сверху. MultiFrame работает на потолке: смягчает шаги и голоса, которые приходят через перекрытие.';
    case 'privacy_out':
      return 'Ваша задача — чтобы наверху меньше слышали вас. Потолок снижает передачу воздушного шума через перекрытие вверх; стены и двери — отдельный контур.';
    case 'music_recording':
      return 'Ваша задача — улучшить качество музыки и записи. Открытый звукопоглотитель MultiFrame уменьшает эхо в помещении и делает звучание чище; дополнительно становится тише входящий фон сверху.';
    case 'general':
      return 'Ваша задача — повысить общий акустический комфорт. MultiFrame даёт ориентир по воздуху и удару и делает комнату спокойнее без узкого акцента.';
    case 'other':
      return 'Задача задана вами отдельно. Ниже — полный акустический профиль комнаты с MultiFrame, без домысливания одной потребности.';
  }
}

export function wishAudioLead(wish: RoomWishOption): string {
  switch (wish) {
    case 'from_above':
      return 'Начните с топота и голосов — это типичный шум сверху через перекрытие.';
    case 'privacy_out':
      return 'Сначала воздушный шум: речь и бытовые звуки уходят вверх через плиту.';
    case 'music_recording':
      return 'Слушайте воздух и смешанный пример: меньше постороннего фона — чище своё звучание.';
    case 'general':
    case 'other':
    default:
      return 'Один и тот же звук — до и после MultiFrame в условиях этой комнаты.';
  }
}

/** Qualitative sound-correction note (not Rw/Lnw). */
export function wishSoundCorrectionLine(wish: RoomWishOption): string | null {
  if (wish !== 'music_recording') return null;
  return 'Звукокоррекция: открытый звукопоглотитель уменьшает эхо в помещении. Это акустика комнаты, а не индекс изоляции перекрытия Rw / Lnw.';
}

/** Stretch-ceiling drum effect — auto from planned ceiling, not a Q8 card. */
export function stretchDrumLine(plannedCeiling: PlannedCeilingOption): string | null {
  if (plannedCeiling !== 'stretch_planned') return null;
  return 'Вы планируете натяжной потолок: под обычным полотном объём может усиливать шум сверху, как барабан. MultiFrame рассеивает эту энергию в панели — усиление снимается.';
}
