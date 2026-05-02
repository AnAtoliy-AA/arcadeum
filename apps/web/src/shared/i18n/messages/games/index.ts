import * as shared from './shared/index';
import * as critical from './critical/index';
import * as texasHoldem from './texas-holdem';
import * as seaBattle from './sea-battle/index';

/** Combined games messages type derived from actual message objects */
export type GamesMessagesBundle = shared.SharedGamesMessages &
  critical.CriticalGamesMessages &
  texasHoldem.TexasHoldemGamesMessages &
  seaBattle.SeaBattleGamesMessages;

export const en = {
  ...shared.en,
  ...critical.en,
  ...texasHoldem.en,
  ...seaBattle.en,
  glimworm_v1: { name: 'Glimworm' },
};

export const es = {
  ...shared.es,
  ...critical.es,
  ...texasHoldem.es,
  ...seaBattle.es,
  glimworm_v1: { name: 'Glimworm' },
};

export const fr = {
  ...shared.fr,
  ...critical.fr,
  ...texasHoldem.fr,
  ...seaBattle.fr,
  glimworm_v1: { name: 'Glimworm' },
};

export const ru = {
  ...shared.ru,
  ...critical.ru,
  ...texasHoldem.ru,
  ...seaBattle.ru,
  glimworm_v1: { name: 'Глимворм' },
};

export const by = {
  ...shared.by,
  ...critical.by,
  ...texasHoldem.by,
  ...seaBattle.by,
  glimworm_v1: { name: 'Глімворм' },
};

export const gamesMessages = {
  en,
  es,
  fr,
  ru,
  by,
} as const;
