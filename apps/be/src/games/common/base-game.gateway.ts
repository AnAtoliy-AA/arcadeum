import { Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from '../game-message-handler.interface';
import {
  extractRoomAndUser,
  extractString,
  handleError,
  validatePayloadUserId,
} from '../games.gateway.utils';
import { maybeEncrypt } from '../../common/utils/socket-encryption.util';
import type { BaseGameService } from './base-game.service';

export abstract class BaseGameGateway<
  TOptions extends object = Record<string, unknown>,
> implements GameMessageHandler {
  protected abstract readonly logger: Logger;
  protected abstract readonly eventPrefix: string;
  protected abstract readonly gameService: BaseGameService<TOptions>;

  get handlers(): Record<string, GameMessageHandlerFn> {
    return {
      [`${this.eventPrefix}.session.start`]: (client, payload) =>
        this.handleSessionStart(client, payload),
      [`${this.eventPrefix}.session.forfeit`]: (client, payload) =>
        this.handleForfeit(client, payload),
      ...this.getGameHandlers(),
    };
  }

  protected abstract getGameHandlers(): Record<string, GameMessageHandlerFn>;

  protected async handleSessionStart(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const result = await this.gameService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount as number | undefined,
      );
      client.emit(`${this.eventPrefix}.session.started`, maybeEncrypt(result));
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: `start ${this.gameService.gameName} session`,
          roomId,
          userId,
        },
        'Unable to start session.',
      );
    }
  }

  protected async handleForfeit(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      await this.gameService.forfeit(userId, roomId);
      client.emit(
        `${this.eventPrefix}.session.forfeited`,
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

  protected wrapHandler(
    actionName: string,
    handler: (
      client: Socket,
      payload: Record<string, unknown>,
      roomId: string,
      userId: string,
    ) => Promise<void>,
  ): GameMessageHandlerFn {
    return async (client: Socket, payload: Record<string, unknown>) => {
      const { roomId, userId } = extractRoomAndUser(payload);
      validatePayloadUserId(client, userId);
      try {
        await handler(client, payload, roomId, userId);
      } catch (error) {
        handleError(
          this.logger,
          error,
          { action: actionName, roomId, userId },
          `Unable to ${actionName}.`,
        );
      }
    };
  }
}

export {
  extractRoomAndUser,
  extractString,
  handleError,
  validatePayloadUserId,
  maybeEncrypt,
};
