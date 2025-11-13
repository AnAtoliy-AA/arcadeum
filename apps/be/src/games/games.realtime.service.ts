import { Injectable, Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import type { GameRoomSummary, GameSessionSummary } from './games.service';

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
    this.server.to(this.roomChannel(room.id)).emit('games.room.update', {
      room,
    });
  }

  emitRoomRemoved(roomId: string): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.roomChannel(roomId)).emit('games.room.deleted', {
      roomId,
    });
  }

  emitSessionSnapshot(roomId: string, session: GameSessionSummary): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.roomChannel(roomId)).emit('games.session.snapshot', {
      roomId,
      session,
    });
  }

  emitSessionSnapshotToClient(
    client: Socket,
    roomId: string,
    session: GameSessionSummary,
  ): void {
    client.emit('games.session.snapshot', {
      roomId,
      session,
    });
  }
}
