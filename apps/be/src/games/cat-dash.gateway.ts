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

import { CatDashService } from './cat-dash/cat-dash.service';
import {
  extractRoomAndUser,
  handleError,
  validatePayloadUserId,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { corsOriginMatcher } from '../common/utils/cors.util';
import { verifySocketJwt } from '../common/utils/socket-jwt.util';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: corsOriginMatcher },
})
@Injectable()
export class CatDashGateway {
  private readonly logger = new Logger(CatDashGateway.name);

  @WebSocketServer() server: Server;

  constructor(
    private readonly catDashService: CatDashService,
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
      'CatDashGateway',
    );

    if (authUserId) {
      this.logger.debug(
        `Authenticated user ${authUserId} connected to CatDash namespace`,
      );
    } else {
      this.logger.verbose(
        `Anonymous client connected to CatDash namespace: ${client.id}`,
      );
    }
  }

  @SubscribeMessage('catDash.session.start')
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
    validatePayloadUserId(client, userId);
    try {
      const result = await this.catDashService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount,
      );
      client.emit('catDash.session.started', maybeEncrypt(result));
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'start Cat Dash session', roomId, userId },
        'Unable to start session.',
      );
    }
  }

  @SubscribeMessage('catDash.session.rollDice')
  async handleRollDice(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      await this.catDashService.rollDice(userId, roomId);
      client.emit(
        'catDash.session.diceRolled',
        maybeEncrypt({ roomId, userId }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'roll dice', roomId, userId },
        'Unable to roll dice.',
      );
    }
  }

  @SubscribeMessage('catDash.session.useAbility')
  async handleUseAbility(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      abilityId?: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    if (!payload?.abilityId) {
      throw new WsException('abilityId is required');
    }
    validatePayloadUserId(client, userId);
    try {
      await this.catDashService.useAbility(userId, roomId, payload.abilityId);
      client.emit(
        'catDash.session.abilityUsed',
        maybeEncrypt({ roomId, userId, abilityId: payload.abilityId }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'use ability', roomId, userId },
        'Unable to use ability.',
      );
    }
  }

  @SubscribeMessage('catDash.session.choosePath')
  async handleChoosePath(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      pathIndex?: number;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    if (typeof payload?.pathIndex !== 'number') {
      throw new WsException('pathIndex is required');
    }
    validatePayloadUserId(client, userId);
    try {
      await this.catDashService.choosePath(userId, roomId, payload.pathIndex);
      client.emit(
        'catDash.session.pathChosen',
        maybeEncrypt({ roomId, userId, pathIndex: payload.pathIndex }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'choose path', roomId, userId },
        'Unable to choose path.',
      );
    }
  }

  @SubscribeMessage('catDash.session.forfeit')
  async handleForfeit(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      await this.catDashService.forfeit(userId, roomId);
      client.emit(
        'catDash.session.forfeited',
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
