import type { GameActionContext } from '../../base/game-engine.interface';
import { GAME_PHASE } from './backgammon.constants';
import type { BackgammonState, MoveCheckerPayload } from './backgammon.types';
import { getAllLegalMoves } from './backgammon.utils';

export function validateRollDice(
  state: BackgammonState,
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

export function validateMoveChecker(
  state: BackgammonState,
  context: GameActionContext,
  payload: unknown,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.MOVE) {
    return { ok: false, error: 'Cannot move checkers in current phase' };
  }
  const currentTurnPlayerId = state.playerOrder[state.currentTurnIndex];
  if (context.userId !== currentTurnPlayerId) {
    return { ok: false, error: 'Not your turn to move' };
  }

  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Invalid move payload' };
  }

  const p = payload as MoveCheckerPayload;
  if (p.from === undefined || p.to === undefined) {
    return { ok: false, error: 'From and To are required' };
  }

  if (
    p.from !== 'bar' &&
    (typeof p.from !== 'number' || p.from < 0 || p.from > 23)
  ) {
    return { ok: false, error: 'Invalid from point' };
  }

  if (p.to !== 'off' && (typeof p.to !== 'number' || p.to < 0 || p.to > 23)) {
    return { ok: false, error: 'Invalid to point' };
  }

  const legalMoves = getAllLegalMoves(
    context.userId,
    state.playerOrder,
    state.points,
    state.bar,
    state.borneOff,
    state.dice,
    state.options.mode,
  );

  const matched = legalMoves.some((m) => m.from === p.from && m.to === p.to);

  if (!matched) {
    return { ok: false, error: 'Illegal move for current dice roll' };
  }

  return { ok: true };
}

export function validatePassTurn(
  state: BackgammonState,
  context: GameActionContext,
): { ok: true } | { ok: false; error: string } {
  if (state.phase !== GAME_PHASE.MOVE) {
    return { ok: false, error: 'Cannot pass turn in current phase' };
  }
  const currentTurnPlayerId = state.playerOrder[state.currentTurnIndex];
  if (context.userId !== currentTurnPlayerId) {
    return { ok: false, error: 'Not your turn to pass' };
  }

  const legalMoves = getAllLegalMoves(
    context.userId,
    state.playerOrder,
    state.points,
    state.bar,
    state.borneOff,
    state.dice,
    state.options.mode,
  );
  if (legalMoves.length > 0) {
    return { ok: false, error: 'Cannot pass while legal moves are available' };
  }

  return { ok: true };
}

export function validateForfeit(
  state: BackgammonState,
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
