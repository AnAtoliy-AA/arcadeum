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

/**
 * Move the dying player's team off them as the active shooter so the next
 * time that team plays it picks a live teammate. Without this, an eliminated
 * player whose team is still alive can leave currentTurnIndex pointing at a
 * dead player, deadlocking the game (bot service breaks on "alive=false";
 * humans see "Waiting for <Player>...").
 *
 * No-op when the dying player isn't their team's current shooter, or when no
 * live teammate remains (the team will then fail isTeamAlive and lose).
 */
export function normalizeTeamShooterAfterDeath(
  state: SeaBattleState,
  deadPlayerId: string,
): void {
  if (!state.teams) return;
  const team = state.teams.find((t) => t.playerIds.includes(deadPlayerId));
  if (!team) return;
  if (team.playerIds[team.currentShooterIndex] !== deadPlayerId) return;

  const n = team.playerIds.length;
  let next = team.currentShooterIndex;
  for (let step = 0; step < n; step++) {
    next = (next + 1) % n;
    const candidate = state.players.find(
      (p) => p.playerId === team.playerIds[next],
    );
    if (candidate?.alive) {
      team.currentShooterIndex = next;
      return;
    }
  }
}

/**
 * Self-heal: walks every team's currentShooterIndex past dead players, skips
 * past any fully-dead active team, and re-syncs currentTurnIndex with the
 * resulting active shooter. Idempotent on healthy state — safe to run before
 * every action. Recovers games whose state was saved in a stuck shape (e.g.
 * by a pre-fix server version) without needing manual intervention.
 */
export function healStuckTeamRotation(state: SeaBattleState): void {
  if (
    !state.teams ||
    !state.teamOrder ||
    state.currentTeamIndex === undefined
  ) {
    return;
  }

  // Advance each team's shooter pointer past any dead player.
  for (const team of state.teams) {
    const current = state.players.find(
      (p) => p.playerId === team.playerIds[team.currentShooterIndex],
    );
    if (current?.alive) continue;
    const n = team.playerIds.length;
    let next = team.currentShooterIndex;
    for (let step = 0; step < n; step++) {
      next = (next + 1) % n;
      const candidate = state.players.find(
        (p) => p.playerId === team.playerIds[next],
      );
      if (candidate?.alive) {
        team.currentShooterIndex = next;
        break;
      }
    }
  }

  // If the active team is fully eliminated, walk to the next alive team.
  const teamCount = state.teamOrder.length;
  let nextTeam = state.currentTeamIndex;
  for (let step = 0; step < teamCount; step++) {
    if (isTeamAlive(state, state.teamOrder[nextTeam])) break;
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
