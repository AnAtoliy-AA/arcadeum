import type { Locale } from '../../../types';
import { enMessages } from './en';
import { esMessages } from './es';
import { frMessages } from './fr';

const explodingCatsMessagesDefinition = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
} satisfies Record<Locale, Record<string, unknown>>;

export const explodingCatsMessages = explodingCatsMessagesDefinition;

/** Derived type from the explodingCatsMessages object - English locale structure */
export type ExplodingCatsGamesMessages =
  (typeof explodingCatsMessagesDefinition)['en'];
