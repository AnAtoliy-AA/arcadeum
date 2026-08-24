/**
 * Sea Battle Game Constants
 */

// Player limits
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const MAX_PLAYERS_TEAM_MODE = 8;
export const MIN_TEAM_SIZE = 2;
export const MIN_TEAMS = 2;

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
  { id: 'patrol-1', name: 'Patrol', size: 2 },
  { id: 'patrol-2', name: 'Patrol', size: 2 },
  { id: 'frigate-1', name: 'Frigate', size: 3 },
  { id: 'frigate-2', name: 'Frigate', size: 3 },
  { id: 'carrier-1', name: 'Carrier', size: 5 },
  { id: 'cruiser-3', name: 'Cruiser', size: 3 },
  { id: 'destroyer-4', name: 'Destroyer', size: 2 },
  { id: 'destroyer-5', name: 'Destroyer', size: 2 },
  { id: 'submarine-5', name: 'Submarine', size: 1 },
  { id: 'submarine-6', name: 'Submarine', size: 1 },
  { id: 'patrol-3', name: 'Patrol', size: 2 },
  { id: 'patrol-4', name: 'Patrol', size: 2 },
  { id: 'frigate-3', name: 'Frigate', size: 3 },
  { id: 'battleship-2', name: 'Battleship', size: 4 },
  { id: 'submarine-7', name: 'Submarine', size: 1 },
  { id: 'submarine-8', name: 'Submarine', size: 1 },
];

export function getDefaultShipCount(gridSize: number): number {
  if (gridSize <= 10) return 10;
  if (gridSize <= 15) return 18;
  return 24;
}

export function getActiveShips(shipCount?: number): ShipConfig[] {
  const count = shipCount ?? 10;
  return SHIPS.slice(0, Math.min(count, SHIPS.length));
}

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

// Game mode variants
export const GAME_MODE_VARIANTS = {
  CLASSIC: 'classic',
  SPEED: 'speed',
  BATTLE_ROYALE: 'battle_royale',
  TEAM_2V2: 'team_2v2',
} as const;

export type GameModeVariant =
  (typeof GAME_MODE_VARIANTS)[keyof typeof GAME_MODE_VARIANTS];

// Speed mode constants
export const SPEED_TURN_BUDGET_MS = 30_000;
export const SPEED_PLACEMENT_BUDGET_MS = 120_000;

// Battle Royale constants
export const BATTLE_ROYALE_SHRINK_INTERVAL_MS = 60_000;
export const BATTLE_ROYALE_MAX_ROUNDS = 20;

// Grid labels
export const ROW_LABELS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
];
export const COL_LABELS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
];
