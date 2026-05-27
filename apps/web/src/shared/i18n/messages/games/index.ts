import * as shared from './shared/index';
import * as critical from './critical/index';
import * as texasHoldem from './texas-holdem';
import * as seaBattle from './sea-battle/index';
import * as glimworm from './glimworm/index';
import * as ticTacToe from './tic-tac-toe/index';
import * as cascade from './cascade/index';

/** Combined games messages type derived from actual message objects */
export type GamesMessagesBundle = shared.SharedGamesMessages &
  critical.CriticalGamesMessages &
  texasHoldem.TexasHoldemGamesMessages &
  seaBattle.SeaBattleGamesMessages &
  glimworm.GlimwormGamesMessages &
  ticTacToe.TicTacToeMessages &
  cascade.CascadeMessages;

export const en = {
  ...shared.en,
  ...critical.en,
  ...texasHoldem.en,
  ...seaBattle.en,
  ...glimworm.en,
  ...ticTacToe.en,
  ...cascade.en,
};

export const es = {
  ...shared.es,
  ...critical.es,
  ...texasHoldem.es,
  ...seaBattle.es,
  ...glimworm.es,
  ...ticTacToe.es,
  ...cascade.es,
};

export const fr = {
  ...shared.fr,
  ...critical.fr,
  ...texasHoldem.fr,
  ...seaBattle.fr,
  ...glimworm.fr,
  ...ticTacToe.fr,
  ...cascade.fr,
};

export const ru = {
  ...shared.ru,
  ...critical.ru,
  ...texasHoldem.ru,
  ...seaBattle.ru,
  ...glimworm.ru,
  ...ticTacToe.ru,
  ...cascade.ru,
};

export const by = {
  ...shared.by,
  ...critical.by,
  ...texasHoldem.by,
  ...seaBattle.by,
  ...glimworm.by,
  ...ticTacToe.by,
  ...cascade.by,
};

export const gamesMessages = {
  en,
  es,
  fr,
  ru,
  by,
} as const;
