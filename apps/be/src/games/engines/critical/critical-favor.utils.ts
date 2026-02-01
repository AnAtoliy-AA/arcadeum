import {
  CriticalState,
  CriticalCard,
  CriticalPlayerState,
} from '../../critical/critical.state';
import { GameActionResult, GameLogEntry } from '../base/game-engine.interface';
import { LogEntryOptions } from './critical-logic.utils';

/**
 * Helper to find a player in the state
 */
function findPlayer(
  state: CriticalState,
  playerId: string,
): CriticalPlayerState | undefined {
  return state.players.find(
    (p) => p.playerId === playerId,
  ) as CriticalPlayerState;
}

/**
 * Execute Favor - Step 1: Player plays favor card, target must give a card
 * Sets pendingFavor state, target player will need to respond with give_favor_card action
 */
export function executeFavor(
  state: CriticalState,
  playerId: string,
  payload: { targetPlayerId: string },
  helpers: {
    addLog: (state: CriticalState, entry: GameLogEntry) => void;
    createLogEntry: (
      type: string,
      message: string,
      options?: LogEntryOptions,
    ) => GameLogEntry;
  },
): GameActionResult<CriticalState> {
  const player = findPlayer(state, playerId);
  const target = findPlayer(state, payload.targetPlayerId);

  if (!player || !target) return { success: false, error: 'Player not found' };

  // Check target has cards
  if (target.hand.length === 0)
    return { success: false, error: 'Target has no cards' };

  // Remove favor card from player
  const favorIndex = player.hand.indexOf('trade');
  if (favorIndex === -1)
    return { success: false, error: 'Favor card not found' };

  player.hand.splice(favorIndex, 1);
  state.discardPile.push('trade');

  // Set pending favor - target must now choose a card to give
  state.pendingFavor = {
    requesterId: playerId,
    targetId: payload.targetPlayerId,
  };

  // Set pending action so it can be noped
  state.pendingAction = {
    type: 'trade',
    playerId,
    payload: { targetPlayerId: payload.targetPlayerId },
    nopeCount: 0,
  };

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Requested a favor - waiting for response`,
      { scope: 'all', senderId: playerId },
    ),
  );

  return { success: true, state };
}

/**
 * Execute Give Favor Card - Step 2: Target gives a card of their choice
 */
export function executeGiveFavorCard(
  state: CriticalState,
  playerId: string,
  payload: { cardToGive: CriticalCard },
  helpers: {
    addLog: (state: CriticalState, entry: GameLogEntry) => void;
    createLogEntry: (
      type: string,
      message: string,
      options?: LogEntryOptions,
    ) => GameLogEntry;
  },
): GameActionResult<CriticalState> {
  if (!state.pendingFavor) return { success: false, error: 'No pending favor' };

  if (state.pendingFavor.targetId !== playerId)
    return { success: false, error: 'Not your favor to give' };

  const target = findPlayer(state, playerId);
  const requester = findPlayer(state, state.pendingFavor.requesterId);

  if (!target || !requester)
    return { success: false, error: 'Player not found' };

  // Check target has the card
  const cardIndex = target.hand.indexOf(payload.cardToGive);
  if (cardIndex === -1) return { success: false, error: 'Card not in hand' };

  // Transfer the card
  target.hand.splice(cardIndex, 1);
  requester.hand.push(payload.cardToGive);

  // Clear pending favor
  state.pendingFavor = null;

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Gave a card as favor`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  return { success: true, state };
}
