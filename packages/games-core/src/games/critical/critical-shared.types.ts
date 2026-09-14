import { CriticalState, CriticalPlayerState } from './critical.state';
import { GameLogEntry, ChatScope } from '../../base/game-engine.interface';
import { GameActionResult } from '../../base/game-engine.interface';
import { CriticalCard } from './critical.state';

export interface LogEntryOptions {
  kind?: string;
  scope?: ChatScope;
  senderId?: string | null;
  senderName?: string | null;
  targetId?: string | null;
}

export interface EngineHelpers {
  addLog: (state: CriticalState, entry: GameLogEntry) => void;
  createLogEntry: (
    type: string,
    message: string,
    options?: LogEntryOptions,
  ) => GameLogEntry;
  advanceTurn: (state: CriticalState) => void;
  shuffleArray: <T>(array: T[]) => void;
  findPlayer: (
    state: CriticalState,
    playerId: string,
  ) => CriticalPlayerState | undefined;
  dispatchCard?: (
    state: CriticalState,
    playerId: string,
    card: CriticalCard,
    targetPlayerId?: string,
  ) => GameActionResult<CriticalState> | null;
}
