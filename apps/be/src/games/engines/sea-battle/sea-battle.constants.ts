/**
 * Sea Battle Game Constants
 */

// Player limits
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

export const BOARD_SIZE = 10;

export const CELL_STATE = {
  EMPTY: 0,
  SHIP: 1,
  HIT: 2,
  MISS: 3,
} as const;

export type CellState = (typeof CELL_STATE)[keyof typeof CELL_STATE];

export interface ShipConfig {
  id: string;
  name: string;
  size: number;
}

export const SHIPS: ShipConfig[] = [
  { id: 'battleship-1', name: 'Battleship', size: 4 },
  { id: 'cruiser-1', name: 'Cruiser', size: 3 },
  { id: 'cruiser-2', name: 'Cruiser', size: 3 },
  { id: 'destroyer-1', name: 'Destroyer', size: 2 },
  { id: 'destroyer-2', name: 'Destroyer', size: 2 },
  { id: 'destroyer-3', name: 'Destroyer', size: 2 },
  { id: 'submarine-1', name: 'Submarine', size: 1 },
  { id: 'submarine-2', name: 'Submarine', size: 1 },
  { id: 'submarine-3', name: 'Submarine', size: 1 },
  { id: 'submarine-4', name: 'Submarine', size: 1 },
];

export const GAME_PHASE = {
  LOBBY: 'lobby',
  PLACEMENT: 'placement',
  BATTLE: 'battle',
  COMPLETED: 'completed',
} as const;

export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const ATTACK_RESULT = {
  MISS: 'miss',
  HIT: 'hit',
  SUNK: 'sunk',
} as const;

export type AttackResult = (typeof ATTACK_RESULT)[keyof typeof ATTACK_RESULT];

// Grid labels
export const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const COL_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
