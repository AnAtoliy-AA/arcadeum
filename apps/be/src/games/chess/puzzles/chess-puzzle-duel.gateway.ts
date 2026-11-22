import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { corsOriginMatcher } from '../../../common/utils/cors.util';

interface DuelRoom {
  roomCode: string;
  hostSocketId: string;
  guestSocketId?: string;
  hostScore: number;
  guestScore: number;
  hostStrikes: number;
  guestStrikes: number;
  createdAt: number;
}

@WebSocketGateway({
  cors: { origin: corsOriginMatcher },
  namespace: '/chess-puzzle-duel',
})
export class ChessPuzzleDuelGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChessPuzzleDuelGateway.name);
  private readonly rooms = new Map<string, DuelRoom>();
  private readonly socketToRoom = new Map<string, string>();

  handleDisconnect(client: Socket) {
    const roomCode = this.socketToRoom.get(client.id);
    if (!roomCode) return;

    this.socketToRoom.delete(client.id);
    const room = this.rooms.get(roomCode);
    if (!room) return;

    this.server.to(roomCode).emit('puzzle.duel.opponent_left', {
      socketId: client.id,
      roomCode,
    });

    this.rooms.delete(roomCode);
  }

  @SubscribeMessage('puzzle.duel.create')
  handleCreateRoom(@ConnectedSocket() client: Socket): { roomCode: string } {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomCode = `DUEL-${code}`;

    const room: DuelRoom = {
      roomCode,
      hostSocketId: client.id,
      hostScore: 0,
      guestScore: 0,
      hostStrikes: 0,
      guestStrikes: 0,
      createdAt: Date.now(),
    };

    this.rooms.set(roomCode, room);
    this.socketToRoom.set(client.id, roomCode);
    void client.join(roomCode);

    this.logger.log(`Room created: ${roomCode} by ${client.id}`);
    return { roomCode };
  }

  @SubscribeMessage('puzzle.duel.join')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string },
  ): { success: boolean; error?: string } {
    const code = data.roomCode.trim().toUpperCase();
    const room = this.rooms.get(code);

    if (!room) {
      return { success: false, error: 'Duel room not found' };
    }

    if (room.guestSocketId && room.guestSocketId !== client.id) {
      return { success: false, error: 'Duel room is full' };
    }

    room.guestSocketId = client.id;
    this.socketToRoom.set(client.id, code);
    void client.join(code);

    const matchSeed = Math.floor(Math.random() * 100000);
    this.server.to(code).emit('puzzle.duel.start', {
      roomCode: code,
      matchSeed,
      players: [room.hostSocketId, room.guestSocketId],
    });

    this.logger.log(`Player ${client.id} joined room ${code}`);
    return { success: true };
  }

  @SubscribeMessage('puzzle.duel.progress')
  handleProgress(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomCode: string;
      score: number;
      strikes: number;
      puzzleIndex: number;
    },
  ) {
    const room = this.rooms.get(data.roomCode);
    if (!room) return;

    if (client.id === room.hostSocketId) {
      room.hostScore = data.score;
      room.hostStrikes = data.strikes;
    } else {
      room.guestScore = data.score;
      room.guestStrikes = data.strikes;
    }

    client.to(data.roomCode).emit('puzzle.duel.opponent_progress', {
      score: data.score,
      strikes: data.strikes,
      puzzleIndex: data.puzzleIndex,
    });
  }

  @SubscribeMessage('puzzle.duel.finish')
  handleFinish(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomCode: string;
      score: number;
      strikes: number;
    },
  ) {
    this.server.to(data.roomCode).emit('puzzle.duel.ended', {
      roomCode: data.roomCode,
      finisherId: client.id,
      score: data.score,
      strikes: data.strikes,
    });
  }
}
