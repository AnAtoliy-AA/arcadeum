import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from './game-message-handler.interface';

import { CatDashService } from './cat-dash/cat-dash.service';
import {
  extractRoomAndUser,
  handleError,
  validatePayloadUserId,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';

@Injectable()
export class CatDashGateway implements GameMessageHandler {
  private readonly logger = new Logger(CatDashGateway.name);

  constructor(private readonly catDashService: CatDashService) {}

  readonly handlers: Record<string, GameMessageHandlerFn> = {
    'catDash.session.start': (client, payload) =>
      this.handleSessionStart(client, payload),
    'catDash.session.rollDice': (client, payload) =>
      this.handleRollDice(client, payload),
    'catDash.session.useAbility': (client, payload) =>
      this.handleUseAbility(client, payload),
    'catDash.session.choosePath': (client, payload) =>
      this.handleChoosePath(client, payload),
    'catDash.session.forfeit': (client, payload) =>
      this.handleForfeit(client, payload),
  };

  private async handleSessionStart(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const result = await this.catDashService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount as number | undefined,
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

  private async handleRollDice(
    client: Socket,
    payload: Record<string, unknown>,
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

  private async handleUseAbility(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    if (!payload?.abilityId) {
      throw new WsException('abilityId is required');
    }
    validatePayloadUserId(client, userId);
    try {
      await this.catDashService.useAbility(
        userId,
        roomId,
        payload.abilityId as string,
      );
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

  private async handleChoosePath(
    client: Socket,
    payload: Record<string, unknown>,
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

  private async handleForfeit(
    client: Socket,
    payload: Record<string, unknown>,
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
