import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from './game-message-handler.interface';

import { CascadeService } from './cascade/cascade.service';
import {
  extractRoomAndUser,
  handleError,
  validatePayloadUserId,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { isActiveColor } from './engines/cascade/cascade.utils';

@Injectable()
export class CascadeGateway implements GameMessageHandler {
  private readonly logger = new Logger(CascadeGateway.name);

  constructor(private readonly cascadeService: CascadeService) {}

  readonly handlers: Record<string, GameMessageHandlerFn> = {
    'cascade.session.start': (client, payload) =>
      this.handleSessionStart(client, payload),
    'cascade.session.play_card': (client, payload) =>
      this.handlePlayCard(client, payload),
    'cascade.session.draw': (client, payload) =>
      this.handleDraw(client, payload),
    'cascade.session.name_color': (client, payload) =>
      this.handleNameColor(client, payload),
    'cascade.session.call_cascade': (client, payload) =>
      this.handleCallCascade(client, payload),
    'cascade.session.forfeit': (client, payload) =>
      this.handleForfeit(client, payload),
  };

  private async handleSessionStart(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const result = await this.cascadeService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount as number | undefined,
      );
      client.emit('cascade.session.started', maybeEncrypt(result));
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'start Cascade session', roomId, userId },
        'Unable to start session.',
      );
    }
  }

  private async handlePlayCard(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    if (!payload?.cardId) throw new WsException('cardId is required');
    const chosenColor =
      typeof payload.chosenColor === 'string' &&
      isActiveColor(payload.chosenColor)
        ? payload.chosenColor
        : undefined;
    try {
      await this.cascadeService.playCard(userId, roomId, {
        cardId: payload.cardId as string,
        chosenColor,
      });
      client.emit(
        'cascade.session.card_played',
        maybeEncrypt({ roomId, userId, cardId: payload.cardId }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'play card', roomId, userId },
        'Unable to play card.',
      );
    }
  }

  private async handleDraw(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      await this.cascadeService.draw(userId, roomId);
      client.emit('cascade.session.drew', maybeEncrypt({ roomId, userId }));
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'draw', roomId, userId },
        'Unable to draw.',
      );
    }
  }

  private async handleNameColor(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    if (typeof payload?.color !== 'string' || !isActiveColor(payload.color))
      throw new WsException('color is required');
    try {
      await this.cascadeService.nameColor(userId, roomId, {
        color: payload.color,
      });
      client.emit(
        'cascade.session.color_named',
        maybeEncrypt({ roomId, userId, color: payload.color }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'name color', roomId, userId },
        'Unable to name color.',
      );
    }
  }

  private async handleCallCascade(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      await this.cascadeService.callCascade(userId, roomId);
      client.emit(
        'cascade.session.cascade_called',
        maybeEncrypt({ roomId, userId }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'call cascade', roomId, userId },
        'Unable to call Cascade.',
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
      await this.cascadeService.forfeit(userId, roomId);
      client.emit(
        'cascade.session.forfeited',
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
