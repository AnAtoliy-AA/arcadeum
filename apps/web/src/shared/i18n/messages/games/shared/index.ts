import { enMessages as en } from './en';
import { esMessages as es } from './es';
import { frMessages as fr } from './fr';
import { ruMessages as ru } from './ru';
import { byMessages as by } from './by';

export { en, es, fr, ru, by };

export const sharedMessages = {
  en,
  es,
  fr,
  ru,
  by,
} as const;

/** Derived type from the sharedMessages object - English locale structure */
export type SharedGamesMessages = typeof en;
export type { SharedGamesMessages as SharedGamesMessagesType };
