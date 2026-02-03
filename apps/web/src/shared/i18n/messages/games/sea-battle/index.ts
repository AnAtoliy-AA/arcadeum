import type { Locale } from '../../../types';
import { enMessages } from './en';
import { esMessages } from './es';
import { frMessages } from './fr';
import { ruMessages } from './ru';
import { beMessages } from './be';

export type SeaBattleGamesMessages = typeof enMessages;

export const seaBattleMessages: Record<Locale, SeaBattleGamesMessages> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  ru: ruMessages,
  be: beMessages,
};
