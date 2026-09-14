import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import type { GameRoomSummary, GameSessionSummary } from './games.types';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import {
  filterSessionForSpectators as filterForSpectators,
  emitSessionSnapshot as emitSnapshotFn,
  emitSessionSnapshotToClient as emitSnapshotToClientFn,
  emitGameStarted as emitGameStartedFn,
  emitActionExecuted as emitActionExecutedFn,
} from './games.session-emitters';
import { PeakTracker, type PeakData } from './games.realtime.peaks';

const REMATCH_INVITATION_TIMEOUT_SECONDS = 30;
const ONLINE_USERS_KEY = 'arcadeum:online:users';
const ONLINE_TTL_MS = 90_000;

@Injectable()
export class GamesRealtimeService implements OnModuleDestroy {
  private readonly logger = new Logger(GamesRealtimeService.name);

  private server: Server | null = null;

  getSocketServer(): Server | null {
    return this.server;
  }

  private readonly userIdToSockets = new Map<string, Set<string>>();

  private redis: Redis | null = null;
  private readonly peakTracker: PeakTracker;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          return Math.min(times * 200, 5000);
        },
        lazyConnect: true,
        enableOfflineQueue: false,
      });
      this.redis.on('error', (err: Error) => {
        this.logger.warn(
          `Redis connection error for online tracking: ${err.message}`,
        );
      });
      this.redis.connect().catch(() => {
        this.logger.warn(
          'Failed to connect Redis for online tracking, falling back to in-memory',
        );
        this.redis = null;
      });
    }
    this.peakTracker = new PeakTracker(this.redis);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit().catch(() => {});
    }
  }

  registerServer(server: Server): void {
    this.server = server;
    this.logger.debug('Socket server registered for games gateway.');
  }

  async trackSocket(userId: string, socketId: string): Promise<void> {
    if (this.redis) {
      try {
        const now = Date.now();
        await this.redis.zadd(ONLINE_USERS_KEY, now, userId);
        return;
      } catch (err) {
        this.logger.warn(
          `Redis trackSocket failed, falling back to memory: ${err}`,
        );
      }
    }

    let sockets = this.userIdToSockets.get(userId);
    if (!sockets) {
      sockets = new Set();
      this.userIdToSockets.set(userId, sockets);
    }
    sockets.add(socketId);
  }

  async refreshSocket(_socketId: string, userId: string): Promise<void> {
    if (!this.redis || !userId) return;
    try {
      await this.redis.zadd(ONLINE_USERS_KEY, Date.now(), userId);
    } catch {
      // best-effort
    }
  }

  async untrackSocket(userId: string, socketId: string): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.zrem(ONLINE_USERS_KEY, userId);
        return;
      } catch (err) {
        this.logger.warn(
          `Redis untrackSocket failed, falling back to memory: ${err}`,
        );
      }
    }

    const sockets = this.userIdToSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userIdToSockets.delete(userId);
      }
    }
  }

  async getConnectedUsersCount(): Promise<number> {
    let count: number;
    if (this.redis) {
      try {
        const staleThreshold = Date.now() - ONLINE_TTL_MS;
        const stale = await this.redis.zrangebyscore(
          ONLINE_USERS_KEY,
          '-inf',
          String(staleThreshold),
        );
        if (stale.length > 0) {
          await this.redis.zrem(ONLINE_USERS_KEY, ...stale);
        }
        count = await this.redis.zcard(ONLINE_USERS_KEY);
        void this.peakTracker.trackPeakOnline(count);
        return count;
      } catch {
        // fall through to in-memory
      }
    }
    count = this.userIdToSockets.size;
    void this.peakTracker.trackPeakOnline(count);
    return count;
  }

  async trackPeakRooms(currentCount: number): Promise<void> {
    return this.peakTracker.trackPeakRooms(currentCount);
  }

  async getPeaks(): Promise<PeakData> {
    return this.peakTracker.getPeaks();
  }

  roomChannel(roomId: string): string {
    return `game-room:${roomId}`;
  }

  spectatorChannel(roomId: string): string {
    return `game-room-spectators:${roomId}`;
  }

  lobbyChannel(): string {
    return 'games-lobby';
  }

  emitRoomUpdate(room: GameRoomSummary): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.roomChannel(room.id)).emit(
      'games.room.update',
      maybeEncrypt({
        room,
      }),
    );
    // Also notify spectators
    this.server.to(this.spectatorChannel(room.id)).emit(
      'games.room.update',
      maybeEncrypt({
        room,
      }),
    );
  }

  emitRoomDeleted(roomId: string): void {
    if (!this.server) {
      return;
    }
    this.server
      .to(this.lobbyChannel())
      .emit('games.room.deleted', maybeEncrypt({ roomId }));
  }

  /**
   * Returns true if a socket with data.userId === userId is currently
   * inside the room channel. Used by matchmaking to skip lobbies whose
   * host has already closed the tab. Returns false if the gateway
   * server isn't registered yet (best-effort signal).
   */
  async isUserPresentInRoom(roomId: string, userId: string): Promise<boolean> {
    if (!this.server) return false;
    const sockets = await this.server
      .in(this.roomChannel(roomId))
      .fetchSockets();
    return sockets.some((s) => {
      const data = s.data as Record<string, unknown> | undefined;
      return data?.userId === userId;
    });
  }

  filterSessionForSpectators(session: GameSessionSummary): GameSessionSummary {
    return filterForSpectators(session);
  }

  async emitSessionSnapshot(
    roomId: string,
    session: GameSessionSummary,
    sanitizer?: (
      session: GameSessionSummary,
      userId: string,
    ) => GameSessionSummary | Promise<GameSessionSummary>,
  ): Promise<void> {
    await emitSnapshotFn(
      this.logger,
      this.server!,
      roomId,
      session,
      (id) => this.roomChannel(id),
      (id) => this.spectatorChannel(id),
      sanitizer,
    );
  }

  emitSessionSnapshotToClient(
    client: Socket,
    roomId: string,
    session: GameSessionSummary,
    isSpectator = false,
  ): void {
    emitSnapshotToClientFn(client, roomId, session, isSpectator);
  }

  emitRoomCreated(room: GameRoomSummary): void {
    if (!this.server) {
      return;
    }
    this.server
      .to(this.lobbyChannel())
      .emit('games.room.created', maybeEncrypt({ room }));
  }

  emitPlayerJoined(room: GameRoomSummary, userId: string): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.roomChannel(room.id)).emit(
      'games.player.joined',
      maybeEncrypt({
        room,
        userId,
      }),
    );
    this.server
      .to(this.lobbyChannel())
      .emit('games.room.updated', maybeEncrypt({ room }));
  }

  emitPlayerLeft(
    room: GameRoomSummary | null,
    userId: string,
    roomDeleted: boolean,
    kicked = false,
  ): void {
    if (!this.server || !room) {
      return;
    }
    this.server.to(this.roomChannel(room.id)).emit(
      'games.player.left',
      maybeEncrypt({
        room,
        userId,
        roomDeleted,
        kicked,
      }),
    );
    this.server
      .to(this.lobbyChannel())
      .emit('games.room.updated', maybeEncrypt({ room }));
  }

  emitRematchStarted(oldRoomId: string, newRoomId: string): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.roomChannel(oldRoomId)).emit(
      'games.rematch.started',
      maybeEncrypt({
        oldRoomId,
        newRoomId,
      }),
    );
  }

  emitRematchInvited(
    oldRoomId: string,
    newRoomId: string,
    hostId: string,
    hostName: string,
    invitedUserIds: string[],
    message?: string,
  ): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.roomChannel(oldRoomId)).emit(
      'games.rematch.invited',
      maybeEncrypt({
        oldRoomId,
        newRoomId,
        hostId,
        hostName,
        invitedUserIds,
        message,
        timeout: REMATCH_INVITATION_TIMEOUT_SECONDS, // 30 seconds default
      }),
    );
  }

  emitPlayerDeclined(room: GameRoomSummary, userId: string): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.roomChannel(room.id)).emit(
      'games.rematch.declined',
      maybeEncrypt({
        room,
        userId,
      }),
    );
  }
  emitUndoRequest(roomId: string, requesterId: string): void {
    if (!this.server) return;
    this.server
      .to(this.roomChannel(roomId))
      .emit(
        'games.session.undo_request',
        maybeEncrypt({ roomId, requesterId }),
      );
  }
  emitUndoResponse(
    roomId: string,
    acceptorId: string,
    accepted: boolean,
  ): void {
    if (!this.server) return;
    this.server
      .to(this.roomChannel(roomId))
      .emit(
        'games.session.undo_response',
        maybeEncrypt({ roomId, acceptorId, accepted }),
      );
  }

  emitRoomUpdated(room: GameRoomSummary): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.roomChannel(room.id)).emit(
      'games.room.update',
      maybeEncrypt({
        room,
      }),
    );
  }

  async emitGameStarted(
    room: GameRoomSummary,
    session: GameSessionSummary,
    sanitizer?: (
      session: GameSessionSummary,
      userId: string,
    ) => GameSessionSummary | Promise<GameSessionSummary>,
  ): Promise<void> {
    await emitGameStartedFn(
      this.logger,
      this.server!,
      room,
      session,
      (id) => this.roomChannel(id),
      (id) => this.spectatorChannel(id),
      sanitizer,
    );
  }

  async emitActionExecuted(
    session: GameSessionSummary,
    action: string,
    userId: string,
    sanitizer?: (
      session: GameSessionSummary,
      userId: string,
    ) => GameSessionSummary | Promise<GameSessionSummary>,
  ): Promise<void> {
    await emitActionExecutedFn(
      this.logger,
      this.server!,
      session,
      action,
      userId,
      (id) => this.roomChannel(id),
      (id) => this.spectatorChannel(id),
      () => this.emitSessionSnapshot(session.roomId, session, sanitizer),
      sanitizer,
    );
  }

  /**
   * Broadcast an arbitrary event to every socket in the room channel.
   * Used by per-tick broadcasts in real-time games (e.g. Glimworm).
   */
  emitToRoom(roomId: string, event: string, payload: unknown): void {
    if (!this.server) {
      return;
    }
    this.server
      .to(this.roomChannel(roomId))
      .emit(event, maybeEncrypt(payload as Record<string, unknown>));
  }

  emitToSpectators(roomId: string, event: string, payload: unknown): void {
    if (!this.server) {
      return;
    }
    this.server
      .to(this.spectatorChannel(roomId))
      .emit(event, maybeEncrypt(payload as Record<string, unknown>));
  }

  /**
   * Broadcast an event to a specific client (by `userId`) within a room channel.
   * Returns false if no such client was found. Used for personalised snapshots.
   */
  async emitToClientInRoom(
    roomId: string,
    userId: string,
    event: string,
    payload: unknown,
  ): Promise<boolean> {
    if (!this.server) {
      return false;
    }

    const trackedIds = this.userIdToSockets.get(userId);
    if (trackedIds && trackedIds.size > 0) {
      const sockets = await this.server
        .in(this.roomChannel(roomId))
        .fetchSockets();
      const targetSockets = sockets.filter((s) => trackedIds.has(s.id));
      for (const socket of targetSockets) {
        socket.emit(event, maybeEncrypt(payload as Record<string, unknown>));
      }
      return targetSockets.length > 0;
    }

    const sockets = await this.server
      .in(this.roomChannel(roomId))
      .fetchSockets();
    let delivered = false;
    for (const socket of sockets) {
      const data = socket.data as Record<string, unknown> | undefined;
      if ((data?.userId as string | undefined) === userId) {
        socket.emit(event, maybeEncrypt(payload as Record<string, unknown>));
        delivered = true;
      }
    }
    return delivered;
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    if (!this.server) return;
    const socketIds = this.userIdToSockets.get(userId);
    if (socketIds) {
      for (const socketId of socketIds) {
        this.server
          .to(socketId)
          .emit(event, maybeEncrypt(payload as Record<string, unknown>));
      }
    }
  }

  emitMatchmakingSuccess(userId: string, roomId: string): void {
    this.emitToUser(userId, 'games.matchmaking.success', { roomId });
  }
}
