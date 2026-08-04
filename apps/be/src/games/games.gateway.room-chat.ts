import type { Logger } from '@nestjs/common';
import type { Socket, Server } from 'socket.io';
import { extractString } from './games.gateway.utils';
import {
  maybeEncrypt,
  maybeDecrypt,
} from '../common/utils/socket-encryption.util';
import type { GamesService } from './games.service';
import type { GamesRealtimeService } from './games.realtime.service';

function validateUserId(
  logger: Logger,
  client: Socket,
  payloadUserId: string,
): void {
  const authUserId = (client.data as Record<string, unknown>)?.userId as
    | string
    | undefined;
  const isAuthenticated =
    (client.data as Record<string, unknown>)?.authenticated === true;
  const anonId = (client.data as Record<string, unknown>)?.anonId as
    | string
    | undefined;

  if (isAuthenticated && authUserId && payloadUserId !== authUserId) {
    logger.warn(
      `User ${authUserId} attempted to act as ${payloadUserId} — blocking`,
    );
    return;
  }

  if (!isAuthenticated && anonId && payloadUserId !== anonId) {
    logger.warn(
      `Anonymous ${anonId} attempted to act as ${payloadUserId} — blocking`,
    );
    return;
  }
}

export async function handleRoomChat(
  logger: Logger,
  server: Server,
  client: Socket,
  realtime: GamesRealtimeService,
  gamesService: GamesService,
  payload: Record<string, unknown>,
): Promise<void> {
  const decrypted = maybeDecrypt<{
    roomId?: string;
    userId?: string;
    message?: string;
    scope?: string;
  }>(payload);

  const roomId = extractString(decrypted, 'roomId');
  const userId = extractString(decrypted, 'userId');
  const message = extractString(decrypted, 'message');
  const scopeRaw =
    typeof decrypted?.scope === 'string'
      ? decrypted.scope.trim().toLowerCase()
      : 'all';
  const scope = ['players', 'private', 'team'].includes(scopeRaw)
    ? scopeRaw
    : 'all';

  validateUserId(logger, client, userId);

  const channel = realtime.roomChannel(roomId);
  if (!client.rooms.has(channel)) return;

  let senderName = '';
  try {
    const room = await gamesService.getRoom(roomId);
    senderName =
      room.members?.find((m) => m.id === userId)?.displayName ?? '';
  } catch {
    // ignore — senderName stays empty
  }

  const entry = await gamesService.postRoomChat(
    roomId,
    userId,
    senderName,
    message,
    scope,
  );

  if (entry) {
    server.to(channel).emit('games.room.chat', maybeEncrypt(entry));
    client.emit(
      'games.room.chat.ack',
      maybeEncrypt({ roomId, userId, scope }),
    );
  }
}

export async function handleDeleteRoomChat(
  logger: Logger,
  server: Server,
  client: Socket,
  realtime: GamesRealtimeService,
  gamesService: GamesService,
  payload: Record<string, unknown>,
): Promise<void> {
  const decrypted = maybeDecrypt<{
    roomId?: string;
    userId?: string;
    messageId?: string;
  }>(payload);

  const roomId = extractString(decrypted, 'roomId');
  const userId = extractString(decrypted, 'userId');
  const messageId = extractString(decrypted, 'messageId');

  validateUserId(logger, client, userId);

  const channel = realtime.roomChannel(roomId);
  if (!client.rooms.has(channel)) return;

  const deleted = await gamesService.deleteRoomChatMessage(
    roomId,
    userId,
    messageId,
  );

  if (deleted) {
    server
      .to(channel)
      .emit('games.room.delete_chat', maybeEncrypt({ messageId }));
  }
}
