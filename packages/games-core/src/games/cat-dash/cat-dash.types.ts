import type {
  BaseGameState,
  GameLogEntry,
} from '../../base/game-engine.interface';
import type { TrackType, Theme, CatId } from './cat-dash.constants';

export interface TrackSpace {
  id: number;
  type: 'normal' | 'obstacle' | 'bonus' | 'fork';
  theme?: string;
  effect?: SpaceEffect;
}

export interface SpaceEffect {
  type: 'skip_turn' | 'extra_roll' | 'power_recharge' | 'teleport';
  value?: number;
}

export interface CatDashPlayer {
  playerId: string;
  catId: CatId;
  position: number;
  powerTokens: number;
  abilitiesUsed: string[];
  isReady: boolean;
  hasBonus: boolean;
  [key: string]: unknown;
}

export interface CatDashOptions {
  trackType: TrackType;
  theme: Theme;
  columns?: number;
  trackLength?: number;
}

export interface CatDashState extends BaseGameState {
  trackType: TrackType;
  theme: Theme;
  columns: number;
  trackLength: number;
  players: CatDashPlayer[];
  currentPlayerIndex: number;
  turnNumber: number;
  track: TrackSpace[];
  winner?: string;
  gameOver: boolean;
  logs: GameLogEntry[];
}

export type CatDashAction =
  | { type: 'ROLL_DICE'; playerId: string }
  | { type: 'MOVE'; playerId: string; spaces: number }
  | { type: 'USE_ABILITY'; playerId: string; abilityId: string }
  | { type: 'CHOOSE_PATH'; playerId: string; pathIndex: number };
