import type { eventsEn } from './en';

export type { eventsEn } from './en';

/** Lazy loader — returns locale-specific messages without eagerly importing all locales */
export async function loadEventsMessages(locale: string) {
  switch (locale) {
    case 'en':
      return (await import('./en')).eventsEn;
    case 'es':
      return (await import('./es')).eventsEs;
    case 'fr':
      return (await import('./fr')).eventsFr;
    case 'ru':
      return (await import('./ru')).eventsRu;
    case 'by':
      return (await import('./by')).eventsBy;
    default:
      return (await import('./en')).eventsEn;
  }
}
