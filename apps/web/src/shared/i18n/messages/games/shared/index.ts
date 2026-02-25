import type { Locale } from '../../../types';
import { enMessages } from './en';
import { esMessages } from './es';
import { frMessages } from './fr';
import { ruMessages } from './ru';
import { byMessages } from './by';

export const sharedMessages = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  ru: ruMessages,
  by: byMessages,
} satisfies Record<Locale, Record<string, unknown>>;

/** Derived type from the sharedMessages object - English locale structure */
export type SharedGamesMessages = (typeof sharedMessages)['en'];
export type { SharedGamesMessages as SharedGamesMessagesType };
