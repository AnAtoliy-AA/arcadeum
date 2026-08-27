/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  getActiveTeam,
  getActiveShooterId,
  getTeamForPlayer,
  arePlayersOnSameTeam,
  isTeamAlive,
  countAliveTeams,
  normalizeTeamShooterAfterDeath,
  healStuckTeamRotation,
  advanceTeamRotationOnMiss,
} from '@arcadeum/games-core/games/sea-battle/team-rotation.utils';
