import type { CriticalState } from '../../critical/critical.state';
import type {
  GameLogEntry,
  GameActionResult,
} from '../base/game-engine.interface';
import { CriticalLogic, LogEntryOptions } from './critical-logic.utils';

/**
 * Execute Nope - cancels/toggles the pending action
 */
export function executeNope(
  state: CriticalState,
  playerId: string,
  helpers: {
    addLog: (state: CriticalState, entry: GameLogEntry) => void;
    createLogEntry: (
      type: string,
      message: string,
      options?: LogEntryOptions,
    ) => GameLogEntry;
    advanceTurn: (state: CriticalState) => void;
    shuffleArray: <T>(array: T[]) => void;
  },
): GameActionResult<CriticalState> {
  const player = CriticalLogic.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  if (!state.pendingAction) {
    return { success: false, error: 'No action to nope' };
  }

  // Remove nope card from hand
  const nopeIndex = player.hand.indexOf('nope');
  if (nopeIndex === -1) return { success: false, error: 'Nope card not found' };

  player.hand.splice(nopeIndex, 1);
  state.discardPile.push('nope');

  // Increment nope count
  state.pendingAction.nopeCount++;

  const isCanceled = state.pendingAction.nopeCount % 2 === 1;

  // Toggle the effect based on whether action is now canceled or un-canceled
  if (isCanceled) {
    // Cancel the action - reverse effects
    switch (state.pendingAction.type) {
      case 'attack': {
        // Attack was: advance turn, set pendingDraws = turns + 2
        // Reverse: go back to attacker's turn, restore pendingDraws
        const attackerIndex = state.playerOrder.findIndex(
          (id) => id === state.pendingAction!.playerId,
        );
        if (attackerIndex !== -1) {
          state.currentTurnIndex = attackerIndex;
          const payload = state.pendingAction.payload as {
            previousPendingDraws?: number;
          };
          state.pendingDraws = payload?.previousPendingDraws ?? 1;
        }
        break;
      }
      case 'targeted_attack': {
        // Targeted Attack was: move turn to target, set pendingDraws = turns + 2
        // Reverse: go back to attacker's turn, restore pendingDraws
        const attackerIndex = state.playerOrder.findIndex(
          (id) => id === state.pendingAction!.playerId,
        );
        if (attackerIndex !== -1) {
          state.currentTurnIndex = attackerIndex;
          const payload = state.pendingAction.payload as {
            previousPendingDraws?: number;
          };
          // For Targeted Attack, the attacker (now active again) likely had 1 draw (normal turn)
          // or more (if they were under attack but played targeted attack to pass it).
          // We restore whatever valid draws they had.
          state.pendingDraws = payload?.previousPendingDraws ?? 1;
        }
        break;
      }
      case 'skip': {
        // Skip was: advance turn
        // Reverse: go back to skipper's turn
        const skipperIndex = state.playerOrder.findIndex(
          (id) => id === state.pendingAction!.playerId,
        );
        if (skipperIndex !== -1) {
          state.currentTurnIndex = skipperIndex;
          state.pendingDraws = 1;
        }
        break;
      }
      case 'shuffle':
        // Shuffle can't really be undone, but we can re-shuffle
        helpers.shuffleArray(state.deck);
        break;
      case 'favor':
        // Cancel pending favor request
        state.pendingFavor = null;
        break;
    }
  } else {
    // Un-cancel the action - re-apply effects
    switch (state.pendingAction.type) {
      case 'attack': {
        helpers.advanceTurn(state);
        const payload = state.pendingAction.payload as {
          previousPendingDraws?: number;
        };
        const previousDraws = payload?.previousPendingDraws ?? 1;
        const extraTurns = previousDraws > 1 ? previousDraws : 0;
        state.pendingDraws = extraTurns + 2;
        break;
      }
      case 'targeted_attack': {
        const payload = state.pendingAction.payload as {
          previousPendingDraws?: number;
          targetPlayerId: string;
        };
        const targetIndex = state.playerOrder.indexOf(payload.targetPlayerId);
        if (targetIndex !== -1) {
          state.currentTurnIndex = targetIndex;
          const previousDraws = payload?.previousPendingDraws ?? 1;
          const extraTurns = previousDraws > 1 ? previousDraws : 0;
          state.pendingDraws = extraTurns + 2;
        }
        break;
      }
      case 'skip':
        helpers.advanceTurn(state);
        break;
      case 'shuffle':
        helpers.shuffleArray(state.deck);
        break;
      case 'favor': {
        // Restore pending favor request
        const favorPayload = state.pendingAction.payload as {
          targetPlayerId: string;
        };
        state.pendingFavor = {
          requesterId: state.pendingAction.playerId,
          targetId: favorPayload.targetPlayerId,
        };
        break;
      }
    }
  }

  const actionStatus = isCanceled ? 'canceled' : 'un-canceled';

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Played Nope! ${state.pendingAction.type} is now ${actionStatus}!`,
      { scope: 'all', senderId: playerId },
    ),
  );

  return { success: true, state };
}
