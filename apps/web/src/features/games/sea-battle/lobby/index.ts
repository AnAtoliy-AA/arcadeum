export { TeamSetupPanel } from './TeamSetupPanel';
export { TeamSlotsBoard } from './TeamSlotsBoard';
export type { TeamSlotsMember } from './TeamSlotsBoard';
export { UnassignedPool } from './UnassignedPool';
export type { UnassignedPoolMember } from './UnassignedPool';
export {
  emitSetTeamMode,
  emitSetTeamConfig,
  emitAssignTeam,
  emitAddBotToTeam,
  emitRemoveBotFromTeam,
  emitToggleHideShips,
  type TeamConfigDraft,
} from './team-mode.api';
export {
  MAX_TEAMS,
  MIN_TEAMS,
  MIN_TEAM_SIZE,
  MAX_TOTAL_PLAYERS,
  TEAM_DEFAULT_COLORS,
  type SeaBattleGameOptions,
  type SeaBattleTeam,
} from './team-mode.types';
