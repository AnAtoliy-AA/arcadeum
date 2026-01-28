import type { Locale } from '../../../types';
import { enMessages } from './en';
import { esMessages } from './es';
import { frMessages } from './fr';
import { ruMessages } from './ru';
import { beMessages } from './be';

export const sharedMessages = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  ru: ruMessages,
  be: beMessages,
} satisfies Record<Locale, Record<string, unknown>>;

/** Derived type from the sharedMessages object - English locale structure */
export type SharedGamesMessages = (typeof sharedMessages)['en'];
export type { SharedGamesMessages as SharedGamesMessagesType };
