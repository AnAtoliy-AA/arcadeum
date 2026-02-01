import type { Locale } from '../../../types';
import { enMessages } from './en';
import { esMessages } from './es';
import { frMessages } from './fr';
import { ruMessages } from './ru';
import { beMessages } from './be';

const criticalMessagesDefinition = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  ru: ruMessages,
  be: beMessages,
} satisfies Record<Locale, Record<string, unknown>>;

export const criticalMessages = criticalMessagesDefinition;

/** Derived type from the criticalMessages object - English locale structure */
export type CriticalGamesMessages = (typeof criticalMessagesDefinition)['en'];
