import type { Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';
import { extractString, getIsAuthenticated } from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import type { GamesService } from './games.service';

export async function handleHistoryNote(
  logger: Logger,
  client: Socket,
  gamesService: GamesService,
  validateUserId: (client: Socket, userId: string) => void,
  payload: Record<string, unknown>,
): Promise<void> {
  const roomId = extractString(payload, 'roomId');
  const userId = extractString(payload, 'userId');
  const message = extractString(payload, 'message');
  const scopeRaw =
    typeof payload?.scope === 'string'
      ? payload.scope.trim().toLowerCase()
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
    logger.error(
      `handleHistoryNote failed for room ${roomId}: ${error}`,
    );
  }
}
