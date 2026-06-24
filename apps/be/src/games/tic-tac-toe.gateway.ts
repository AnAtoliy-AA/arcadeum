import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';

import { TicTacToeService } from './tic-tac-toe/tic-tac-toe.service';
import { extractRoomAndUser, handleError } from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { corsOriginMatcher } from '../common/utils/cors.util';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: corsOriginMatcher },
})
@Injectable()
export class TicTacToeGateway {
  private readonly logger = new Logger(TicTacToeGateway.name);

  constructor(private readonly ticTacToeService: TicTacToeService) {}

  @SubscribeMessage('ticTacToe.session.start')
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
      const result = await this.ticTacToeService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount,
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

  @SubscribeMessage('ticTacToe.session.place_mark')
  async handlePlaceMark(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      row?: number;
      col?: number;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    if (typeof payload?.row !== 'number' || typeof payload?.col !== 'number') {
      throw new WsException('row and col are required');
    }
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

  @SubscribeMessage('ticTacToe.session.forfeit')
  async handleForfeit(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
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
