import type { SeaBattleState } from './sea-battle.types';

// Build a playerId → alive map from state.players for O(1) lookups.
// Used in hot paths called per-action and per-broadcast.
function buildAliveMap(state: SeaBattleState): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const p of state.players) map.set(p.playerId, p.alive);
  return map;
}

export function getActiveTeam(state: SeaBattleState) {
  if (
    !state.teams ||
    !state.teamOrder ||
    state.currentTeamIndex === undefined
  ) {
    return undefined;
  }
  const teamId = state.teamOrder[state.currentTeamIndex];
  return state.teams.find((t) => t.id === teamId);
}

export function getActiveShooterId(state: SeaBattleState): string | undefined {
  const team = getActiveTeam(state);
  if (!team) return undefined;
  return team.playerIds[team.currentShooterIndex];
}

export function getTeamForPlayer(state: SeaBattleState, playerId: string) {
  return state.teams?.find((t) => t.playerIds.includes(playerId));
}

export function arePlayersOnSameTeam(
  state: SeaBattleState,
  a: string,
  b: string,
): boolean {
  if (!state.teams) return false;
  const teamA = getTeamForPlayer(state, a);
  return !!teamA && teamA.playerIds.includes(b);
}

export function isTeamAlive(
  state: SeaBattleState,
  teamId: string,
  aliveMap?: Map<string, boolean>,
): boolean {
  const team = state.teams?.find((t) => t.id === teamId);
  if (!team) return false;
  const lookup = aliveMap ?? buildAliveMap(state);
  return team.playerIds.some((pid) => lookup.get(pid) === true);
}

export function countAliveTeams(
  state: SeaBattleState,
  aliveMap?: Map<string, boolean>,
): number {
  if (!state.teamOrder) return 0;
  const lookup = aliveMap ?? buildAliveMap(state);
  return state.teamOrder.filter((tid) => isTeamAlive(state, tid, lookup))
    .length;
}

export function normalizeTeamShooterAfterDeath(
  state: SeaBattleState,
  deadPlayerId: string,
): void {
  if (!state.teams) return;
  const team = state.teams.find((t) => t.playerIds.includes(deadPlayerId));
  if (!team) return;
  if (team.playerIds[team.currentShooterIndex] !== deadPlayerId) return;

  const aliveMap = buildAliveMap(state);
  const n = team.playerIds.length;
  let next = team.currentShooterIndex;
  for (let step = 0; step < n; step++) {
    next = (next + 1) % n;
    if (aliveMap.get(team.playerIds[next]) === true) {
      team.currentShooterIndex = next;
      return;
    }
  }
}

export function healStuckTeamRotation(state: SeaBattleState): void {
  if (
    !state.teams ||
    !state.teamOrder ||
    state.currentTeamIndex === undefined
  ) {
    return;
  }

  // Build player alive map once for all lookups in this function.
  const aliveMap = buildAliveMap(state);

  // Advance each team's shooter pointer past any dead player.
  for (const team of state.teams) {
    if (aliveMap.get(team.playerIds[team.currentShooterIndex]) === true)
      continue;
    const n = team.playerIds.length;
    let next = team.currentShooterIndex;
    for (let step = 0; step < n; step++) {
      next = (next + 1) % n;
      if (aliveMap.get(team.playerIds[next]) === true) {
        team.currentShooterIndex = next;
        break;
      }
    }
  }

  // If the active team is fully eliminated, walk to the next alive team.
  const teamCount = state.teamOrder.length;
  let nextTeam = state.currentTeamIndex;
  for (let step = 0; step < teamCount; step++) {
    if (isTeamAlive(state, state.teamOrder[nextTeam], aliveMap)) break;
    nextTeam = (nextTeam + 1) % teamCount;
  }
  state.currentTeamIndex = nextTeam;

  // Re-sync currentTurnIndex with whatever the resolved active shooter is.
  const shooter = getActiveShooterId(state);
  if (shooter) {
    const idx = state.playerOrder.indexOf(shooter);
    if (idx >= 0) state.currentTurnIndex = idx;
  }
}

export function advanceTeamRotationOnMiss(state: SeaBattleState): void {
  if (
    !state.teams ||
    !state.teamOrder ||
    state.currentTeamIndex === undefined
  ) {
    return;
  }
  const activeTeam = getActiveTeam(state);
  if (!activeTeam) return;

  const aliveMap = buildAliveMap(state);

  const n = activeTeam.playerIds.length;
  let next = activeTeam.currentShooterIndex;
  for (let step = 0; step < n; step++) {
    next = (next + 1) % n;
    if (aliveMap.get(activeTeam.playerIds[next]) === true) break;
  }
  activeTeam.currentShooterIndex = next;

  const teamCount = state.teamOrder.length;
  let nextTeam = state.currentTeamIndex;
  for (let step = 0; step < teamCount; step++) {
    nextTeam = (nextTeam + 1) % teamCount;
    if (isTeamAlive(state, state.teamOrder[nextTeam], aliveMap)) break;
  }
  state.currentTeamIndex = nextTeam;
}
