import type { Logger } from '@nestjs/common';
import type { Socket, Server } from 'socket.io';
import { EMOTE_IDS, type EmoteId } from './dtos/send-emote.dto';
import {
  maybeDecrypt,
  maybeEncrypt,
} from '../common/utils/socket-encryption.util';
import { extractString } from './games.gateway.utils';

export function handleEmote(
  logger: Logger,
  server: Server,
  client: Socket,
  realtime: { roomChannel(id: string): string; spectatorChannel(id: string): string },
  payload: unknown,
): void {
  const decrypted = maybeDecrypt<{
    roomId?: string;
    userId?: string;
    emoteId?: string;
  }>(payload);
  const roomId = extractString(decrypted, 'roomId');
  const userId = extractString(decrypted, 'userId');
  const emoteId = extractString(decrypted, 'emoteId');

  if (!roomId || !userId || !emoteId) return;

  if (!(EMOTE_IDS as readonly string[]).includes(emoteId)) {
    logger.warn(
      `Invalid emoteId "${emoteId}" from user ${userId} in room ${roomId}`,
    );
    return;
  }

  const channel = realtime.roomChannel(roomId);
  if (!client.rooms.has(channel)) return;

  const data = { userId, emoteId: emoteId as EmoteId, ts: Date.now() };
  server.to(channel).emit('games.session.emote', maybeEncrypt(data));
  const specChannel = realtime.spectatorChannel(roomId);
  server.to(specChannel).emit('games.session.emote', maybeEncrypt(data));
}
