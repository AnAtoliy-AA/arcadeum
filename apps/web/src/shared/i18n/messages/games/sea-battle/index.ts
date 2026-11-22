import type { enMessages } from './en';
import type { seaBattleLandingExtraEn } from './landing-extra-en';

export type { enMessages as en } from './en';

export type SeaBattleGamesMessages = typeof enMessages &
  typeof seaBattleLandingExtraEn;

type Extra = typeof seaBattleLandingExtraEn;

/** Merges the landing copy extras into the base sea_battle_v1 namespace. */
function withExtra<B extends { sea_battle_v1: { landing: object } }>(
  base: B,
  extra: Extra,
) {
  return {
    ...base,
    sea_battle_v1: {
      ...base.sea_battle_v1,
      landing: {
        ...base.sea_battle_v1.landing,
        ...extra.sea_battle_v1.landing,
      },
    },
  };
}

/** Lazy loader - returns locale-specific messages without eagerly importing all locales */
export async function loadSeaBattleMessages(locale: string) {
  switch (locale) {
    case 'es':
      return withExtra(
        (await import('./es')).esMessages,
        (await import('./landing-extra-es')).seaBattleLandingExtraEs,
      );
    case 'fr':
      return withExtra(
        (await import('./fr')).frMessages,
        (await import('./landing-extra-fr')).seaBattleLandingExtraFr,
      );
    case 'ru':
      return withExtra(
        (await import('./ru')).ruMessages,
        (await import('./landing-extra-ru')).seaBattleLandingExtraRu,
      );
    case 'by':
      return withExtra(
        (await import('./by')).byMessages,
        (await import('./landing-extra-by')).seaBattleLandingExtraBy,
      );
    default:
      return withExtra(
        (await import('./en')).enMessages,
        (await import('./landing-extra-en')).seaBattleLandingExtraEn,
      );
  }
}
