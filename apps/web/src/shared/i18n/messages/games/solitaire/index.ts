import type { enMessages } from './en';

export type { enMessages as en } from './en';
export type SolitaireMessages = typeof enMessages;

/** Lazy loader — returns locale-specific messages without eagerly importing all locales */
export async function loadSolitaireMessages(locale: string) {
  switch (locale) {
    case 'en':
      return (await import('./en')).enMessages;
    case 'es':
      return (await import('./es')).esMessages;
    case 'fr':
      return (await import('./fr')).frMessages;
    case 'ru':
      return (await import('./ru')).ruMessages;
    case 'by':
      return (await import('./by')).byMessages;
    default:
      return (await import('./en')).enMessages;
  }
}
