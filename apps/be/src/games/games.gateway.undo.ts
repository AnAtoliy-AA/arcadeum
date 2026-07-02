import type { Logger } from '@nestjs/common';
import type { Socket, Server } from 'socket.io';
import {
  maybeDecrypt,
  maybeEncrypt,
} from '../common/utils/socket-encryption.util';
import { extractString } from './games.gateway.utils';
import type { GamesService } from './games.service';

export function handleUndoRequest(
  logger: Logger,
  server: Server,
  client: Socket,
  realtime: { roomChannel(id: string): string },
  payload: unknown,
): void {
  const decrypted = maybeDecrypt<{
    roomId?: string;
    userId?: string;
    sessionId?: string;
  }>(payload);
  const roomId = extractString(decrypted, 'roomId');
  const userId = extractString(decrypted, 'userId');
  const sessionId = extractString(decrypted, 'sessionId');
  if (!roomId || !userId) return;
  const channel = realtime.roomChannel(roomId);
  if (!client.rooms.has(channel)) return;
  server
    .to(channel)
    .emit(
      'games.session.undo_request',
      maybeEncrypt({ userId, sessionId, ts: Date.now() }),
    );
}

export async function handleUndoResponse(
  logger: Logger,
  server: Server,
  client: Socket,
  realtime: { roomChannel(id: string): string },
  payload: unknown,
  gamesService: GamesService,
): Promise<void> {
  const decrypted = maybeDecrypt<{
    roomId?: string;
    userId?: string;
    sessionId?: string;
    accepted?: boolean;
  }>(payload);
  const roomId = extractString(decrypted, 'roomId');
  const userId = extractString(decrypted, 'userId');
  const sessionId = extractString(decrypted, 'sessionId');
  const accepted = decrypted?.accepted ?? false;
  if (!roomId || !userId) return;
  const channel = realtime.roomChannel(roomId);
  if (!client.rooms.has(channel)) return;

  if (accepted && sessionId) {
    try {
      await gamesService.revertLastMove(sessionId);
      logger.log(`Undo accepted for session ${sessionId} by ${userId}`);
    } catch (error) {
      logger.error(`Undo revert failed for session ${sessionId}: ${error}`);
    }
  }

  server
    .to(channel)
    .emit(
      'games.session.undo_response',
      maybeEncrypt({ userId, accepted, sessionId, ts: Date.now() }),
    );
}
