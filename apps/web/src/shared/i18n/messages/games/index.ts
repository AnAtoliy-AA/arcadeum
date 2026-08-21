import type { SharedGamesMessages } from './shared/index';
import type { CriticalGamesMessages } from './critical/index';
import type { TexasHoldemGamesMessages } from './texas-holdem';
import type { SeaBattleGamesMessages } from './sea-battle/index';
import type { GlimwormGamesMessages } from './glimworm/index';
import type { TicTacToeMessages } from './tic-tac-toe/index';
import type { CascadeMessages } from './cascade/index';
import type { ChessMessages } from './chess/index';
import type { CheckersMessages } from './checkers/index';
import type { CatDashMessages } from './cat-dash/index';
import type { BackgammonMessages } from './backgammon/index';

export type GamesMessagesBundle = SharedGamesMessages &
  CriticalGamesMessages &
  TexasHoldemGamesMessages &
  SeaBattleGamesMessages &
  GlimwormGamesMessages &
  TicTacToeMessages &
  CascadeMessages &
  ChessMessages &
  CheckersMessages &
  CatDashMessages &
  BackgammonMessages;
