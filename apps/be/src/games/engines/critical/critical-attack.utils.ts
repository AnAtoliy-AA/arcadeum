import {
  CriticalState,
  CriticalCard,
  ATTACK_PACK_CARDS,
  AttackPackCard,
} from '../../critical/critical.state';
import { GameActionResult, GameLogEntry } from '../base/game-engine.interface';
import { CriticalLogic, LogEntryOptions } from './critical-logic.utils';

/**
 * Attack Pack Cards Utility
 * Implements: Targeted Attack, Personal Attack, Attack of the Dead, Super Skip, Reverse
 */

type Helpers = {
  addLog: (state: CriticalState, entry: GameLogEntry) => void;
  createLogEntry: (
    type: string,
    message: string,
    options?: LogEntryOptions,
  ) => GameLogEntry;
  advanceTurn: (state: CriticalState) => void;
};

/**
 * Execute Targeted Attack - Choose a specific player to take 2 turns
 */
export function executeTargetedAttack(
  state: CriticalState,
  playerId: string,
  targetPlayerId: string,
  helpers: Helpers,
): GameActionResult<CriticalState> {
  const player = CriticalLogic.findPlayer(state, playerId);
  const target = CriticalLogic.findPlayer(state, targetPlayerId);

  if (!player) return { success: false, error: 'Player not found' };
  if (!target || !target.alive)
    return { success: false, error: 'Invalid target' };

  const cardIndex = player.hand.indexOf('targeted_strike');
  if (cardIndex === -1)
    return { success: false, error: 'Card not found in hand' };

  player.hand.splice(cardIndex, 1);
  state.discardPile.push('targeted_strike');

  // Capture current pending draws before advancing turn
  const currentPendingDraws = state.pendingDraws;

  // Set pending action for nope
  state.pendingAction = {
    type: 'targeted_strike',
    playerId,
    payload: { targetPlayerId, previousPendingDraws: currentPendingDraws },
    nopeCount: 0,
  };

  // Set turn to target player
  const targetIndex = state.playerOrder.indexOf(targetPlayerId);
  if (targetIndex !== -1) {
    state.currentTurnIndex = targetIndex;

    // Stacking logic: If player had multiple turns (was under attack),
    // pass them + 2 to the target player.
    const extraTurns = state.pendingDraws > 1 ? state.pendingDraws : 0;
    state.pendingDraws = extraTurns + 2;
  }

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Played Targeted Attack! Target must take ${state.pendingDraws} turns!`,
      {
        scope: 'all',
        senderId: playerId,
      },
    ),
  );

  return { success: true, state };
}

/**
 * Execute Personal Attack - Player takes 3 turns in a row
 */
export function executePersonalAttack(
  state: CriticalState,
  playerId: string,
  helpers: Helpers,
): GameActionResult<CriticalState> {
  const player = CriticalLogic.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  const cardIndex = player.hand.indexOf('private_strike');
  if (cardIndex === -1)
    return { success: false, error: 'Card not found in hand' };

  player.hand.splice(cardIndex, 1);
  state.discardPile.push('private_strike');

  // Set pending action for nope
  state.pendingAction = {
    type: 'private_strike',
    playerId,
    nopeCount: 0,
  };

  // Player must take 3 turns (draws) in a row
  state.pendingDraws = 3;

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Played Personal Attack - must take 3 turns!`,
      {
        scope: 'all',
        senderId: playerId,
      },
    ),
  );

  return { success: true, state };
}

/**
 * Execute Attack of the Dead - Next player takes 3 turns per dead player
 */
export function executeAttackOfTheDead(
  state: CriticalState,
  playerId: string,
  helpers: Helpers,
): GameActionResult<CriticalState> {
  const player = CriticalLogic.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  const cardIndex = player.hand.indexOf('recursive_strike');
  if (cardIndex === -1)
    return { success: false, error: 'Card not found in hand' };

  player.hand.splice(cardIndex, 1);
  state.discardPile.push('recursive_strike');

  const deadPlayers = state.players.filter((p) => !p.alive).length;
  const turnsToTake = Math.max(deadPlayers * 3, 1); // Minimum 1 if no dead players

  // Set pending action for nope
  state.pendingAction = {
    type: 'recursive_strike',
    playerId,
    payload: { turnsToTake },
    nopeCount: 0,
  };

  helpers.advanceTurn(state);
  state.pendingDraws = turnsToTake;

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Played Attack of the Dead! Next player takes ${turnsToTake} turns!`,
      { scope: 'all', senderId: playerId },
    ),
  );

  return { success: true, state };
}

/**
 * Execute Super Skip - End ALL remaining turns without drawing
 */
export function executeSuperSkip(
  state: CriticalState,
  playerId: string,
  helpers: Helpers,
): GameActionResult<CriticalState> {
  const player = CriticalLogic.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  const cardIndex = player.hand.indexOf('mega_evade');
  if (cardIndex === -1)
    return { success: false, error: 'Card not found in hand' };

  player.hand.splice(cardIndex, 1);
  state.discardPile.push('mega_evade');

  // Set pending action for nope
  state.pendingAction = {
    type: 'mega_evade',
    playerId,
    payload: { previousPendingDraws: state.pendingDraws },
    nopeCount: 0,
  };

  // Clear ALL pending draws and advance turn
  state.pendingDraws = 0;
  helpers.advanceTurn(state);

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Played Super Skip - skipped all turns!`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  return { success: true, state };
}

/**
 * Execute Reverse - Reverse play direction and end turn
 */
export function executeReverse(
  state: CriticalState,
  playerId: string,
  helpers: Helpers,
): GameActionResult<CriticalState> {
  const player = CriticalLogic.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  const cardIndex = player.hand.indexOf('invert');
  if (cardIndex === -1)
    return { success: false, error: 'Card not found in hand' };

  player.hand.splice(cardIndex, 1);
  state.discardPile.push('invert');

  // Set pending action for nope
  state.pendingAction = {
    type: 'invert',
    playerId,
    payload: { previousDirection: state.playDirection },
    nopeCount: 0,
  };

  // Reverse play direction
  state.playDirection = state.playDirection === 1 ? -1 : 1;

  // Advance turn (which will now go in opposite direction)
  helpers.advanceTurn(state);

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Played Reverse - direction changed!`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  return { success: true, state };
}

// Check if a card is an Attack Pack card
export function isAttackPackCard(card: CriticalCard): boolean {
  return ATTACK_PACK_CARDS.includes(card as AttackPackCard);
}
