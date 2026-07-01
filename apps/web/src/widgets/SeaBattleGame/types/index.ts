import { ChatScope } from '@/shared/types/games';
import type { BaseGameWidgetProps } from '@/features/games/types/base';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export const BOARD_SIZE = 10;

export function rowLabels(size: number): string[] {
  return Array.from({ length: size }, (_, i) => String.fromCharCode(65 + i));
}
export function colLabels(size: number): string[] {
  return Array.from({ length: size }, (_, i) => String(i + 1));
}

export const ROW_LABELS = rowLabels(BOARD_SIZE);
export const COL_LABELS = colLabels(BOARD_SIZE);

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

export interface SeaBattleTeam {
  id: string;
  name: string;
  color: string;
  playerIds: string[];
  currentShooterIndex: number;
}

export interface SeaBattleSnapshot {
  phase: GamePhase;
  players: SeaBattlePlayerState[];
  playerOrder: string[];
  currentTurnIndex: number;
  winnerId?: string;
  logs: GameLogEntry[];
  gridSize?: number;
  lastAttack?: LastAttack;
  teams?: SeaBattleTeam[];
  teamOrder?: string[];
  currentTeamIndex?: number;
  hideShipsFromTeammates?: boolean;
  specialWeapons?: { sonar?: boolean; radar?: boolean };
  specialWeaponUsage?: Record<
    string,
    { sonarUsed?: boolean; radarUsed?: boolean }
  >;
  lastSonar?: {
    attackerId: string;
    targetId: string;
    shipPositions: ShipCell[];
  };
  lastRadar?: {
    attackerId: string;
    targetId: string;
    row?: number;
    col?: number;
    cells: { row: number; col: number; state: CellState }[];
  };
}

export interface SeaBattleGameProps extends BaseGameWidgetProps {}

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
