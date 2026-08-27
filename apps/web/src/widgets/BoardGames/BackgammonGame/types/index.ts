import type { BaseGameWidgetProps } from '@/features/games/types/base';

export type BackgammonGameProps = BaseGameWidgetProps;

export const TOTAL_POINTS = 24;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;

export const BACKGAMMON_VARIANT_IDS = [
  'cyberpunk',
  'underwater',
  'crime',
  'horror',
  'adventure',
  'high-altitude-hike',
  'galaxy',
  'fantasy',
  'western',
  'egypt',
  'steampunk',
  'zen',
] as const;
export type BackgammonVariant = (typeof BACKGAMMON_VARIANT_IDS)[number];

export const GAME_PHASE = {
  LOBBY: 'lobby',
  ROLL: 'roll',
  MOVE: 'move',
  GAME_OVER: 'game_over',
} as const;
export type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export type PlayerColor = 'white' | 'black';

export interface BackgammonPoint {
  playerId: string | null;
  count: number;
}

export interface BackgammonPlayer {
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

export const BACKGAMMON_RULE_VARIANTS = [
  'standard',
  'long',
  'hyper',
  'tavla',
  'nackgammon',
  'gulbara',
] as const;
export type BackgammonRuleVariant = (typeof BACKGAMMON_RULE_VARIANTS)[number];

export interface BackgammonOptions {
  variant: BackgammonVariant;
  ruleVariant?: BackgammonRuleVariant;
  aiDifficulty?: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface BackgammonLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: 'all' | 'players' | 'private' | 'team';
  senderId?: string | null;
  senderName?: string | null;
  targetId?: string | null;
}

export interface BackgammonClientState {
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
  logs: BackgammonLogEntry[];
}
