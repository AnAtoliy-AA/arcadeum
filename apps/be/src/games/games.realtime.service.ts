import { Injectable, Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import type { GameRoomSummary, GameSessionSummary } from './games.types';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';

@Injectable()
export class GamesRealtimeService {
  private readonly logger = new Logger(GamesRealtimeService.name);

  private server: Server | null = null;

  registerServer(server: Server): void {
    this.server = server;
    this.logger.debug('Socket server registered for games gateway.');
  }

  roomChannel(roomId: string): string {
    return `game-room:${roomId}`;
  }

  spectatorChannel(roomId: string): string {
    return `game-room-spectators:${roomId}`;
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

  emitRoomRemoved(roomId: string): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.roomChannel(roomId)).emit(
      'games.room.deleted',
      maybeEncrypt({
        roomId,
      }),
    );
    this.server.to(this.spectatorChannel(roomId)).emit(
      'games.room.deleted',
      maybeEncrypt({
        roomId,
      }),
    );
  }

  /**
   * Filter session state for spectator-safe broadcast.
   * Removes logs that are not visible to spectators (non-'all' scope).
   */
  filterSessionForSpectators(session: GameSessionSummary): GameSessionSummary {
    if (!session.state || typeof session.state !== 'object') {
      return session;
    }

    const state = session.state;
    if (!Array.isArray(state.logs)) {
      return session;
    }

    // Filter logs to only include public messages (scope: 'all' or undefined)
    const filteredLogs = state.logs.filter((log: Record<string, unknown>) => {
      return log.scope === 'all' || log.scope === undefined;
    });

    return {
      ...session,
      state: {
        ...state,
        logs: filteredLogs,
      },
    };
  }

  async emitSessionSnapshot(
    roomId: string,
    session: GameSessionSummary,
    sanitizer?: (
      session: GameSessionSummary,
      userId: string,
    ) => Promise<GameSessionSummary>,
  ): Promise<void> {
    if (!this.server) {
      return;
    }

    // Send FULL or SANITIZED session to players
    const roomSockets = await this.server
      .in(this.roomChannel(roomId))
      .fetchSockets();

    await Promise.all(
      roomSockets.map(async (socket) => {
        const socketData = socket.data as Record<string, unknown> | undefined;
        const userId = socketData?.userId as string | undefined;
        let diffSession = session;

        if (userId && sanitizer) {
          try {
            diffSession = await sanitizer(session, userId);
          } catch (err) {
            this.logger.error(
              `Failed to sanitize session for user ${userId}: ${err}`,
            );
            // Fallback to spectator view on error
            diffSession = this.filterSessionForSpectators(session);
          }
        } else if (sanitizer) {
          // If sanitizer provided but no userId, treat as spectator (secure default)
          diffSession = this.filterSessionForSpectators(session);
        }

        // Trace logging for private messages
        if (session.state && typeof session.state === 'object') {
          const stateObj = session.state;
          const diffStateObj = diffSession.state;
          const originalLogs = Array.isArray(stateObj.logs)
            ? stateObj.logs
            : [];
          const finalLogs = Array.isArray(diffStateObj.logs)
            ? diffStateObj.logs
            : [];
          if (originalLogs.length > finalLogs.length) {
            this.logger.debug(
              `[Security] Filtered ${originalLogs.length - finalLogs.length} logs for user ${userId || 'anonymous'}`,
            );
          }
        }

        socket.emit(
          'games.session.snapshot',
          maybeEncrypt({
            roomId,
            session: diffSession,
          }),
        );
      }),
    );

    // Send FILTERED session to spectators
    const filteredSession = this.filterSessionForSpectators(session);
    this.server.to(this.spectatorChannel(roomId)).emit(
      'games.session.snapshot',
      maybeEncrypt({
        roomId,
        session: filteredSession,
      }),
    );
  }

  emitSessionSnapshotToClient(
    client: Socket,
    roomId: string,
    session: GameSessionSummary,
    isSpectator = false,
  ): void {
    // Filter logs for spectators
    const sessionToSend = isSpectator
      ? this.filterSessionForSpectators(session)
      : session;

    client.emit(
      'games.session.snapshot',
      maybeEncrypt({
        roomId,
        session: sessionToSend,
      }),
    );
  }

  emitRoomCreated(room: GameRoomSummary): void {
    if (!this.server) {
      return;
    }
    this.server.emit('games.room.created', maybeEncrypt({ room }));
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
  }

  emitPlayerLeft(
    room: GameRoomSummary | null,
    userId: string,
    roomDeleted: boolean,
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
      }),
    );
  }

  emitRoomDeleted(roomId: string): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.roomChannel(roomId)).emit(
      'games.room.deleted',
      maybeEncrypt({
        roomId,
      }),
    );
    this.server.to(this.spectatorChannel(roomId)).emit(
      'games.room.deleted',
      maybeEncrypt({
        roomId,
      }),
    );
  }

  async emitGameStarted(
    room: GameRoomSummary,
    session: GameSessionSummary,
    sanitizer?: (
      session: GameSessionSummary,
      userId: string,
    ) => Promise<GameSessionSummary>,
  ): Promise<void> {
    if (!this.server) {
      return;
    }

    this.logger.log(
      `Emitting game started events for room ${room.id}, session ${session.id}`,
    );

    // Send FULL session to players (sanitized per player if needed)
    // We cannot use room broadcast here if we want per-player data
    // So we iterate sockets just like in emitSessionSnapshot
    const roomSockets = await this.server
      .in(this.roomChannel(room.id))
      .fetchSockets();

    await Promise.all(
      roomSockets.map(async (socket) => {
        const socketData = socket.data as Record<string, unknown> | undefined;
        const userId = socketData?.userId as string | undefined;
        let diffSession = session;

        if (userId && sanitizer) {
          try {
            diffSession = await sanitizer(session, userId);
          } catch (err) {
            this.logger.error(
              `Failed to sanitize session for user ${userId}: ${err}`,
            );
            diffSession = this.filterSessionForSpectators(session);
          }
        } else if (sanitizer) {
          diffSession = this.filterSessionForSpectators(session);
        }

        socket.emit(
          'games.game.started',
          maybeEncrypt({
            room,
            session: diffSession,
          }),
        );

        socket.emit(
          'games.session.started',
          maybeEncrypt({
            room,
            session: diffSession,
          }),
        );
      }),
    );

    // Send FILTERED session to spectators
    const filteredSession = this.filterSessionForSpectators(session);
    this.server.to(this.spectatorChannel(room.id)).emit(
      'games.game.started',
      maybeEncrypt({
        room,
        session: filteredSession,
      }),
    );
    this.server.to(this.spectatorChannel(room.id)).emit(
      'games.session.started',
      maybeEncrypt({
        room,
        session: filteredSession,
      }),
    );

    // Also emit session snapshot (which already handles both channels)
    await this.emitSessionSnapshot(room.id, session, sanitizer);
  }

  async emitActionExecuted(
    session: GameSessionSummary,
    action: string,
    userId: string,
    sanitizer?: (
      session: GameSessionSummary,
      userId: string,
    ) => Promise<GameSessionSummary>,
  ): Promise<void> {
    if (!this.server || !session.roomId) {
      return;
    }

    // Send FULL session to players (sanitized per player)
    const roomSockets = await this.server
      .in(this.roomChannel(session.roomId))
      .fetchSockets();

    await Promise.all(
      roomSockets.map(async (socket) => {
        const socketData = socket.data as Record<string, unknown> | undefined;
        const socketUserId = socketData?.userId as string | undefined;
        let diffSession = session;

        if (socketUserId && sanitizer) {
          try {
            diffSession = await sanitizer(session, socketUserId);
          } catch (err) {
            this.logger.error(
              `Failed to sanitize session for user ${userId}: ${err}`,
            );
            diffSession = this.filterSessionForSpectators(session);
          }
        } else if (sanitizer) {
          diffSession = this.filterSessionForSpectators(session);
        }

        socket.emit(
          'games.action.executed',
          maybeEncrypt({
            session: diffSession,
            action,
            userId,
          }),
        );
      }),
    );

    // Send FILTERED session to spectators
    const filteredSession = this.filterSessionForSpectators(session);
    this.server.to(this.spectatorChannel(session.roomId)).emit(
      'games.action.executed',
      maybeEncrypt({
        session: filteredSession,
        action,
        userId,
      }),
    );

    // Also emit session snapshot to update all clients (handles both channels)
    await this.emitSessionSnapshot(session.roomId, session, sanitizer);
  }
}
