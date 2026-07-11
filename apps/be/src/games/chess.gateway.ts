import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';

import { ChessService } from './chess/chess.service';
import { extractRoomAndUser, handleError } from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { corsOriginMatcher } from '../common/utils/cors.util';
import { verifySocketJwt } from '../common/utils/socket-jwt.util';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: corsOriginMatcher },
})
@Injectable()
export class ChessGateway {
  private readonly logger = new Logger(ChessGateway.name);

  @WebSocketServer() server: Server;

  constructor(
    private readonly chessService: ChessService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    this.logger.verbose(`Client connected ${client.id}`);

    const authUserId = await verifySocketJwt(
      client,
      this.jwt,
      this.config,
      this.logger,
      'ChessGateway',
    );

    if (authUserId) {
      this.logger.debug(
        `Authenticated user ${authUserId} connected to Chess namespace`,
      );
    } else {
      this.logger.verbose(
        `Anonymous client connected to Chess namespace: ${client.id}`,
      );
    }
  }

  @SubscribeMessage('chess.session.start')
  async handleSessionStart(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      withBots?: boolean;
      botCount?: number;
      botDifficulty?: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    try {
      const result = await this.chessService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount,
        payload?.botDifficulty,
      );
      client.emit('chess.session.started', maybeEncrypt(result));
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'start Chess session', roomId, userId },
        'Unable to start session.',
      );
    }
  }

  @SubscribeMessage('chess.session.move')
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      fromFile?: string;
      fromRank?: number;
      toFile?: string;
      toRank?: number;
      promotion?: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    if (
      !payload?.fromFile ||
      !payload?.fromRank ||
      !payload?.toFile ||
      !payload?.toRank
    ) {
      throw new WsException('fromFile, fromRank, toFile, toRank are required');
    }
    try {
      await this.chessService.move(userId, roomId, {
        fromFile: payload.fromFile,
        fromRank: payload.fromRank,
        toFile: payload.toFile,
        toRank: payload.toRank,
        promotion: payload.promotion,
      });
      client.emit(
        'chess.session.moved',
        maybeEncrypt({
          roomId,
          userId,
          fromFile: payload.fromFile,
          fromRank: payload.fromRank,
          toFile: payload.toFile,
          toRank: payload.toRank,
        }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'move', roomId, userId },
        'Unable to make move.',
      );
    }
  }

  @SubscribeMessage('chess.session.resign')
  async handleForfeit(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    try {
      await this.chessService.forfeit(userId, roomId);
      client.emit('chess.session.resigned', maybeEncrypt({ roomId, userId }));
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'resign', roomId, userId },
        'Unable to resign.',
      );
    }
  }

  @SubscribeMessage('chess.session.draw_offer')
  async handleDrawOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    try {
      await this.chessService.drawOffer(userId, roomId);
      client.emit(
        'chess.session.draw_offered',
        maybeEncrypt({ roomId, userId }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'draw offer', roomId, userId },
        'Unable to offer draw.',
      );
    }
  }

  @SubscribeMessage('chess.session.draw_accept')
  async handleDrawAccept(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    try {
      await this.chessService.drawAccept(userId, roomId);
      client.emit(
        'chess.session.draw_accepted',
        maybeEncrypt({ roomId, userId }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'draw accept', roomId, userId },
        'Unable to accept draw.',
      );
    }
  }
}
