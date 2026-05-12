import { CriticalState, CriticalCard } from '../../critical/critical.state';
import { GameActionResult } from '../base/game-engine.interface';
import { EngineHelpers } from './critical-theft.utils';

/**
 * Execute Snatch - request a specific card type from a target player.
 * If the target has the requested card, one copy moves from their hand to yours.
 */
export function executeSnatch(
  state: CriticalState,
  playerId: string,
  targetPlayerId: string,
  requestedCard: CriticalCard,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const player = helpers.findPlayer(state, playerId);
  const target = helpers.findPlayer(state, targetPlayerId);

  if (!player || !player.alive || !target || !target.alive) {
    return { success: false, error: 'Invalid target' };
  }

  if (!requestedCard) {
    return { success: false, error: 'No card requested' };
  }

  const cardIndex = target.hand.indexOf(requestedCard);
  if (cardIndex === -1) {
    return { success: false, error: 'Target does not have the requested card' };
  }

  // Move card from target to player
  target.hand.splice(cardIndex, 1);
  player.hand.push(requestedCard);

  state.pendingAction = {
    type: 'snatch',
    playerId,
    payload: { targetPlayerId, requestedCard },
    nopeCount: 0,
  };

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Played Snatch!`, {
      scope: 'all',
      senderId: playerId,
      targetId: targetPlayerId,
    }),
  );

  return { success: true, state };
}
