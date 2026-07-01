import {
  CellState,
  GamePhase,
  AttackResult,
  GameModeVariant,
} from './sea-battle.constants';
import { ChatScope, GameLogEntry } from '../base/game-engine.interface';

export interface SeaBattleTeam {
  id: string;
  name: string;
  color: string;
  playerIds: string[];
  currentShooterIndex: number;
}

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
  turnDeadline?: number;
  [key: string]: unknown;
}

export interface SeaBattleState {
  phase: GamePhase;
  players: SeaBattlePlayer[];
  playerOrder: string[];
  currentTurnIndex: number;
  winnerId?: string;
  logs: GameLogEntry[];
  gridSize: number;
  shipCount?: number;
  specialWeapons?: { sonar?: boolean; radar?: boolean };
  lastAttack?: {
    attackerId: string;
    targetId: string;
    row: number;
    col: number;
    result: AttackResult;
    shipName?: string;
  };
  teams?: SeaBattleTeam[];
  teamOrder?: string[];
  currentTeamIndex?: number;
  hideShipsFromTeammates?: boolean;
  mode?: GameModeVariant;
  roundNumber?: number;
  specialWeaponUsage?: Record<string, SpecialWeaponUsage>;
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
  [key: string]: unknown;
}

export interface SeaBattleConfig {
  teams?: Array<{
    id: string;
    name: string;
    color: string;
    playerIds: string[];
  }>;
  hideShipsFromTeammates?: boolean;
  mode?: GameModeVariant;
  gridSize?: number;
  shipCount?: number;
  specialWeapons?: { sonar?: boolean; radar?: boolean };
}

export interface PlaceShipPayload {
  shipId: string;
  cells: ShipCell[];
}

export interface MoveShipPayload {
  shipId: string;
  cells: ShipCell[];
}

export interface AttackPayload {
  targetPlayerId: string;
  row: number;
  col: number;
}

export interface SonarPayload {
  targetPlayerId: string;
}

export interface RadarPayload {
  targetPlayerId: string;
  row?: number;
  col?: number;
}

export interface ChatPayload {
  message: string;
  scope?: ChatScope;
}

export interface SpecialWeaponUsage {
  sonarUsed?: boolean;
  radarUsed?: boolean;
}
