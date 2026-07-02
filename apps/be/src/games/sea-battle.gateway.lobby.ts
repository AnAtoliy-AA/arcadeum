import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { extractString, handleError } from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import type { SeaBattleTeamConfigService } from './rooms/sea-battle-team-config.service';
import type { GamesRealtimeService } from './games.realtime.service';
import type { SeaBattleTeamConfigItemDto } from './dtos/set-team-config.dto';
import type { GameRoomSummary } from './rooms/game-rooms.types';

export type RunTeamAction = (
  client: Socket,
  context: { action: string; roomId: string; userId: string },
  failureMessage: string,
  operation: () => Promise<GameRoomSummary>,
) => Promise<void>;

export function createRunTeamAction(
  logger: { error(msg: string, trace?: string): void; warn(msg: string): void },
  realtimeService: GamesRealtimeService,
): RunTeamAction {
  return async (client, context, failureMessage, operation) => {
    try {
      const room = await operation();
      realtimeService.emitRoomUpdate(room);
      client.emit(
        'seaBattle.lobby.team_config_updated',
        maybeEncrypt({ room }),
      );
    } catch (error) {
      handleError(logger, error, context, failureMessage);
    }
  };
}

export async function handleSetTeamMode(
  runTeamAction: RunTeamAction,
  client: Socket,
  payload: { roomId?: string; userId?: string; enabled?: boolean },
  teamConfigService: SeaBattleTeamConfigService,
): Promise<void> {
  const roomId = extractString(payload, 'roomId');
  const userId = extractString(payload, 'userId');
  if (typeof payload?.enabled !== 'boolean')
    throw new WsException('enabled is required (boolean).');
  await runTeamAction(
    client,
    { action: 'set team mode', roomId, userId },
    'Unable to set team mode.',
    () =>
      payload.enabled
        ? teamConfigService.enableTeamMode(roomId, userId)
        : teamConfigService.disableTeamMode(roomId, userId),
  );
}

export async function handleSetTeamConfig(
  runTeamAction: RunTeamAction,
  client: Socket,
  payload: {
    roomId?: string;
    userId?: string;
    teams?: SeaBattleTeamConfigItemDto[];
    hideShipsFromTeammates?: boolean;
  },
  teamConfigService: SeaBattleTeamConfigService,
): Promise<void> {
  const roomId = extractString(payload, 'roomId');
  const userId = extractString(payload, 'userId');
  if (!Array.isArray(payload?.teams))
    throw new WsException('teams is required (array).');
  await runTeamAction(
    client,
    { action: 'set team config', roomId, userId },
    'Unable to set team config.',
    () =>
      teamConfigService.setTeamConfig(userId, {
        roomId,
        teams: payload.teams!,
        hideShipsFromTeammates: payload.hideShipsFromTeammates,
      }),
  );
}

export async function handleAssignTeam(
  runTeamAction: RunTeamAction,
  client: Socket,
  payload: {
    roomId?: string;
    userId?: string;
    targetUserId?: string;
    teamId?: string | null;
  },
  teamConfigService: SeaBattleTeamConfigService,
): Promise<void> {
  const roomId = extractString(payload, 'roomId');
  const userId = extractString(payload, 'userId');
  const targetUserId =
    typeof payload.targetUserId === 'string' && payload.targetUserId.trim()
      ? payload.targetUserId.trim()
      : userId;
  if (typeof payload.teamId === 'undefined')
    throw new WsException('teamId is required (string or null).');
  await runTeamAction(
    client,
    { action: 'assign team', roomId, userId },
    'Unable to assign team.',
    () =>
      teamConfigService.assignPlayerToTeam(userId, {
        roomId,
        userId: targetUserId,
        teamId: payload.teamId ?? null,
      }),
  );
}

export async function handleAddBotToTeam(
  runTeamAction: RunTeamAction,
  client: Socket,
  payload: { roomId?: string; userId?: string; teamId?: string },
  teamConfigService: SeaBattleTeamConfigService,
): Promise<void> {
  const roomId = extractString(payload, 'roomId');
  const userId = extractString(payload, 'userId');
  const teamId = extractString(payload, 'teamId');
  await runTeamAction(
    client,
    { action: 'add bot to team', roomId, userId },
    'Unable to add bot to team.',
    () => teamConfigService.addBotToTeam(userId, roomId, teamId),
  );
}

export async function handleRemoveBotFromTeam(
  runTeamAction: RunTeamAction,
  client: Socket,
  payload: { roomId?: string; userId?: string; targetUserId?: string },
  teamConfigService: SeaBattleTeamConfigService,
): Promise<void> {
  const roomId = extractString(payload, 'roomId');
  const userId = extractString(payload, 'userId');
  const targetUserId = extractString(payload, 'targetUserId');
  await runTeamAction(
    client,
    { action: 'remove bot from team', roomId, userId },
    'Unable to remove bot from team.',
    () => teamConfigService.removeBotFromTeam(userId, roomId, targetUserId),
  );
}

export async function handleToggleHideShips(
  runTeamAction: RunTeamAction,
  client: Socket,
  payload: { roomId?: string; userId?: string; enabled?: boolean },
  teamConfigService: SeaBattleTeamConfigService,
): Promise<void> {
  const roomId = extractString(payload, 'roomId');
  const userId = extractString(payload, 'userId');
  if (typeof payload?.enabled !== 'boolean')
    throw new WsException('enabled is required (boolean).');
  await runTeamAction(
    client,
    { action: 'toggle hide ships', roomId, userId },
    'Unable to toggle hide ships.',
    () => teamConfigService.toggleHideShips(userId, roomId, payload.enabled!),
  );
}
