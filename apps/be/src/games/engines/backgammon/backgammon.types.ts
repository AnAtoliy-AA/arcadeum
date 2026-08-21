import type {
  BaseGameState,
  GamePlayerState,
} from '../base/game-engine.interface';
import type {
  BackgammonOptions,
  GamePhase,
  PlayerColor,
} from './backgammon.constants';

export interface BackgammonPoint {
  playerId: string | null;
  count: number;
}

export interface BackgammonPlayer extends GamePlayerState {
  playerId: string;
  color: PlayerColor;
  alive: boolean;
  bar: number;
  borneOff: number;
  pipCount: number;
}

export interface MoveCheckerPayload {
  from: number | 'bar';
  to: number | 'off';
}

export interface BackgammonState extends BaseGameState {
  phase: GamePhase;
  options: BackgammonOptions;
  points: BackgammonPoint[];
  bar: Record<string, number>;
  borneOff: Record<string, number>;
  dice: number[];
  rolledDice: [number, number] | null;
  currentTurnIndex: number;
  playerOrder: string[];
  players: BackgammonPlayer[];
  winnerId: string | null;
  isDraw: boolean;
}

export interface InitializeConfig {
  options?: Partial<BackgammonOptions>;
}

export interface LegalMove {
  from: number | 'bar';
  to: number | 'off';
  die: number;
  isHit: boolean;
}
