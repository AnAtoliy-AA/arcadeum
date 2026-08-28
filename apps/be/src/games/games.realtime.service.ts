import { Injectable, Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import type { GameRoomSummary, GameSessionSummary } from './games.types';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import {
  filterSessionForSpectators as filterForSpectators,
  emitSessionSnapshot as emitSnapshotFn,
  emitSessionSnapshotToClient as emitSnapshotToClientFn,
  emitGameStarted as emitGameStartedFn,
  emitActionExecuted as emitActionExecutedFn,
} from './games.session-emitters';

const REMATCH_INVITATION_TIMEOUT_SECONDS = 30;

@Injectable()
export class GamesRealtimeService {
  private readonly logger = new Logger(GamesRealtimeService.name);

  private server: Server | null = null;

  private readonly userIdToSockets = new Map<string, Set<string>>();

  registerServer(server: Server): void {
    this.server = server;
    this.logger.debug('Socket server registered for games gateway.');
  }

  trackSocket(userId: string, socketId: string): void {
    let sockets = this.userIdToSockets.get(userId);
    if (!sockets) {
      sockets = new Set();
      this.userIdToSockets.set(userId, sockets);
    }
    sockets.add(socketId);
  }

  untrackSocket(userId: string, socketId: string): void {
    const sockets = this.userIdToSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userIdToSockets.delete(userId);
      }
    }
  }

  getConnectedUsersCount(): number {
    return this.userIdToSockets.size;
  }

  getConnectedSocketsCount(): number {
    if (!this.server) return 0;
    return this.server.sockets?.sockets?.size ?? 0;
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
