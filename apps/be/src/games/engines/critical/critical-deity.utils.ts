import { CriticalState, CriticalCard, CriticalPlayerState } from '../../critical/critical.state';
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
    case 'resurrection':
      playCard();
      return executeResurrection(state, playerId, helpers);
    case 'judgment':
      playCard();
      return executeJudgment(state, playerId, helpers);
    case 'prophecy':
      playCard();
      return executeProphecy(state, playerId, helpers);
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

  // Set pending action for nope
  state.pendingAction = {
    type: 'miracle',
    playerId,
    nopeCount: 0,
  };

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
  // 1. Check target validity
  const target = state.players.find((p) => p.playerId === targetPlayerId);
  if (!target || !target.alive)
    return { success: false, error: 'Invalid target' };

  if (targetPlayerId === playerId)
    return { success: false, error: 'Cannot smite yourself' };

  // Capture the previous state for nope reversal
  const previousTurnIndex = state.currentTurnIndex;
  const previousPendingDraws = state.pendingDraws;

  // End current turn (no draw for current player)
  state.pendingDraws = 0;

  // Move turn to target
  const targetIndex = state.playerOrder.indexOf(targetPlayerId);
  state.currentTurnIndex = targetIndex;

  // Set their pending draws
  state.pendingDraws = 3;

  // Set pending action for nope
  state.pendingAction = {
    type: 'smite',
    playerId,
    payload: { targetPlayerId, previousTurnIndex, previousPendingDraws },
    nopeCount: 0,
  };

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
 * Resurrection: Revive the most recently eliminated player.
 * Restores alive = true, removes from eliminatedPlayers, gives 3 cards from deck bottom.
 */
export function executeResurrection(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const player = helpers.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  if (!state.eliminatedPlayers || state.eliminatedPlayers.length === 0) {
    return { success: false, error: 'No eliminated players to resurrect' };
  }

  // Get the most recently eliminated player (last entry)
  const targetId = state.eliminatedPlayers[state.eliminatedPlayers.length - 1];
  const target = helpers.findPlayer(state, targetId);
  if (!target) return { success: false, error: 'Eliminated player not found' };

  // Revive the player
  target.alive = true;

  // Remove from eliminatedPlayers
  state.eliminatedPlayers = state.eliminatedPlayers.filter(
    (id) => id !== targetId,
  );

  // Give 3 cards from bottom of deck
  const cardsFromBottom = state.deck.splice(-3);
  target.hand.push(...cardsFromBottom);

  state.pendingAction = {
    type: 'resurrection',
    playerId,
    payload: { targetPlayerId: targetId },
    nopeCount: 0,
  };

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Played Resurrection! ${targetId} is revived with 3 cards!`,
      { scope: 'all', senderId: playerId },
    ),
  );

  return { success: true, state };
}

/**
 * Judgment: Set pendingJudgment on all other alive players.
 * Each affected player must discard down to 3 cards on their next action.
 * Current player ends turn without drawing.
 */
export function executeJudgment(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const player = helpers.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  // Set pendingJudgment on all other alive players
  state.players.forEach((p) => {
    if (p.playerId !== playerId && p.alive) {
      (p as CriticalPlayerState).pendingJudgment = true;
    }
  });

  state.pendingAction = {
    type: 'judgment',
    playerId,
    nopeCount: 0,
  };

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Played Judgment! All players must discard to 3 cards!`,
      { scope: 'all', senderId: playerId },
    ),
  );

  // End turn without drawing
  helpers.advanceTurn(state);

  return { success: true, state };
}

/**
 * Prophecy: Peek at the top 5 deck cards privately; enter pendingProphecy state.
 * The player must then commit a reorder of the top 2 via executeCommitProphecy.
 */
export function executeProphecy(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const player = helpers.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  if (state.deck.length === 0) {
    return { success: false, error: 'Deck is empty' };
  }

  const top5 = state.deck.slice(0, Math.min(5, state.deck.length)) as CriticalCard[];
  state.pendingProphecy = { playerId, top5: [...top5] };

  const cardKeys = top5.map((c) => `cards:${c}`);
  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `prophecy.reveal:${cardKeys.join(',')}`,
      { scope: 'private', senderId: playerId },
    ),
  );
  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Played Prophecy!`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  return { success: true, state };
}

/**
 * CommitProphecy: Accepts reorderedTop2 and splices the top 2 back in chosen order.
 */
export function executeCommitProphecy(
  state: CriticalState,
  playerId: string,
  reorderedTop2: CriticalCard[],
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  if (!state.pendingProphecy || state.pendingProphecy.playerId !== playerId) {
    return { success: false, error: 'No pending prophecy for this player' };
  }
  if (!reorderedTop2 || reorderedTop2.length !== 2) {
    return { success: false, error: 'Must provide exactly 2 cards to reorder' };
  }
  const top5 = state.pendingProphecy.top5;
  const remaining = [...top5];
  const validCards = reorderedTop2.every((c) => {
    const idx = remaining.indexOf(c);
    if (idx === -1) return false;
    remaining.splice(idx, 1);
    return true;
  });
  if (!validCards) {
    return { success: false, error: 'Provided cards are not in the top 5' };
  }

  state.deck.splice(0, 2, ...reorderedTop2);
  state.pendingProphecy = undefined;

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Committed Prophecy reorder!`, {
      scope: 'all',
      senderId: playerId,
    }),
  );
  helpers.advanceTurn(state);

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

  // Track stolen cards for potential reversal
  const stolenCards: { victimId: string; card: CriticalCard }[] = [];

  // Take 1 random card from each victim
  victims.forEach((victim) => {
    const randomIndex = Math.floor(Math.random() * victim.hand.length);
    const stolenCard = victim.hand.splice(randomIndex, 1)[0];
    player.hand.push(stolenCard);
    stolenCards.push({ victimId: victim.playerId, card: stolenCard });

    helpers.addLog(
      state,
      helpers.createLogEntry('action', `gave a card to ${playerId} (Rapture)`, {
        scope: 'private',
        senderId: victim.playerId,
      }),
    );
  });

  // Set pending action for nope
  state.pendingAction = {
    type: 'rapture',
    playerId,
    payload: { stolenCards },
    nopeCount: 0,
  };

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
