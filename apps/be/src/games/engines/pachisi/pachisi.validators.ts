import type { GameActionContext } from '../base/game-engine.interface';
import { GAME_PHASE } from './pachisi.constants';
import type { MoveTokenPayload, PachisiState } from './pachisi.types';
import { getAllLegalMoves, tokensByPlayer } from './pachisi.utils';

export function validateRollDice(
  state: PachisiState,
  context: GameActionContext,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.ROLL) {
    return { ok: false, error: 'Cannot roll dice in current phase' };
  }
  const currentTurnPlayerId = state.playerOrder[state.currentTurnIndex];
  if (context.userId !== currentTurnPlayerId) {
    return { ok: false, error: 'Not your turn to roll' };
  }
  return { ok: true };
}

export function validateMoveToken(
  state: PachisiState,
  context: GameActionContext,
  payload: unknown,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.MOVE) {
    return { ok: false, error: 'Cannot move tokens in current phase' };
  }
  const currentTurnPlayerId = state.playerOrder[state.currentTurnIndex];
  if (context.userId !== currentTurnPlayerId) {
    return { ok: false, error: 'Not your turn to move' };
  }

  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Invalid move payload' };
  }
  const p = payload as MoveTokenPayload;
  if (typeof p.tokenId !== 'number') {
    return { ok: false, error: 'tokenId is required' };
  }
  if (!tokensByPlayer(state, context.userId).some((t) => t.id === p.tokenId)) {
    return { ok: false, error: 'Unknown token for this player' };
  }
  const legal = getAllLegalMoves(state, context.userId);
  if (!legal.some((m) => m.tokenId === p.tokenId)) {
    return { ok: false, error: 'Illegal move for current die roll' };
  }
  return { ok: true };
}

export function validatePassTurn(
  state: PachisiState,
  context: GameActionContext,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.MOVE) {
    return { ok: false, error: 'Cannot pass turn in current phase' };
  }
  const currentTurnPlayerId = state.playerOrder[state.currentTurnIndex];
  if (context.userId !== currentTurnPlayerId) {
    return { ok: false, error: 'Not your turn to pass' };
  }
  const legal = getAllLegalMoves(state, context.userId);
  if (legal.length > 0) {
    return { ok: false, error: 'Cannot pass while legal moves are available' };
  }
  return { ok: true };
}

export function validateForfeit(
  state: PachisiState,
  context: GameActionContext,
): { ok: true } | { ok: false; error: string } {
  if (state.phase === GAME_PHASE.GAME_OVER) {
    return { ok: false, error: 'Game is already over' };
  }
  const player = state.players.find((p) => p.playerId === context.userId);
  if (!player || !player.alive) {
    return { ok: false, error: 'Player cannot forfeit' };
  }
  return { ok: true };
}
