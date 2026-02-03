import {
  GameRoomSummary,
  ChatScope,
  GameSessionSummary,
} from '@/shared/types/games';

// ============ Player Limits ============

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

// ============ Constants ============

export const BOARD_SIZE = 10;

export const CELL_STATE = {
  EMPTY: 0,
  SHIP: 1,
  HIT: 2,
  MISS: 3,
} as const;

export type CellState = (typeof CELL_STATE)[keyof typeof CELL_STATE];

export const GAME_PHASE = {
  LOBBY: 'lobby',
  PLACEMENT: 'placement',
  BATTLE: 'battle',
  GAME_OVER: 'game_over',
} as const;

export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export const ATTACK_RESULT = {
  HIT: 'hit',
  MISS: 'miss',
  SUNK: 'sunk',
} as const;

export type AttackResult = (typeof ATTACK_RESULT)[keyof typeof ATTACK_RESULT];

// Grid labels
export const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const COL_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

// ============ Ship Configuration ============

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

// ============ Game Types ============

export interface ShipCell {
  row: number;
  col: number;
}

export interface Ship {
  id: string;
  name: string;
  size: number;
  cells: ShipCell[];
  hits: number;
  sunk: boolean;
}

export interface SeaBattlePlayerState {
  playerId: string;
  alive: boolean;
  board: CellState[][];
  ships: Ship[];
  shipsRemaining: number;
  placementComplete: boolean;
}

export interface GameLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: ChatScope;
  senderId?: string | null;
  senderName?: string | null;
}

export interface LastAttack {
  attackerId: string;
  targetId: string;
  row: number;
  col: number;
  result: AttackResult;
  shipName?: string;
}

export interface SeaBattleSnapshot {
  phase: GamePhase;
  players: SeaBattlePlayerState[];
  playerOrder: string[];
  currentTurnIndex: number;
  winnerId?: string;
  logs: GameLogEntry[];
  lastAttack?: LastAttack;
}

// ============ Component Props ============

export interface SeaBattleGameProps {
  roomId: string;
  room: GameRoomSummary;
  session: GameSessionSummary | null;
  currentUserId: string | null;
  isHost: boolean;
  onPostHistoryNote?: (message: string, scope: ChatScope) => void;
  config?: unknown;
  accessToken?: string | null;
}

export interface BoardProps {
  board: CellState[][];
  ships?: Ship[];
  isOwn: boolean;
  onCellClick?: (row: number, col: number) => void;
  highlightCells?: ShipCell[];
  disabled?: boolean;
}

export interface ShipPlacementProps {
  ships: ShipConfig[];
  placedShips: Ship[];
  currentShip: ShipConfig | null;
  onPlaceShip: (shipId: string, cells: ShipCell[]) => void;
  onConfirmPlacement: () => void;
}

// ============ Action Payloads ============

export interface PlaceShipPayload {
  roomId: string;
  userId: string;
  shipId: string;
  cells: ShipCell[];
}

export interface AttackPayload {
  roomId: string;
  userId: string;
  targetPlayerId: string;
  row: number;
  col: number;
}

export interface ConfirmPlacementPayload {
  roomId: string;
  userId: string;
}
