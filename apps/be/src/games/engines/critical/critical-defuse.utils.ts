import {
  CriticalState,
  CriticalPlayerState,
} from '../../critical/critical.state';
import { GameActionResult, GameLogEntry } from '../base/game-engine.interface';
import { LogEntryOptions } from './critical-logic.utils';

/**
 * Execute Defuse — insert exploding cat back in deck and advance turn
 */
export function executeDefuse(
  state: CriticalState,
  playerId: string,
  position: number,
  findPlayer: (
    state: CriticalState,
    playerId: string,
  ) => CriticalPlayerState | undefined,
  helpers: {
    addLog: (state: CriticalState, entry: GameLogEntry) => void;
    createLogEntry: (
      type: string,
      message: string,
      options?: LogEntryOptions,
    ) => GameLogEntry;
    advanceTurn: (state: CriticalState) => void;
  },
): GameActionResult<CriticalState> {
  const player = findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  const defuseIndex = player.hand.indexOf('neutralizer');
  if (defuseIndex === -1)
    return { success: false, error: 'Defuse card not found' };

  player.hand.splice(defuseIndex, 1);
  state.discardPile.push('neutralizer');

  state.deck.splice(position, 0, 'critical_event');
  state.pendingDefuse = null;

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Defused an Exploding Cat!`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  helpers.advanceTurn(state);

  return { success: true, state };
}
