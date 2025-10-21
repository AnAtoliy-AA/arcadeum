import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import { GamesService } from './games.service';
import { GamesRealtimeService } from './games.realtime.service';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: '*' },
})
@Injectable()
export class GamesGateway {
  private readonly logger = new Logger(GamesGateway.name);

  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly gamesService: GamesService,
    private readonly realtime: GamesRealtimeService,
  ) {}

  afterInit(): void {
    this.realtime.registerServer(this.server);
    this.logger.debug('Games gateway initialized.');
  }

  handleConnection(client: Socket): void {
    this.logger.verbose(`Client connected ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.verbose(`Client disconnected ${client.id}`);
  }

  @SubscribeMessage('games.room.join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const roomId =
      typeof payload?.roomId === 'string' ? payload.roomId.trim() : '';
    const userId =
      typeof payload?.userId === 'string' ? payload.userId.trim() : '';

    if (!roomId) {
      throw new WsException('roomId is required.');
    }
    if (!userId) {
      throw new WsException('userId is required.');
    }

    const room = await this.gamesService.ensureParticipant(roomId, userId);
    const session = await this.gamesService.findSessionByRoom(room.id);

    const channel = this.realtime.roomChannel(room.id);
    await client.join(channel);

    client.emit('games.room.joined', {
      room,
      session,
    });

    if (session) {
      this.realtime.emitSessionSnapshotToClient(client, room.id, session);
    }
  }

  @SubscribeMessage('games.session.request')
  async handleSessionRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string },
  ): Promise<void> {
    const roomId =
      typeof payload?.roomId === 'string' ? payload.roomId.trim() : '';
    if (!roomId) {
      throw new WsException('roomId is required.');
    }

    const session = await this.gamesService.findSessionByRoom(roomId);
    if (!session) {
      return;
    }

    this.realtime.emitSessionSnapshotToClient(client, roomId, session);
  }
}
