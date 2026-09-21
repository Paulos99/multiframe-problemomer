import type { NoiseType, RoomWishOption } from './types';

export type WishAudioGroup = 'air' | 'impact' | 'mixed';

/** Demo order: the first group is the selling point for this use. */
export function wishAudioOrder(wish: RoomWishOption): WishAudioGroup[] {
  switch (wish) {
    case 'rest':
      return ['impact', 'air', 'mixed'];
    case 'focus':
      return ['air', 'mixed', 'impact'];
    case 'everyday':
      return ['mixed', 'air', 'impact'];
    default:
      return ['air', 'impact', 'mixed'];
  }
}

export function wishPrimaryGroup(wish: RoomWishOption): WishAudioGroup {
  return wishAudioOrder(wish)[0]!;
}

export function wishNoiseType(wish: RoomWishOption, fallback: NoiseType): NoiseType {
  if (wish === 'focus') return 'airborne';
  if (wish === 'rest' || wish === 'everyday') return 'mixed';
  return fallback;
}

/** Result callout: how MultiFrame is useful for this planned use. */
export function wishScenarioLine(wish: RoomWishOption): string {
  switch (wish) {
    case 'rest':
      return 'Для сна и отдыха важны шаги сверху и ночные голоса. MultiFrame смягчает удар и воздух — комната воспринимается спокойнее ночью.';
    case 'focus':
      return 'Для работы, учёбы и созвонов важнее воздушный шум: речь и ТВ сверху. Потолок снижает разборчивость соседских голосов, чтобы легче держать концентрацию.';
    case 'everyday':
      return 'Для общения, ТВ и быта смотрим смешанный фон: голоса, шаги и техника сверху. MultiFrame делает его мягче по обоим каналам.';
    default:
      return 'Сценарий пока общий: ориентир по воздуху и удару без акцента. Когда определитесь с использованием, профиль можно пройти ещё раз.';
  }
}

export function wishAudioLead(wish: RoomWishOption): string {
  switch (wish) {
    case 'rest':
      return 'Начните с топота и разговоров — это то, что обычно мешает заснуть.';
    case 'focus':
      return 'Сначала послушайте голоса: этот канал сильнее влияет на работу и созвоны.';
    case 'everyday':
      return 'Смешанный пример ближе к дневному быту; рядом — воздух и удар по отдельности.';
    default:
      return 'Один и тот же звук — до и после MultiFrame в условиях этой комнаты.';
  }
}
