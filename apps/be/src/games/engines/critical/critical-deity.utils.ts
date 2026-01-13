import { CriticalState, CriticalCard } from '../../critical/critical.state';
import { GameActionResult } from '../base/game-engine.interface';
import { EngineHelpers } from './critical-future.utils';

/**
 * Dispatcher for all Deity Pack cards.
 */
export function dispatchDeityPackAction(
  state: CriticalState,
  playerId: string,
  card: CriticalCard,
  targetPlayerId: string | undefined,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> | null {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) return null;

  // Helper to remove card and add to discard
  const playCard = () => {
    const idx = player.hand.indexOf(card);
    if (idx > -1) {
      player.hand.splice(idx, 1);
      state.discardPile.push(card);
    }
  };

  switch (card) {
    case 'omniscience':
      playCard();
      return executeOmniscience(state, playerId, helpers);
    case 'miracle':
      playCard();
      return executeMiracle(state, playerId, helpers);
    case 'smite':
      // Smite targets a player, so we need targetPlayerId
      if (!targetPlayerId)
        return { success: false, error: 'Target required for Smite' };
      playCard();
      return executeSmite(state, playerId, targetPlayerId, helpers);
    case 'rapture':
      playCard();
      return executeRapture(state, playerId, helpers);
    default:
      return null;
  }
}

/**
 * Omniscience: See everyone's hands
 */
export function executeOmniscience(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  // Public log
  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Used Omniscience to see all hands 👁️`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  // Private log with all hands
  const allHandsInfo = state.players
    .filter((p) => p.alive && p.playerId !== playerId)
    .map((p) => {
      const handStr = p.hand.join(',');
      return `${p.playerId}:${handStr}`; // format: "player1:card,card|player2:card,card"
    })
    .join('|');

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `omniscience.reveal:${allHandsInfo}`, {
      scope: 'private',
      senderId: playerId,
    }),
  );

  return { success: true, state };
}

/**
 * Miracle: Recover a card from discard pile (shuffle into hand? or pick?)
 * For simplicity and "Ah, a miracle!", let's say it recovers the last non-neutralizer card from discard into hand.
 * Or maybe it acts like a "Defuse" if you don't have one?
 * Let's implement: "Search the discard pile for a useful card (random action card) and add to hand."
 *
 * Better mechanics for "Miracle":
 * "Draw 3 cards from the bottom of the deck." (Like a blessed draw)
 * "Gain a Defuse from outside the game." (Classic miracle) -> Let's go with this. Simple and strong.
 */
export function executeMiracle(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) return { success: false, error: 'Player not found' };

  player.hand.push('neutralizer');

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Performed a Miracle and gained a Defuse! ✨`,
      {
        scope: 'all',
        senderId: playerId,
      },
    ),
  );

  return { success: true, state };
}

/**
 * Smite: Targeted Attack x3
 */
export function executeSmite(
  state: CriticalState,
  playerId: string,
  targetPlayerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  // We can reuse executeTargetedAttack but we need to make it apply 3x turns
  // The base executeTargetedAttack applies pendingDraws = 2 and advances turn.
  // We want to make it even worse.

  // Custom logic for Smite:
  // 1. Check target validity
  const target = state.players.find((p) => p.playerId === targetPlayerId);
  if (!target || !target.alive)
    return { success: false, error: 'Invalid target' };

  if (targetPlayerId === playerId)
    return { success: false, error: 'Cannot smite yourself' };

  // 2. Set turns. Targeted Attack sets '2'. Smite sets '3' or '4'. Let's go with 3.
  // We need to manually set the state because executeTargetedAttack hardcodes 2 probably.
  // Actually, executeTargetedAttack might not be exported or easily modifiable 'amount'.
  // Let's implement custom logic here to be safe.

  // End current turn (no draw for current player)
  state.pendingDraws = 0;

  // Move turn to target
  const targetIndex = state.playerOrder.indexOf(targetPlayerId);
  state.currentTurnIndex = targetIndex;

  // Set their pending draws
  state.pendingDraws = 3;

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `SMITED ${targetPlayerId}! They must take 3 turns! ⚡`,
      {
        scope: 'all',
        senderId: playerId,
      },
    ),
  );

  return { success: true, state };
}

/**
 * Rapture: All other players give you 1 card.
 */
export function executeRapture(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) return { success: false, error: 'Player not found' };

  const victims = state.players.filter(
    (p) => p.playerId !== playerId && p.alive && p.hand.length > 0,
  );

  if (victims.length === 0) {
    helpers.addLog(
      state,
      helpers.createLogEntry(
        'action',
        `Called for Rapture, but no one had cards to give.`,
        {
          scope: 'all',
          senderId: playerId,
        },
      ),
    );
    return { success: true, state };
  }

  // Take 1 random card from each victim
  victims.forEach((victim) => {
    const randomIndex = Math.floor(Math.random() * victim.hand.length);
    const stolenCard = victim.hand.splice(randomIndex, 1)[0];
    player.hand.push(stolenCard);

    helpers.addLog(
      state,
      helpers.createLogEntry('action', `gave a card to ${playerId} (Rapture)`, {
        scope: 'private',
        senderId: victim.playerId,
      }),
    );
  });

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Triggered the Rapture! Received a card from everyone. 🎺`,
      {
        scope: 'all',
        senderId: playerId,
      },
    ),
  );

  return { success: true, state };
}
