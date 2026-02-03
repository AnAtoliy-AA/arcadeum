import { CellState, GamePhase, AttackResult } from './sea-battle.constants';
import { GameLogEntry } from '../base/game-engine.interface';

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

export interface SeaBattlePlayer {
  playerId: string;
  alive: boolean;
  board: CellState[][];
  ships: Ship[];
  shipsRemaining: number;
  placementComplete: boolean;
  [key: string]: unknown;
}

export interface SeaBattleState {
  phase: GamePhase;
  players: SeaBattlePlayer[];
  playerOrder: string[];
  currentTurnIndex: number;
  winnerId?: string;
  logs: GameLogEntry[];
  lastAttack?: {
    attackerId: string;
    targetId: string;
    row: number;
    col: number;
    result: AttackResult;
    shipName?: string;
  };
  [key: string]: unknown;
}

export interface PlaceShipPayload {
  shipId: string;
  cells: ShipCell[];
}

export interface AttackPayload {
  targetPlayerId: string;
  row: number;
  col: number;
}

export interface ChatPayload {
  message: string;
  scope?: 'all' | 'players' | 'private';
}
