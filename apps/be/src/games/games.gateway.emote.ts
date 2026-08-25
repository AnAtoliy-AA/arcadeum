import type { Logger } from '@nestjs/common';
import type { Socket, Server } from 'socket.io';
import { EMOTE_IDS, type EmoteId } from './dtos/send-emote.dto';
import {
  maybeDecrypt,
  maybeEncrypt,
} from '../common/utils/socket-encryption.util';
import { extractString } from './games.gateway.utils';

const emoteRateLimits = new Map<string, number>();
const EMOTE_RATE_LIMIT_MS = 2000;
const EMOTE_ENTRY_TTL_MS = 60_000;
const EMOTE_MAX_ENTRIES = 10_000;
let lastEviction = 0;

const emoteSweepInterval = setInterval(() => {
  const now = Date.now();
  if (emoteRateLimits.size === 0) return;
  for (const [key, ts] of emoteRateLimits) {
    if (now - ts > EMOTE_ENTRY_TTL_MS) emoteRateLimits.delete(key);
  }
}, EMOTE_ENTRY_TTL_MS);
if (emoteSweepInterval.unref) emoteSweepInterval.unref();

export function handleEmote(
  logger: Logger,
  server: Server,
  client: Socket,
  realtime: {
    roomChannel(id: string): string;
    spectatorChannel(id: string): string;
  },
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

  const now = Date.now();
  if (now - lastEviction > EMOTE_ENTRY_TTL_MS) {
    lastEviction = now;
    for (const [key, ts] of emoteRateLimits) {
      if (now - ts > EMOTE_ENTRY_TTL_MS) emoteRateLimits.delete(key);
    }
  }
  if (emoteRateLimits.size >= EMOTE_MAX_ENTRIES) {
    const sorted = [...emoteRateLimits.entries()].sort((a, b) => a[1] - b[1]);
    const toRemove = sorted.slice(0, sorted.length - EMOTE_MAX_ENTRIES + 1000);
    for (const [key] of toRemove) {
      emoteRateLimits.delete(key);
    }
  }

  if (!(EMOTE_IDS as readonly string[]).includes(emoteId)) {
    logger.warn(
      `Invalid emoteId "${emoteId}" from user ${userId} in room ${roomId}`,
    );
    return;
  }

  const rateKey = `${roomId}:${userId}`;
  const lastEmote = emoteRateLimits.get(rateKey);
  if (lastEmote && now - lastEmote < EMOTE_RATE_LIMIT_MS) return;
  emoteRateLimits.set(rateKey, now);

  const channel = realtime.roomChannel(roomId);
  const specChannel = realtime.spectatorChannel(roomId);
  // ARC-926: spectators (joined via games.room.watch) may react too.
  if (!client.rooms.has(channel) && !client.rooms.has(specChannel)) return;

  const data = { userId, emoteId: emoteId as EmoteId, ts: Date.now() };
  server.to(channel).emit('games.session.emote', maybeEncrypt(data));
  server.to(specChannel).emit('games.session.emote', maybeEncrypt(data));
}
