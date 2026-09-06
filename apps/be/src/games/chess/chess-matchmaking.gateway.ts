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
import { ChessMatchmakingService } from './chess-matchmaking.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chess-matchmaking',
})
export class ChessMatchmakingGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChessMatchmakingGateway.name);

  private readonly userSockets = new Map<string, string>();
  private readonly socketUsers = new Map<string, string>();

  constructor(private readonly matchmakingService: ChessMatchmakingService) {}

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      this.userSockets.delete(userId);
      this.socketUsers.delete(client.id);
    }
  }

  @SubscribeMessage('chess.matchmaking.join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { userId: string; rating: number; timeControlType: string },
  ) {
    const { userId, rating, timeControlType } = data;

    this.userSockets.set(userId, client.id);
    this.socketUsers.set(client.id, userId);

    const result = await this.matchmakingService.joinQueue(
      userId,
      rating,
      timeControlType,
    );

    client.emit('chess.matchmaking.joined', {
      queued: result.queued,
      position: result.position,
    });

    this.tryMatch(timeControlType);
  }

  @SubscribeMessage('chess.matchmaking.leave')
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; timeControlType: string },
  ) {
    await this.matchmakingService.leaveQueue(data.userId, data.timeControlType);
    client.emit('chess.matchmaking.left');
  }

  @SubscribeMessage('chess.matchmaking.status')
  async handleStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; timeControlType: string },
  ) {
    const position = await this.matchmakingService.getQueuePosition(
      data.userId,
      data.timeControlType,
    );
    const queueSize = await this.matchmakingService.getQueueSize(
      data.timeControlType,
    );

    client.emit('chess.matchmaking.status', {
      position,
      queueSize,
    });
  }

  private async tryMatch(timeControlType: string) {
    const queueSize = await this.matchmakingService.getQueueSize(
      timeControlType,
    );
    if (queueSize < 2) return;

    const queueKey = `chess:matchmaking:${timeControlType}`;
    const candidates = await this.matchmakingService['redis']?.zrange(
      queueKey,
      0,
      -1,
    );
    if (!candidates || candidates.length < 2) return;

    for (const userId of candidates) {
      const match = await this.matchmakingService.findMatch(
        userId,
        timeControlType,
      );
      if (match) {
        this.notifyMatch(match);
        return;
      }
    }
  }

  private notifyMatch(match: { roomId: string; white: string; black: string }) {
    const whiteSocketId = this.userSockets.get(match.white);
    const blackSocketId = this.userSockets.get(match.black);

    if (whiteSocketId) {
      this.server
        .to(whiteSocketId)
        .emit('chess.matchmaking.matched', {
          roomId: match.roomId,
          color: 'white',
          opponent: match.black,
        });
    }
    if (blackSocketId) {
      this.server
        .to(blackSocketId)
        .emit('chess.matchmaking.matched', {
          roomId: match.roomId,
          color: 'black',
          opponent: match.white,
        });
    }

    this.logger.log(
      `Match notified: ${match.white} (white) vs ${match.black} (black)`,
    );
  }
}
