import type { Locale } from '../../types';
import { criticalMessages, type CriticalGamesMessages } from './critical/index';
import {
  texasHoldemMessages,
  type TexasHoldemGamesMessages,
} from './texas-holdem';
import { sharedMessages, type SharedGamesMessages } from './shared/index';
import {
  seaBattleMessages,
  type SeaBattleGamesMessages,
} from './sea-battle/index';

/** Combined games messages type derived from actual message objects */
export type GamesMessagesBundle = SharedGamesMessages &
  CriticalGamesMessages &
  TexasHoldemGamesMessages &
  SeaBattleGamesMessages;

export const gamesMessages: Record<Locale, GamesMessagesBundle> = {
  en: {
    ...sharedMessages.en,
    ...criticalMessages.en,
    ...texasHoldemMessages.en,
    ...seaBattleMessages.en,
  },
  es: {
    ...sharedMessages.es,
    ...criticalMessages.es,
    ...texasHoldemMessages.es,
    ...seaBattleMessages.es,
  },
  fr: {
    ...sharedMessages.fr,
    ...criticalMessages.fr,
    ...texasHoldemMessages.fr,
    ...seaBattleMessages.fr,
  },
  ru: {
    ...sharedMessages.ru,
    ...criticalMessages.ru,
    ...texasHoldemMessages.ru,
    ...seaBattleMessages.ru,
  },
  by: {
    ...sharedMessages.by,
    ...criticalMessages.by,
    ...texasHoldemMessages.by,
    ...seaBattleMessages.by,
  },
} as Record<Locale, GamesMessagesBundle>;
