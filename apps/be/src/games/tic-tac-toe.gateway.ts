import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from './game-message-handler.interface';

import { TicTacToeService } from './tic-tac-toe/tic-tac-toe.service';
import {
  extractRoomAndUser,
  handleError,
  validatePayloadUserId,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';

@Injectable()
export class TicTacToeGateway implements GameMessageHandler {
  private readonly logger = new Logger(TicTacToeGateway.name);

  constructor(private readonly ticTacToeService: TicTacToeService) {}

  readonly handlers: Record<string, GameMessageHandlerFn> = {
    'ticTacToe.session.start': (client, payload) =>
      this.handleSessionStart(client, payload),
    'ticTacToe.session.place_mark': (client, payload) =>
      this.handlePlaceMark(client, payload),
    'ticTacToe.session.forfeit': (client, payload) =>
      this.handleForfeit(client, payload),
  };

  private async handleSessionStart(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const result = await this.ticTacToeService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount as number | undefined,
      );
      client.emit('ticTacToe.session.started', maybeEncrypt(result));
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'start Tic-Tac-Toe session', roomId, userId },
        'Unable to start session.',
      );
    }
  }

  private async handlePlaceMark(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    if (typeof payload?.row !== 'number' || typeof payload?.col !== 'number') {
      throw new WsException('row and col are required');
    }
    validatePayloadUserId(client, userId);
    try {
      await this.ticTacToeService.placeMark(userId, roomId, {
        row: payload.row,
        col: payload.col,
      });
      client.emit(
        'ticTacToe.session.mark_placed',
        maybeEncrypt({ roomId, userId, row: payload.row, col: payload.col }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'place mark', roomId, userId },
        'Unable to place mark.',
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
      await this.ticTacToeService.forfeit(userId, roomId);
      client.emit(
        'ticTacToe.session.forfeited',
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
