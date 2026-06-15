/**
 * Last-Card race (Cascade call) helpers. Extracted from cascade.engine.ts to
 * keep that file under the 500-line check-file-length limit. The engine
 * passes itself as `helpers` so we can reuse its cloneState / log / draw
 * primitives without duplicating them.
 */
import type {
  GameActionContext,
  GameActionResult,
  GameLogEntry,
} from '../base/game-engine.interface';
import { GAME_PHASE, LAST_CARD_PENALTY } from './cascade.constants';
import type { CascadePlayer, CascadeState } from './cascade.types';

export interface LastCardHelpers {
  cloneState(state: CascadeState): CascadeState;
  drawIntoHand(state: CascadeState, player: CascadePlayer): unknown;
  createLogEntry(
    type: 'system' | 'action' | 'message',
    message: string,
    options?: {
      kind?: string;
      senderId?: string;
      senderName?: string;
      targetId?: string;
    },
  ): GameLogEntry;
  successResult(state: CascadeState): GameActionResult<CascadeState>;
  errorResult(error: string): GameActionResult<CascadeState>;
}

export function validateCallCascade(
  state: CascadeState,
  userId: string,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.PLAYING) {
    return { ok: false, error: 'Game is not in progress' };
  }
  if (!state.options.lastCardCallEnabled) {
    return { ok: false, error: 'Cascade call is disabled in this room' };
  }
  if (!state.lastCardWindow) {
    return { ok: false, error: 'No Cascade window is open' };
  }
  const caller = state.players.find((p) => p.playerId === userId);
  if (!caller) return { ok: false, error: 'Player not in game' };
  if (!caller.alive) return { ok: false, error: 'Player is out' };
  return { ok: true };
}

export function applyCallCascade(
  state: CascadeState,
  context: GameActionContext,
  helpers: LastCardHelpers,
): GameActionResult<CascadeState> {
  const v = validateCallCascade(state, context.userId);
  if (!v.ok) return helpers.errorResult(v.error);

  const next = helpers.cloneState(state);
  const window = next.lastCardWindow!;
  const isSelf = context.userId === window.playerId;

  if (isSelf) {
    next.lastCardWindow = null;
    next.logs.push(
      helpers.createLogEntry('action', 'called Cascade — safe', {
        senderId: context.userId,
        kind: 'cascade_self',
      }),
    );
    return helpers.successResult(next);
  }

  const victim = next.players.find((p) => p.playerId === window.playerId);
  if (!victim) {
    // At-risk player vanished (forfeited mid-window). Close cleanly.
    next.lastCardWindow = null;
    return helpers.successResult(next);
  }
  for (let i = 0; i < LAST_CARD_PENALTY; i++) {
    helpers.drawIntoHand(next, victim);
  }
  next.logs.push(
    helpers.createLogEntry(
      'action',
      `called Cascade on the silent player (+${LAST_CARD_PENALTY})`,
      {
        senderId: context.userId,
        targetId: window.playerId,
        kind: 'cascade_caught',
      },
    ),
  );
  next.lastCardWindow = null;
  return helpers.successResult(next);
}

/**
 * Open the Last-Card window when a player drops to one card. If a window is
 * already open for someone else, the previous at-risk player gets a free
 * pass — only one window may be active at a time.
 */
export function maybeOpenLastCardWindow(
  state: CascadeState,
  playerId: string,
): void {
  if (!state.options.lastCardCallEnabled) return;
  state.lastCardWindow = {
    playerId,
    openedAt: new Date().toISOString(),
  };
}

/**
 * Close the window if the at-risk player just acted on their own turn —
 * playing or drawing means they're past the window.
 */
export function closeLastCardWindowFor(
  state: CascadeState,
  playerId: string,
): void {
  if (state.lastCardWindow?.playerId === playerId) {
    state.lastCardWindow = null;
  }
}
