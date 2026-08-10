import type { Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';
import { extractString } from './games.gateway.utils';
import {
  maybeEncrypt,
  maybeDecrypt,
} from '../common/utils/socket-encryption.util';
import type { GameSessionsService } from './sessions/game-sessions.service';
import type { GamesRealtimeService } from './games.realtime.service';

export async function handleSessionDeleteChat(
  logger: Logger,
  client: Socket,
  sessionsService: GameSessionsService,
  realtimeService: GamesRealtimeService,
  validateUserId: (client: Socket, userId: string) => void,
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

  validateUserId(client, userId);

  try {
    const session = await sessionsService.deleteChatLog(
      roomId,
      userId,
      messageId,
    );

    if (session) {
      client.emit(
        'games.session.delete_chat.ack',
        maybeEncrypt({ roomId, userId, messageId }),
      );
      await realtimeService.emitSessionSnapshot(roomId, session, (s, pId) => {
        const sanitized = sessionsService.sanitizeSummaryForPlayer(s, pId);
        if (sanitized && typeof sanitized === 'object') {
          return { ...s, state: sanitized as Record<string, unknown> };
        }
        return s;
      });
    }
  } catch (error) {
    logger.error(`handleSessionDeleteChat failed for room ${roomId}: ${error}`);
  }
}
