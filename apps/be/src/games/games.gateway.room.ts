import type { Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket, Server } from 'socket.io';
import type { GamesService } from './games.service';
import type { GamesRealtimeService } from './games.realtime.service';
import { extractRoomAndUser, extractString } from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';

export async function handleJoinRoom(
  logger: Logger,
  server: Server,
  client: Socket,
  realtime: GamesRealtimeService,
  gamesService: GamesService,
  payload: {
    roomId?: string;
    userId?: string;
    inviteCode?: string;
    prevAnonId?: string;
  },
  validateUserId: (client: Socket, userId: string) => void,
): Promise<void> {
  const roomId =
    typeof payload?.roomId === 'string' ? payload.roomId.trim() : '';
  const userId =
    typeof payload?.userId === 'string' ? payload.userId.trim() : '';

  if (!roomId) {
    throw new WsException('roomId is required.');
  }
  if (!userId) {
    throw new WsException('userId is required.');
  }
  validateUserId(client, userId);
  const inviteCode =
    typeof payload?.inviteCode === 'string'
      ? payload.inviteCode.trim()
      : undefined;
  const prevAnonId =
    typeof payload?.prevAnonId === 'string'
      ? payload.prevAnonId.trim()
      : undefined;
  logger.log(`User ${userId} joining room ${roomId}`);
  try {
    const { room, session } = await gamesService.joinRoom(
      { roomId, inviteCode },
      userId,
      prevAnonId,
    );

    logger.log(
      `Room ${roomId}: status=${room.status}, session=${
        session ? session.id : 'null'
      }`,
    );

    const channel = realtime.roomChannel(room.id);
    await client.join(channel);

    if (!client.data) {
      client.data = {};
    }
    if (!(client.data as Record<string, unknown>).userId) {
      (client.data as Record<string, unknown>).userId = userId;
    }
    realtime.trackSocket(userId, client.id);

    let diffSession = session;
    if (session) {
      try {
        const sanitizedState = await gamesService.getSanitizedState(
          session.id,
          userId,
        );
        if (sanitizedState && typeof sanitizedState === 'object') {
          diffSession = {
            ...session,
            state: sanitizedState as Record<string, unknown>,
          };
        }
      } catch (error) {
        logger.error(
          `Failed to get sanitized state for user ${userId}: ${error}`,
        );
      }
    }

    client.emit(
      'games.room.joined',
      maybeEncrypt({
        room,
        session: diffSession,
      }),
    );

    if (diffSession) {
      logger.log(
        `Sending session snapshot to client for session ${diffSession.id}`,
      );
      realtime.emitSessionSnapshotToClient(client, room.id, diffSession);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to join room';
    logger.error(`Failed to join room ${roomId}: ${message}`);
    throw new WsException(message);
  }
}

export async function handleLeaveRoom(
  logger: Logger,
  client: Socket,
  realtime: GamesRealtimeService,
  gamesService: GamesService,
  payload: { roomId?: string; userId?: string },
  validateUserId: (client: Socket, userId: string) => void,
): Promise<{ success: boolean }> {
  const roomId = extractString(payload, 'roomId');
  const userId = extractString(payload, 'userId');

  if (!roomId) throw new WsException('roomId is required.');
  if (!userId) throw new WsException('userId is required.');

  validateUserId(client, userId);
  logger.log(`User ${userId} leaving room ${roomId}`);
  try {
    const result = await gamesService.leaveRoom({ roomId }, userId);

    const channel = realtime.roomChannel(roomId);
    await client.leave(channel);
    const specChannel = realtime.spectatorChannel(roomId);
    await client.leave(specChannel);
    if (result.deleted) {
      realtime.emitRoomDeleted(roomId);
    } else {
      realtime.emitPlayerLeft(result.room, userId, false);
    }

    client.emit('games.room.left', maybeEncrypt({ roomId }));
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to leave room';
    logger.error(`Failed to leave room ${roomId}: ${message}`);
    return { success: false };
  }
}

export async function handleKickPlayer(
  logger: Logger,
  server: Server,
  client: Socket,
  realtime: GamesRealtimeService,
  gamesService: GamesService,
  payload: { roomId?: string; targetUserId?: string; callerId?: string },
  validateUserId: (client: Socket, userId: string) => void,
): Promise<{ success: boolean }> {
  const roomId = extractString(payload, 'roomId');
  const targetUserId = extractString(payload, 'targetUserId');
  const callerId = extractString(payload, 'callerId');

  if (!roomId) throw new WsException('roomId is required.');
  if (!targetUserId) throw new WsException('targetUserId is required.');
  if (!callerId) throw new WsException('callerId is required.');

  validateUserId(client, callerId);
  logger.log(
    `Host ${callerId} kicking user ${targetUserId} from room ${roomId}`,
  );

  try {
    await gamesService.leaveRoom({ roomId, kickedBy: callerId }, targetUserId);

    const channel = realtime.roomChannel(roomId);
    server
      .to(channel)
      .emit('games.room.kicked', maybeEncrypt({ roomId, targetUserId }));

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to kick player';
    logger.error(
      `Failed to kick user ${targetUserId} from room ${roomId}: ${message}`,
    );
    return { success: false };
  }
}

export async function handleWatchRoom(
  logger: Logger,
  client: Socket,
  realtime: GamesRealtimeService,
  gamesService: GamesService,
  payload: { roomId?: string },
): Promise<void> {
  const roomId = extractString(payload, 'roomId');

  try {
    const room = await gamesService.getRoom(roomId);
    const session = await gamesService.findSessionByRoom(room.id);
    const channel = realtime.spectatorChannel(room.id);
    await client.join(channel);
    const filteredSession = session
      ? realtime.filterSessionForSpectators(session)
      : null;

    client.emit(
      'games.room.watching',
      maybeEncrypt({ room, session: filteredSession }),
    );

    if (session) {
      realtime.emitSessionSnapshotToClient(client, room.id, session, true);
    }
  } catch (error) {
    const message =
      error instanceof Error && typeof error.message === 'string'
        ? error.message
        : 'Unable to spectate this room.';
    logger.warn(`Failed to register spectator for room ${roomId}: ${message}`);
    throw new WsException(message);
  }
}

export async function handleSetOption(
  logger: Logger,
  realtime: GamesRealtimeService,
  gamesService: GamesService,
  payload: {
    roomId?: string;
    userId?: string;
    options?: Record<string, unknown>;
  },
  validateUserId: (client: Socket, userId: string) => void,
  client: Socket,
): Promise<void> {
  const { roomId, userId } = extractRoomAndUser(payload);
  const options = payload?.options;

  if (!options || typeof options !== 'object') {
    throw new WsException('options object is required.');
  }
  validateUserId(client, userId);
  try {
    await gamesService.updateRoomOptions(roomId, userId, options);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update options';
    logger.warn(
      `set_option failed for room ${roomId}, user ${userId}: ${message}`,
    );
    throw new WsException(message);
  }
}
