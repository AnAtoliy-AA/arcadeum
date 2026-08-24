import type {
  BaseGameState,
  GamePlayerState,
} from '../../base/game-engine.interface';
import type {
  BoardSize,
  Cell,
  GamePhase,
  GoOptions,
  StoneColor,
} from './go.constants';

export interface Point {
  row: number;
  col: number;
}

export interface GoPlayer extends GamePlayerState {
  playerId: string;
  color: StoneColor;
  alive: boolean;
}

export interface PlaceStonePayload {
  row: number;
  col: number;
}

export interface BoardScores {
  black: number;
  white: number;
}

export interface GoState extends BaseGameState {
  phase: GamePhase;
  options: GoOptions;
  boardSize: BoardSize;
  board: Cell[][];
  players: GoPlayer[];
  /** Stones captured BY each color. */
  captures: { black: number; white: number };
  consecutivePasses: number;
  /** Forbidden recapture point under the simple ko rule. */
  koPoint: Point | null;
  /** Last placed stone position (null after a pass) — UI marker. */
  lastMove: Point | null;
  playerOrder: string[];
  currentTurnIndex: number;
  winnerId: string | null;
  isDraw: boolean;
  /** Final area scores, set when the game ends by double pass. */
  scores: BoardScores | null;
}

export interface InitializeConfig {
  options?: Partial<GoOptions>;
}
