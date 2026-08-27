import { GAME_PHASE, PENDING } from './cascade.constants';
import type {
  CascadeState,
  NameColorPayload,
  PlayCardPayload,
} from './cascade.types';
import { isActiveColor, isPlayable } from './cascade.utils';

export function validatePlayCard(
  state: CascadeState,
  payload: PlayCardPayload,
  userId: string,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.PLAYING) {
    return { ok: false, error: 'Game is not in progress' };
  }
  if (state.pendingAction !== PENDING.NONE) {
    return { ok: false, error: 'Resolve the pending color choice first' };
  }
  if (state.playerOrder[state.currentTurnIndex] !== userId) {
    return { ok: false, error: 'Not your turn' };
  }

  const player = state.players.find((p) => p.playerId === userId);
  if (!player) return { ok: false, error: 'Player not in game' };
  const card = player.hand.find((c) => c.id === payload?.cardId);
  if (!card) return { ok: false, error: 'Card not in hand' };

  if (
    !isPlayable(
      card,
      state.topCard,
      state.activeColor,
      state.pendingDraw,
      state.pendingStackKind,
    )
  ) {
    return { ok: false, error: 'Card is not playable on the current top' };
  }

  if (card.kind === 'WILD' || card.kind === 'WILD_DRAW_FOUR') {
    if (!isActiveColor(payload.chosenColor)) {
      return { ok: false, error: 'A color must be chosen for a wild card' };
    }
  }

  return { ok: true };
}

export function validateDraw(
  state: CascadeState,
  userId: string,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.PLAYING) {
    return { ok: false, error: 'Game is not in progress' };
  }
  if (state.pendingAction !== PENDING.NONE) {
    return { ok: false, error: 'Resolve the pending color choice first' };
  }
  if (state.playerOrder[state.currentTurnIndex] !== userId) {
    return { ok: false, error: 'Not your turn' };
  }
  return { ok: true };
}

export function validateNameColor(
  state: CascadeState,
  payload: NameColorPayload,
  userId: string,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.PLAYING) {
    return { ok: false, error: 'Game is not in progress' };
  }
  if (state.pendingAction === PENDING.NONE) {
    return { ok: false, error: 'No pending color choice' };
  }
  if (state.playerOrder[state.currentTurnIndex] !== userId) {
    return { ok: false, error: 'Not your turn' };
  }
  if (!isActiveColor(payload?.color)) {
    return { ok: false, error: 'Invalid color' };
  }
  return { ok: true };
}

export function validateForfeit(
  state: CascadeState,
  userId: string,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.PLAYING) {
    return { ok: false, error: 'Game is not in progress' };
  }
  const player = state.players.find((p) => p.playerId === userId);
  if (!player) return { ok: false, error: 'Player not in game' };
  if (!player.alive) return { ok: false, error: 'Player already out' };
  return { ok: true };
}
