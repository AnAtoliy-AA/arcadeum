import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from './game-message-handler.interface';

import { CheckersService } from './checkers/checkers.service';
import {
  extractRoomAndUser,
  handleError,
  validatePayloadUserId,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import type { MoveStep } from './engines/checkers/checkers.types';

@Injectable()
export class CheckersGateway implements GameMessageHandler {
  private readonly logger = new Logger(CheckersGateway.name);

  constructor(private readonly checkersService: CheckersService) {}

  readonly handlers: Record<string, GameMessageHandlerFn> = {
    'checkers.session.start': (client, payload) =>
      this.handleSessionStart(client, payload),
    'checkers.session.move_piece': (client, payload) =>
      this.handleMovePiece(client, payload),
    'checkers.session.forfeit': (client, payload) =>
      this.handleForfeit(client, payload),
  };

  private async handleSessionStart(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const result = await this.checkersService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount as number | undefined,
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

  private async handleMovePiece(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    if (
      !payload?.steps ||
      !Array.isArray(payload.steps) ||
      payload.steps.length === 0
    ) {
      throw new WsException('steps are required');
    }
    try {
      await this.checkersService.movePiece(userId, roomId, {
        steps: payload.steps as MoveStep[],
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

  private async handleForfeit(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
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
