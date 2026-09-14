import type { seasonsEn } from './en';

export type { seasonsEn } from './en';

/** Lazy loader — returns locale-specific messages without eagerly importing all locales */
export async function loadSeasonsMessages(locale: string) {
  switch (locale) {
    case 'en':
      return (await import('./en')).seasonsEn;
    case 'es':
      return (await import('./es')).seasonsEs;
    case 'fr':
      return (await import('./fr')).seasonsFr;
    case 'ru':
      return (await import('./ru')).seasonsRu;
    case 'by':
      return (await import('./by')).seasonsBy;
    default:
      return (await import('./en')).seasonsEn;
  }
}
