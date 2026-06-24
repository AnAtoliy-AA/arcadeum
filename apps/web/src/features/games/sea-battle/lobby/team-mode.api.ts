'use client';

import { gameSocket } from '@/shared/lib/socket';

interface BaseEnvelope {
  roomId: string;
  userId: string;
}

export interface TeamConfigDraft {
  id?: string;
  name: string;
  color: string;
  targetSize: number;
}

export function emitSetTeamMode(
  env: BaseEnvelope & { enabled: boolean },
): void {
  gameSocket.emit('seaBattle.lobby.set_team_mode', env);
}

export function emitSetTeamConfig(
  env: BaseEnvelope & {
    teams: TeamConfigDraft[];
    hideShipsFromTeammates?: boolean;
    maxTotalPlayers?: number;
  },
): void {
  gameSocket.emit('seaBattle.lobby.set_team_config', env);
}

export function emitAssignTeam(
  env: BaseEnvelope & { targetUserId?: string; teamId: string | null },
): void {
  gameSocket.emit('seaBattle.lobby.assign_team', env);
}

export function emitAddBotToTeam(env: BaseEnvelope & { teamId: string }): void {
  gameSocket.emit('seaBattle.lobby.add_bot_to_team', env);
}

export function emitRemoveBotFromTeam(
  env: BaseEnvelope & { targetUserId: string },
): void {
  gameSocket.emit('seaBattle.lobby.remove_bot_from_team', env);
}

export function emitToggleHideShips(
  env: BaseEnvelope & { enabled: boolean },
): void {
  gameSocket.emit('seaBattle.lobby.toggle_hide_ships', env);
}
