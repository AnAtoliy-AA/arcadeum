import type { Logger } from '@nestjs/common';
import type { Socket, Server } from 'socket.io';
import { extractString, getIsAuthenticated } from './games.gateway.utils';
import {
  maybeEncrypt,
  maybeDecrypt,
} from '../common/utils/socket-encryption.util';
import type { GamesService } from './games.service';
import type { GamesRealtimeService } from './games.realtime.service';

export async function handleHistoryNote(
  logger: Logger,
  server: Server,
  client: Socket,
  realtime: GamesRealtimeService,
  gamesService: GamesService,
  validateUserId: (client: Socket, userId: string) => void,
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
  const isAuthenticated = getIsAuthenticated(client);

  validateUserId(client, userId);

  try {
    const session = await gamesService.findSessionByRoom(roomId);
    if (!session) {
      let senderName = '';
      try {
        const room = await gamesService.getRoom(roomId);
        senderName =
          room.members?.find((m) => m.id === userId)?.displayName ?? '';
      } catch {
        senderName = '';
      }
      const entry = await gamesService.postRoomChat(
        roomId,
        userId,
        senderName,
        message,
        scope,
      );
      if (entry) {
        const channel = realtime.roomChannel(roomId);
        server.to(channel).emit('games.room.chat', maybeEncrypt(entry));
        client.emit(
          'games.room.chat.ack',
          maybeEncrypt({ roomId, userId, scope }),
        );
      }
    } else {
      await gamesService.postHistoryNote(
        roomId,
        userId,
        message,
        scope as 'all' | 'players' | 'private',
        isAuthenticated,
      );
    }
    client.emit(
      'games.session.history_note.ack',
      maybeEncrypt({ roomId, userId, scope }),
    );
  } catch (error) {
    logger.error(`handleHistoryNote failed for room ${roomId}: ${error}`);
  }
}
