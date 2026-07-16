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

import { CheckersService } from './checkers/checkers.service';
import { extractRoomAndUser, handleError } from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { corsOriginMatcher } from '../common/utils/cors.util';
import { verifySocketJwt } from '../common/utils/socket-jwt.util';
import type { MoveStep } from '../engines/checkers/checkers.types';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: corsOriginMatcher },
})
@Injectable()
export class CheckersGateway {
  private readonly logger = new Logger(CheckersGateway.name);

  @WebSocketServer() server: Server;

  constructor(
    private readonly checkersService: CheckersService,
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
      'CheckersGateway',
    );

    if (authUserId) {
      this.logger.debug(
        `Authenticated user ${authUserId} connected to Checkers namespace`,
      );
    } else {
      this.logger.verbose(
        `Anonymous client connected to Checkers namespace: ${client.id}`,
      );
    }
  }

  @SubscribeMessage('checkers.session.start')
  async handleSessionStart(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      withBots?: boolean;
      botCount?: number;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    try {
      const result = await this.checkersService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount,
      );
      client.emit('checkers.session.started', maybeEncrypt(result));
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'start Checkers session', roomId, userId },
        'Unable to start session.',
      );
    }
  }

  @SubscribeMessage('checkers.session.move_piece')
  async handleMovePiece(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      steps?: MoveStep[];
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    if (!payload?.steps || !Array.isArray(payload.steps) || payload.steps.length === 0) {
      throw new WsException('steps are required');
    }
    try {
      await this.checkersService.movePiece(userId, roomId, {
        steps: payload.steps,
      });
      client.emit(
        'checkers.session.piece_moved',
        maybeEncrypt({ roomId, userId, steps: payload.steps }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'move piece', roomId, userId },
        'Unable to move piece.',
      );
    }
  }

  @SubscribeMessage('checkers.session.forfeit')
  async handleForfeit(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    try {
      await this.checkersService.forfeit(userId, roomId);
      client.emit(
        'checkers.session.forfeited',
        maybeEncrypt({ roomId, userId }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'forfeit', roomId, userId },
        'Unable to forfeit.',
      );
    }
  }
}
