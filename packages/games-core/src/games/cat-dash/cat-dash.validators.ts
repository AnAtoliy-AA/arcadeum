import type { CatDashState, CatDashPlayer } from './cat-dash.types';

export function validateRollDice(
  state: CatDashState,
  player: CatDashPlayer,
): boolean {
  if (state.gameOver) return false;
  if (state.players[state.currentPlayerIndex]?.playerId !== player.playerId)
    return false;
  return true;
}

export function validateUseAbility(
  state: CatDashState,
  player: CatDashPlayer,
  abilityId?: string,
): boolean {
  if (state.gameOver) return false;
  if (state.players[state.currentPlayerIndex]?.playerId !== player.playerId)
    return false;
  if (!abilityId) return false;
  if (player.abilitiesUsed.includes(abilityId)) return false;
  if (player.powerTokens <= 0) return false;
  return true;
}

export function validateChoosePath(
  state: CatDashState,
  player: CatDashPlayer,
  pathIndex?: number,
): boolean {
  if (state.gameOver) return false;
  if (state.players[state.currentPlayerIndex]?.playerId !== player.playerId)
    return false;
  if (typeof pathIndex !== 'number') return false;
  if (pathIndex < 0 || pathIndex > 2) return false;
  return true;
}

export function validateForfeit(
  state: CatDashState,
  player: CatDashPlayer,
): boolean {
  if (state.gameOver) return false;
  return state.players.some((p) => p.playerId === player.playerId);
}
