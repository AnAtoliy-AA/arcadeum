import type { Locale } from '../../types';

const texasHoldemMessagesDefinition = {
  en: {
    texas_holdem_v1: { name: "Texas Hold'em Poker" },
  },
  es: {
    texas_holdem_v1: { name: "Texas Hold'em Poker" },
  },
  fr: {
    texas_holdem_v1: { name: "Texas Hold'em Poker" },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const texasHoldemMessages = texasHoldemMessagesDefinition;

/** Derived type from the texasHoldemMessages object - English locale structure */
export type TexasHoldemGamesMessages =
  (typeof texasHoldemMessagesDefinition)['en'];
