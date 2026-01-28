import type { Locale } from '../../types';
import { criticalMessages, type CriticalGamesMessages } from './critical/index';
import {
  texasHoldemMessages,
  type TexasHoldemGamesMessages,
} from './texas-holdem';
import { sharedMessages, type SharedGamesMessages } from './shared/index';

/** Combined games messages type derived from actual message objects */
export type GamesMessagesBundle = SharedGamesMessages &
  CriticalGamesMessages &
  TexasHoldemGamesMessages;

export const gamesMessages: Record<Locale, GamesMessagesBundle> = {
  en: {
    ...sharedMessages.en,
    ...criticalMessages.en,
    ...texasHoldemMessages.en,
  },
  es: {
    ...sharedMessages.es,
    ...criticalMessages.es,
    ...texasHoldemMessages.es,
  },
  fr: {
    ...sharedMessages.fr,
    ...criticalMessages.fr,
    ...texasHoldemMessages.fr,
  },
  ru: {
    ...sharedMessages.ru,
    ...criticalMessages.ru,
    ...texasHoldemMessages.ru,
  },
  be: {
    ...sharedMessages.be,
    ...criticalMessages.be,
    ...texasHoldemMessages.be,
  },
} as Record<Locale, GamesMessagesBundle>;
