import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';

import { CascadeService } from './cascade/cascade.service';
import { extractRoomAndUser, handleError } from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { corsOriginMatcher } from '../common/utils/cors.util';
import { isActiveColor } from './engines/cascade/cascade.utils';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: corsOriginMatcher },
})
@Injectable()
export class CascadeGateway {
  private readonly logger = new Logger(CascadeGateway.name);

  constructor(private readonly cascadeService: CascadeService) {}

  @SubscribeMessage('cascade.session.start')
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
      const result = await this.cascadeService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount,
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

  @SubscribeMessage('cascade.session.play_card')
  async handlePlayCard(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      cardId?: string;
      chosenColor?: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    if (!payload?.cardId) throw new WsException('cardId is required');
    const chosenColor =
      payload.chosenColor && isActiveColor(payload.chosenColor)
        ? payload.chosenColor
        : undefined;
    try {
      await this.cascadeService.playCard(userId, roomId, {
        cardId: payload.cardId,
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

  @SubscribeMessage('cascade.session.draw')
  async handleDraw(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
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

  @SubscribeMessage('cascade.session.name_color')
  async handleNameColor(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; color?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    if (!isActiveColor(payload?.color))
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

  @SubscribeMessage('cascade.session.call_cascade')
  async handleCallCascade(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
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

  @SubscribeMessage('cascade.session.forfeit')
  async handleForfeit(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
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
