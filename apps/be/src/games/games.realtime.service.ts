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

  emitSessionSnapshot(roomId: string, session: GameSessionSummary): void {
    if (!this.server) {
      return;
    }

    // Send FULL session to players
    this.server.to(this.roomChannel(roomId)).emit(
      'games.session.snapshot',
      maybeEncrypt({
        roomId,
        session,
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

  emitGameStarted(room: GameRoomSummary, session: GameSessionSummary): void {
    if (!this.server) {
      return;
    }

    this.logger.log(
      `Emitting game started events for room ${room.id}, session ${session.id}`,
    );

    // Send FULL session to players
    this.server.to(this.roomChannel(room.id)).emit(
      'games.game.started',
      maybeEncrypt({
        room,
        session,
      }),
    );
    this.server.to(this.roomChannel(room.id)).emit(
      'games.session.started',
      maybeEncrypt({
        room,
        session,
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
    this.emitSessionSnapshot(room.id, session);
  }

  emitActionExecuted(
    session: GameSessionSummary,
    action: string,
    userId: string,
  ): void {
    if (!this.server || !session.roomId) {
      return;
    }

    // Send FULL session to players
    this.server.to(this.roomChannel(session.roomId)).emit(
      'games.action.executed',
      maybeEncrypt({
        session,
        action,
        userId,
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
    this.emitSessionSnapshot(session.roomId, session);
  }
}
