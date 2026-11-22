import type { DeepPartial } from '../../base-types';
import type { en } from './en';

export type { en } from './en';

export type CreateRoomBundle = DeepPartial<typeof en>;

/** Lazy loader - returns locale-specific messages without importing every locale */
export async function loadCreateRoomMessages(locale: string) {
  switch (locale) {
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
