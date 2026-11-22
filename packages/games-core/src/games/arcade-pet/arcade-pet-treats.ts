import type { GameTreatId } from './arcade-pet.types';

/**
 * Treat awarded for a win in each game. Exhaustive over every catalog game id,
 * so adding a game without deciding its treat fails type-check. Games mapped to
 * `null` (including ArcadePet itself) award nothing.
 */
export const GAME_TREAT_BY_GAME_ID = {
  arcade_pet_v1: null,
  critical_v1: 'critical_pepper',
  sea_battle_v1: 'sea_battle_fish',
  texas_holdem_v1: null,
  glimworm_v1: null,
  tic_tac_toe_v1: null,
  cascade_v1: null,
  chess_v1: 'chess_cookie',
  checkers_v1: null,
  cat_dash_v1: null,
  backgammon_v1: null,
  hearts_v1: 'hearts_candy',
  spades_v1: null,
  go_v1: null,
  pachisi_v1: 'pachisi_spice',
} as const satisfies Record<string, GameTreatId | null>;

export type TreatGameId = keyof typeof GAME_TREAT_BY_GAME_ID;

const treatTable: Readonly<Record<string, GameTreatId | null>> =
  GAME_TREAT_BY_GAME_ID;

/** Treat for a win in `gameId`, or null for unknown games and games without one. */
export function getGameTreat(gameId: string): GameTreatId | null {
  return Object.prototype.hasOwnProperty.call(treatTable, gameId)
    ? treatTable[gameId]
    : null;
}
