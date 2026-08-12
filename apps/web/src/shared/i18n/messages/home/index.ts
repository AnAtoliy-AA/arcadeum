import type { DeepPartial } from '../../base-types';
import type { en } from './en';

export type { en } from './en';

export type HomeMessages = DeepPartial<typeof en>;

/** Lazy loader — returns locale-specific messages without eagerly importing all locales */
export async function loadHomeMessages(locale: string) {
  switch (locale) {
    case 'en':
      return (await import('./en')).en;
    case 'es':
      return (await import('./es')).es;
    case 'fr':
      return (await import('./fr')).fr;
    case 'ru':
      return (await import('./ru')).ru;
    case 'by':
      return (await import('./by')).by;
    default:
      return (await import('./en')).en;
  }
}
