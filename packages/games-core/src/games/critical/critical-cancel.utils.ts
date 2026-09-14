import type { CriticalState, CriticalCard } from './critical.state';
import type {
  GameLogEntry,
  GameActionResult,
} from '../../base/game-engine.interface';
import { CriticalLogic } from './critical-logic.utils';
import { LogEntryOptions } from './critical-shared.types';

type CancelHelpers = {
  addLog: (state: CriticalState, entry: GameLogEntry) => void;
  createLogEntry: (
    type: string,
    message: string,
    options?: LogEntryOptions,
  ) => GameLogEntry;
  advanceTurn: (state: CriticalState) => void;
  shuffleArray: <T>(array: T[]) => void;
};

type PendingAction = NonNullable<CriticalState['pendingAction']>;

// ── Cancel handlers (reverse the action) ────────────────────────────

const cancelHandlers: Record<
  string,
  (state: CriticalState, action: PendingAction, helpers: CancelHelpers) => void
> = {
  strike(state, action) {
    const attackerIndex = state.playerOrder.findIndex(
      (id) => id === action.playerId,
    );
    if (attackerIndex !== -1) {
      state.currentTurnIndex = attackerIndex;
      const payload = action.payload as { previousPendingDraws?: number };
      state.pendingDraws = payload?.previousPendingDraws ?? 1;
    }
  },
  targeted_strike(state, action) {
    const attackerIndex = state.playerOrder.findIndex(
      (id) => id === action.playerId,
    );
    if (attackerIndex !== -1) {
      state.currentTurnIndex = attackerIndex;
      const payload = action.payload as { previousPendingDraws?: number };
      state.pendingDraws = payload?.previousPendingDraws ?? 1;
    }
  },
  evade(state, action) {
    const skipperIndex = state.playerOrder.findIndex(
      (id) => id === action.playerId,
    );
    if (skipperIndex !== -1) {
      state.currentTurnIndex = skipperIndex;
      state.pendingDraws = 1;
    }
  },
  reorder(_state, _action, helpers) {
    helpers.shuffleArray(_state.deck);
  },
  trade(state) {
    state.pendingFavor = null;
  },
  smite(state, action) {
    const payload = action.payload as {
      previousTurnIndex: number;
      previousPendingDraws?: number;
    };
    state.currentTurnIndex = payload.previousTurnIndex;
    state.pendingDraws = payload?.previousPendingDraws ?? 1;
  },
  miracle(state, action) {
    const player = state.players.find((p) => p.playerId === action.playerId);
    if (player) {
      const idx = player.hand.lastIndexOf('neutralizer');
      if (idx > -1) player.hand.splice(idx, 1);
    }
  },
  rapture(state, action) {
    const payload = action.payload as {
      stolenCards: { victimId: string; card: string }[];
    };
    const rapturePlayer = state.players.find(
      (p) => p.playerId === action.playerId,
    );
    if (rapturePlayer && payload?.stolenCards) {
      for (const stolen of payload.stolenCards) {
        const idx = rapturePlayer.hand.indexOf(stolen.card as CriticalCard);
        if (idx > -1) {
          rapturePlayer.hand.splice(idx, 1);
          const victim = state.players.find(
            (p) => p.playerId === stolen.victimId,
          );
          if (victim) victim.hand.push(stolen.card as CriticalCard);
        }
      }
    }
  },
  mark(state, action) {
    const payload = action.payload as {
      targetPlayerId: string;
      cardIndex: number;
    };
    const markTarget = state.players.find(
      (p) => p.playerId === payload.targetPlayerId,
    );
    if (markTarget?.markedCards) {
      markTarget.markedCards = markTarget.markedCards.filter(
        (m) =>
          !(m.cardIndex === payload.cardIndex && m.markedBy === action.playerId),
      );
    }
  },
  steal_draw(state, action) {
    const payload = action.payload as { targetPlayerId: string };
    const stealTarget = state.players.find(
      (p) => p.playerId === payload.targetPlayerId,
    );
    if (stealTarget) {
      stealTarget.pendingStealDraw = undefined;
    }
  },
  swap_hands(state, action) {
    const payload = action.payload as {
      targetPlayerId: string;
      originalPlayerHand: string[];
      originalTargetHand: string[];
    };
    const swapInitiator = state.players.find(
      (p) => p.playerId === action.playerId,
    );
    const swapTarget = state.players.find(
      (p) => p.playerId === payload.targetPlayerId,
    );
    if (swapInitiator && swapTarget) {
      swapInitiator.hand = payload.originalPlayerHand as CriticalCard[];
      swapTarget.hand = payload.originalTargetHand as CriticalCard[];
    }
  },
  scramble(state, action) {
    const payload = action.payload as {
      handSnapshots: { playerId: string; hand: CriticalCard[] }[];
    };
    for (const snap of payload.handSnapshots) {
      const pl = state.players.find((p) => p.playerId === snap.playerId);
      if (pl) pl.hand = [...snap.hand];
    }
  },
  snatch(state, action) {
    const payload = action.payload as {
      targetPlayerId: string;
      requestedCard: string;
    };
    const snatchInitiator = state.players.find(
      (p) => p.playerId === action.playerId,
    );
    const snatchTarget = state.players.find(
      (p) => p.playerId === payload.targetPlayerId,
    );
    if (snatchInitiator && snatchTarget) {
      const cardIdx = snatchInitiator.hand.indexOf(
        payload.requestedCard as CriticalCard,
      );
      if (cardIdx > -1) {
        snatchInitiator.hand.splice(cardIdx, 1);
        snatchTarget.hand.push(payload.requestedCard as CriticalCard);
      }
    }
  },
  resurrection(state, action) {
    const payload = action.payload as { targetPlayerId: string };
    const target = state.players.find(
      (p) => p.playerId === payload.targetPlayerId,
    );
    if (target) {
      target.alive = false;
      if (!state.eliminatedPlayers) state.eliminatedPlayers = [];
      if (!state.eliminatedPlayers.includes(payload.targetPlayerId)) {
        state.eliminatedPlayers.push(payload.targetPlayerId);
      }
      const givenCards = target.hand.splice(-3);
      state.deck.push(...givenCards);
    }
  },
  judgment(state, action) {
    for (const p of state.players) {
      p.pendingJudgment = undefined;
    }
    const judgeIndex = state.playerOrder.findIndex(
      (id) => id === action.playerId,
    );
    if (judgeIndex !== -1) {
      state.currentTurnIndex = judgeIndex;
      state.pendingDraws = 1;
    }
  },
};

// ── Uncancel handlers (re-apply the action) ─────────────────────────

const uncancelHandlers: Record<
  string,
  (state: CriticalState, action: PendingAction, helpers: CancelHelpers) => void
> = {
  strike(state, action, helpers) {
    helpers.advanceTurn(state);
    const payload = action.payload as { previousPendingDraws?: number };
    const previousDraws = payload?.previousPendingDraws ?? 1;
    const extraTurns = previousDraws > 1 ? previousDraws : 0;
    state.pendingDraws = extraTurns + 2;
  },
  targeted_strike(state, action) {
    const payload = action.payload as {
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
  },
  evade(_state, _action, helpers) {
    helpers.advanceTurn(_state);
  },
  reorder(_state, _action, helpers) {
    helpers.shuffleArray(_state.deck);
  },
  trade(state, action) {
    const payload = action.payload as { targetPlayerId: string };
    state.pendingFavor = {
      requesterId: action.playerId,
      targetId: payload.targetPlayerId,
    };
  },
  smite(state, action) {
    const payload = action.payload as { targetPlayerId: string };
    const smiteTargetIndex = state.playerOrder.indexOf(payload.targetPlayerId);
    if (smiteTargetIndex !== -1) {
      state.currentTurnIndex = smiteTargetIndex;
      state.pendingDraws = 3;
    }
  },
  miracle(state, action) {
    const player = state.players.find((p) => p.playerId === action.playerId);
    if (player) {
      player.hand.push('neutralizer');
    }
  },
  rapture(state, action) {
    const payload = action.payload as {
      stolenCards: { victimId: string; card: string }[];
    };
    const rapturePlayer = state.players.find(
      (p) => p.playerId === action.playerId,
    );
    if (rapturePlayer && payload?.stolenCards) {
      for (const stolen of payload.stolenCards) {
        const victim = state.players.find(
          (p) => p.playerId === stolen.victimId,
        );
        if (victim) {
          const idx = victim.hand.indexOf(stolen.card as CriticalCard);
          if (idx > -1) {
            victim.hand.splice(idx, 1);
            rapturePlayer.hand.push(stolen.card as CriticalCard);
          }
        }
      }
    }
  },
  mark(state, action) {
    const payload = action.payload as {
      targetPlayerId: string;
      cardIndex: number;
    };
    const markTarget = state.players.find(
      (p) => p.playerId === payload.targetPlayerId,
    );
    if (markTarget) {
      if (!markTarget.markedCards) markTarget.markedCards = [];
      markTarget.markedCards.push({
        cardIndex: payload.cardIndex,
        markedBy: action.playerId,
      });
    }
  },
  steal_draw(state, action) {
    const payload = action.payload as { targetPlayerId: string };
    const stealTarget = state.players.find(
      (p) => p.playerId === payload.targetPlayerId,
    );
    if (stealTarget) {
      stealTarget.pendingStealDraw = action.playerId;
    }
  },
  swap_hands(state, action) {
    const payload = action.payload as {
      targetPlayerId: string;
      originalPlayerHand: string[];
      originalTargetHand: string[];
    };
    const swapInitiator = state.players.find(
      (p) => p.playerId === action.playerId,
    );
    const swapTarget = state.players.find(
      (p) => p.playerId === payload.targetPlayerId,
    );
    if (swapInitiator && swapTarget) {
      swapInitiator.hand = payload.originalTargetHand as CriticalCard[];
      swapTarget.hand = payload.originalPlayerHand as CriticalCard[];
    }
  },
  scramble(state, action) {
    const payload = action.payload as {
      handSnapshots: { playerId: string; hand: CriticalCard[] }[];
      direction: number;
    };
    const scrambleN = payload.handSnapshots.length;
    const scrambleDir = payload.direction ?? 1;
    const restored = payload.handSnapshots.map((s) => ({
      ...s,
      hand: [...s.hand],
    }));
    for (let i = 0; i < scrambleN; i++) {
      const sourceIndex = (i - scrambleDir + scrambleN) % scrambleN;
      const pl = state.players.find(
        (p) => p.playerId === payload.handSnapshots[i].playerId,
      );
      if (pl) pl.hand = [...restored[sourceIndex].hand];
    }
  },
  snatch(state, action) {
    const payload = action.payload as {
      targetPlayerId: string;
      requestedCard: string;
    };
    const snatchInitiator = state.players.find(
      (p) => p.playerId === action.playerId,
    );
    const snatchTarget = state.players.find(
      (p) => p.playerId === payload.targetPlayerId,
    );
    if (snatchInitiator && snatchTarget) {
      const cardIdx = snatchTarget.hand.indexOf(
        payload.requestedCard as CriticalCard,
      );
      if (cardIdx > -1) {
        snatchTarget.hand.splice(cardIdx, 1);
        snatchInitiator.hand.push(payload.requestedCard as CriticalCard);
      }
    }
  },
  resurrection(state, action) {
    const payload = action.payload as { targetPlayerId: string };
    const target = state.players.find(
      (p) => p.playerId === payload.targetPlayerId,
    );
    if (target) {
      target.alive = true;
      state.eliminatedPlayers = (state.eliminatedPlayers || []).filter(
        (id) => id !== payload.targetPlayerId,
      );
      const cardsFromBottom = state.deck.splice(-3);
      target.hand.push(...cardsFromBottom);
    }
  },
  judgment(state, action, helpers) {
    state.players.forEach((p) => {
      if (p.playerId !== action.playerId && p.alive) {
        p.pendingJudgment = true;
      }
    });
    helpers.advanceTurn(state);
  },
};

/**
 * Execute Cancel - cancels/toggles the pending action
 */
export function executeCancel(
  state: CriticalState,
  playerId: string,
  helpers: CancelHelpers,
): GameActionResult<CriticalState> {
  const player = CriticalLogic.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  if (!state.pendingAction) {
    return { success: false, error: 'No action to cancel' };
  }

  // Remove cancel card from hand
  const cancelIndex = player.hand.indexOf('cancel');
  if (cancelIndex === -1)
    return { success: false, error: 'Cancel card not found' };

  player.hand.splice(cancelIndex, 1);
  state.discardPile.push('cancel');

  // Increment cancel count (formerly nopeCount)
  state.pendingAction.nopeCount++;

  const isCanceled = state.pendingAction.nopeCount % 2 === 1;
  const actionType = state.pendingAction.type;

  // Dispatch to the appropriate handler
  if (isCanceled) {
    const handler = cancelHandlers[actionType];
    if (handler) {
      handler(state, state.pendingAction, helpers);
    }
  } else {
    const handler = uncancelHandlers[actionType];
    if (handler) {
      handler(state, state.pendingAction, helpers);
    }
  }

  const actionStatus = isCanceled ? 'canceled' : 'un-canceled';

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Played Cancel! ${actionType} is now ${actionStatus}!`,
      { scope: 'all', senderId: playerId },
    ),
  );

  return { success: true, state };
}
