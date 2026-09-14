import type { clansEn } from './en';

export type { clansEn } from './en';

/** Lazy loader — returns locale-specific messages without eagerly importing all locales */
export async function loadClansMessages(locale: string) {
  switch (locale) {
    case 'en':
      return (await import('./en')).clansEn;
    case 'es':
      return (await import('./es')).clansEs;
    case 'fr':
      return (await import('./fr')).clansFr;
    case 'ru':
      return (await import('./ru')).clansRu;
    case 'by':
      return (await import('./by')).clansBy;
    default:
      return (await import('./en')).clansEn;
  }
}
