import {
  ExplodingCatsState,
  ExplodingCatsCard,
} from '../../exploding-cats/exploding-cats.state';
import { GameActionResult, GameLogEntry } from '../base/game-engine.interface';
import {
  ExplodingCatsLogic,
  LogEntryOptions,
} from './exploding-cats-logic.utils';

/**
 * Attack Pack Cards Utility
 * Implements: Targeted Attack, Personal Attack, Attack of the Dead, Super Skip, Reverse
 */

type Helpers = {
  addLog: (state: ExplodingCatsState, entry: GameLogEntry) => void;
  createLogEntry: (
    type: string,
    message: string,
    options?: LogEntryOptions,
  ) => GameLogEntry;
  advanceTurn: (state: ExplodingCatsState) => void;
};

/**
 * Execute Targeted Attack - Choose a specific player to take 2 turns
 */
export function executeTargetedAttack(
  state: ExplodingCatsState,
  playerId: string,
  targetPlayerId: string,
  helpers: Helpers,
): GameActionResult<ExplodingCatsState> {
  const player = ExplodingCatsLogic.findPlayer(state, playerId);
  const target = ExplodingCatsLogic.findPlayer(state, targetPlayerId);

  if (!player) return { success: false, error: 'Player not found' };
  if (!target || !target.alive)
    return { success: false, error: 'Invalid target' };

  const cardIndex = player.hand.indexOf('targeted_attack');
  if (cardIndex === -1)
    return { success: false, error: 'Card not found in hand' };

  player.hand.splice(cardIndex, 1);
  state.discardPile.push('targeted_attack');

  // Capture current pending draws before advancing turn
  const currentPendingDraws = state.pendingDraws;

  // Set pending action for nope
  state.pendingAction = {
    type: 'targeted_attack',
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
      },
    ),
  );

  return { success: true, state };
}

/**
 * Execute Personal Attack - Player takes 3 turns in a row
 */
export function executePersonalAttack(
  state: ExplodingCatsState,
  playerId: string,
  helpers: Helpers,
): GameActionResult<ExplodingCatsState> {
  const player = ExplodingCatsLogic.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  const cardIndex = player.hand.indexOf('personal_attack');
  if (cardIndex === -1)
    return { success: false, error: 'Card not found in hand' };

  player.hand.splice(cardIndex, 1);
  state.discardPile.push('personal_attack');

  // Set pending action for nope
  state.pendingAction = {
    type: 'personal_attack',
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
      },
    ),
  );

  return { success: true, state };
}

/**
 * Execute Attack of the Dead - Next player takes 3 turns per dead player
 */
export function executeAttackOfTheDead(
  state: ExplodingCatsState,
  playerId: string,
  helpers: Helpers,
): GameActionResult<ExplodingCatsState> {
  const player = ExplodingCatsLogic.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  const cardIndex = player.hand.indexOf('attack_of_the_dead');
  if (cardIndex === -1)
    return { success: false, error: 'Card not found in hand' };

  player.hand.splice(cardIndex, 1);
  state.discardPile.push('attack_of_the_dead');

  const deadPlayers = state.players.filter((p) => !p.alive).length;
  const turnsToTake = Math.max(deadPlayers * 3, 1); // Minimum 1 if no dead players

  // Set pending action for nope
  state.pendingAction = {
    type: 'attack_of_the_dead',
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
      { scope: 'all' },
    ),
  );

  return { success: true, state };
}

/**
 * Execute Super Skip - End ALL remaining turns without drawing
 */
export function executeSuperSkip(
  state: ExplodingCatsState,
  playerId: string,
  helpers: Helpers,
): GameActionResult<ExplodingCatsState> {
  const player = ExplodingCatsLogic.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  const cardIndex = player.hand.indexOf('super_skip');
  if (cardIndex === -1)
    return { success: false, error: 'Card not found in hand' };

  player.hand.splice(cardIndex, 1);
  state.discardPile.push('super_skip');

  // Set pending action for nope
  state.pendingAction = {
    type: 'super_skip',
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
    }),
  );

  return { success: true, state };
}

/**
 * Execute Reverse - Reverse play direction and end turn
 */
export function executeReverse(
  state: ExplodingCatsState,
  playerId: string,
  helpers: Helpers,
): GameActionResult<ExplodingCatsState> {
  const player = ExplodingCatsLogic.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  const cardIndex = player.hand.indexOf('reverse');
  if (cardIndex === -1)
    return { success: false, error: 'Card not found in hand' };

  player.hand.splice(cardIndex, 1);
  state.discardPile.push('reverse');

  // Set pending action for nope
  state.pendingAction = {
    type: 'reverse',
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
    }),
  );

  return { success: true, state };
}

// Check if a card is an Attack Pack card
export function isAttackPackCard(card: ExplodingCatsCard): boolean {
  return [
    'targeted_attack',
    'personal_attack',
    'attack_of_the_dead',
    'super_skip',
    'reverse',
  ].includes(card);
}
