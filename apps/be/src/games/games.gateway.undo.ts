import type { Logger } from '@nestjs/common';
import type { Socket, Server } from 'socket.io';
import {
  maybeDecrypt,
  maybeEncrypt,
} from '../common/utils/socket-encryption.util';
import { extractString, validatePayloadUserId } from './games.gateway.utils';
import type { GamesService } from './games.service';

/**
 * Server-side undo arbitration. An undo only executes when BOTH conditions
 * hold:
 *   1. there is a live (non-expired) pending request for this room, and
 *   2. the responder is a DIFFERENT user than the requester.
 * Without this, any room member could unilaterally revert moves (or revert
 * their own blunders) to manufacture wins — a coin/ranking integrity hole.
 */
interface PendingUndoRequest {
  sessionId: string;
  requesterId: string;
  expiresAt: number;
}

const pendingUndoRequests = new Map<string, PendingUndoRequest>();
const undoUsageBySession = new Map<string, number>();

const UNDO_REQUEST_TTL_MS = 30_000;
const MAX_UNDOS_PER_SESSION = 3;

function pruneExpiredPending(now: number): void {
  for (const [roomId, pending] of pendingUndoRequests) {
    if (pending.expiresAt <= now) {
      pendingUndoRequests.delete(roomId);
    }
  }
}

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
  validatePayloadUserId(client, userId);
  const channel = realtime.roomChannel(roomId);
  if (!client.rooms.has(channel)) return;

  const now = Date.now();
  pruneExpiredPending(now);
  pendingUndoRequests.set(roomId, {
    sessionId,
    requesterId: userId,
    expiresAt: now + UNDO_REQUEST_TTL_MS,
  });

  server
    .to(channel)
    .emit(
      'games.session.undo_request',
      maybeEncrypt({ userId, sessionId, ts: now }),
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
  validatePayloadUserId(client, userId);
  const channel = realtime.roomChannel(roomId);
  if (!client.rooms.has(channel)) return;

  const now = Date.now();
  pruneExpiredPending(now);

  const pending = pendingUndoRequests.get(roomId);
  if (!pending || pending.expiresAt <= now) {
    pendingUndoRequests.delete(roomId);
    // No live request — nothing to accept or reject.
    return;
  }

  if (userId === pending.requesterId) {
    logger.warn(
      `User ${userId} attempted to accept their own undo request for room ${roomId} — blocking`,
    );
    return;
  }

  pendingUndoRequests.delete(roomId);

  let executed = false;
  if (accepted && sessionId === pending.sessionId) {
    const used = undoUsageBySession.get(sessionId) ?? 0;
    if (used >= MAX_UNDOS_PER_SESSION) {
      logger.warn(
        `Undo limit (${MAX_UNDOS_PER_SESSION}) reached for session ${sessionId} — denying`,
      );
    } else {
      try {
        await gamesService.revertLastMove(sessionId);
        undoUsageBySession.set(sessionId, used + 1);
        executed = true;
        logger.log(
          `Undo accepted for session ${sessionId} by ${userId} (opponent of ${pending.requesterId})`,
        );
      } catch (error) {
        logger.error(`Undo revert failed for session ${sessionId}: ${error}`);
      }
    }
  }

  server
    .to(channel)
    .emit(
      'games.session.undo_response',
      maybeEncrypt({ userId, accepted: executed, sessionId, ts: Date.now() }),
    );
}
