import type { Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';
import { extractString, getIsAuthenticated } from './games.gateway.utils';
import {
  maybeEncrypt,
  maybeDecrypt,
} from '../common/utils/socket-encryption.util';
import type { GamesService } from './games.service';

export async function handleHistoryNote(
  logger: Logger,
  client: Socket,
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
  const scope = ['players', 'private'].includes(scopeRaw) ? scopeRaw : 'all';
  const isAuthenticated = getIsAuthenticated(client);

  validateUserId(client, userId);

  try {
    await gamesService.postHistoryNote(
      roomId,
      userId,
      message,
      scope as 'all' | 'players' | 'private',
      isAuthenticated,
    );
    client.emit(
      'games.session.history_note.ack',
      maybeEncrypt({ roomId, userId, scope }),
    );
  } catch (error) {
    logger.error(`handleHistoryNote failed for room ${roomId}: ${error}`);
  }
}
