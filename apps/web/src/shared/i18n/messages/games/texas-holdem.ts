export const en = {
  texas_holdem_v1: { name: "Texas Hold'em Poker" },
};

export const es = {
  texas_holdem_v1: { name: "Texas Hold'em Poker" },
};

export const fr = {
  texas_holdem_v1: { name: "Texas Hold'em Poker" },
};

export const ru = {
  texas_holdem_v1: { name: 'Техасский Холдем' },
};

export const by = {
  texas_holdem_v1: { name: 'Тэхаскі Холдэн' },
};

export const texasHoldemMessages = {
  en,
  es,
  fr,
  ru,
  by,
} as const;

/** Derived type from the texasHoldemMessages object - English locale structure */
export type TexasHoldemGamesMessages = typeof en;
