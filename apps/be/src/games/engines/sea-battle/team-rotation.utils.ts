import type { SeaBattleState } from './sea-battle.types';

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

export function isTeamAlive(state: SeaBattleState, teamId: string): boolean {
  const team = state.teams?.find((t) => t.id === teamId);
  if (!team) return false;
  return team.playerIds.some((pid) => {
    const p = state.players.find((pp) => pp.playerId === pid);
    return !!p?.alive;
  });
}

export function countAliveTeams(state: SeaBattleState): number {
  if (!state.teamOrder) return 0;
  return state.teamOrder.filter((tid) => isTeamAlive(state, tid)).length;
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

  const n = activeTeam.playerIds.length;
  let next = activeTeam.currentShooterIndex;
  for (let step = 0; step < n; step++) {
    next = (next + 1) % n;
    const candidate = state.players.find(
      (p) => p.playerId === activeTeam.playerIds[next],
    );
    if (candidate?.alive) break;
  }
  activeTeam.currentShooterIndex = next;

  const teamCount = state.teamOrder.length;
  let nextTeam = state.currentTeamIndex;
  for (let step = 0; step < teamCount; step++) {
    nextTeam = (nextTeam + 1) % teamCount;
    if (isTeamAlive(state, state.teamOrder[nextTeam])) break;
  }
  state.currentTeamIndex = nextTeam;
}
