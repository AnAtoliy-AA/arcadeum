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
  }

  emitSessionSnapshot(roomId: string, session: GameSessionSummary): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.roomChannel(roomId)).emit(
      'games.session.snapshot',
      maybeEncrypt({
        roomId,
        session,
      }),
    );
  }

  emitSessionSnapshotToClient(
    client: Socket,
    roomId: string,
    session: GameSessionSummary,
  ): void {
    client.emit(
      'games.session.snapshot',
      maybeEncrypt({
        roomId,
        session,
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
  }

  emitGameStarted(room: GameRoomSummary, session: GameSessionSummary): void {
    if (!this.server) {
      return;
    }

    this.logger.log(
      `Emitting game started events for room ${room.id}, session ${session.id}`,
    );

    // Emit both events for backward compatibility
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

    // Also emit session snapshot
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
    this.server.to(this.roomChannel(session.roomId)).emit(
      'games.action.executed',
      maybeEncrypt({
        session,
        action,
        userId,
      }),
    );

    // Also emit session snapshot to update all clients
    this.emitSessionSnapshot(session.roomId, session);
  }
}
