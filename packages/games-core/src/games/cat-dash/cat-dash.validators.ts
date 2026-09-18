import type { CatDashState, CatDashPlayer } from './cat-dash.types';
import { CAT_ABILITIES } from './cat-dash.constants';

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

  const catAbilities = CAT_ABILITIES[player.catId] ?? [];
  let resolvedId = abilityId;
  if (abilityId === 'ability_1' && catAbilities[0]) {
    resolvedId = catAbilities[0].id;
  } else if (abilityId === 'ability_2' && catAbilities[1]) {
    resolvedId = catAbilities[1].id;
  }

  const ability = catAbilities.find(
    (a) => a.id === resolvedId || a.id === abilityId,
  );
  if (!ability) return false;

  if (
    player.abilitiesUsed.includes(resolvedId) ||
    player.abilitiesUsed.includes(abilityId)
  ) {
    return false;
  }

  const cost = ability.cost ?? 1;
  if (player.powerTokens < cost) return false;

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
