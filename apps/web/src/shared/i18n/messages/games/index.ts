import type { Locale } from '../../types';
import {
  explodingCatsMessages,
  type ExplodingCatsGamesMessages,
} from './exploding-cats';
import {
  texasHoldemMessages,
  type TexasHoldemGamesMessages,
} from './texas-holdem';
import { sharedMessages, type SharedGamesMessages } from './shared';

/** Combined games messages type derived from actual message objects */
export type GamesMessagesBundle = SharedGamesMessages &
  ExplodingCatsGamesMessages &
  TexasHoldemGamesMessages;

export const gamesMessages: Record<Locale, GamesMessagesBundle> = {
  en: {
    ...sharedMessages.en,
    ...explodingCatsMessages.en,
    ...texasHoldemMessages.en,
  },
  es: {
    ...sharedMessages.es,
    ...explodingCatsMessages.es,
    ...texasHoldemMessages.es,
  },
  fr: {
    ...sharedMessages.fr,
    ...explodingCatsMessages.fr,
    ...texasHoldemMessages.fr,
  },
} as Record<Locale, GamesMessagesBundle>;
