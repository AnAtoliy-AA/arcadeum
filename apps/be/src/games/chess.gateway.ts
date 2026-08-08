import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from './game-message-handler.interface';

import { ChessService } from './chess/chess.service';
import {
  extractRoomAndUser,
  handleError,
  validatePayloadUserId,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';

@Injectable()
export class ChessGateway implements GameMessageHandler {
  private readonly logger = new Logger(ChessGateway.name);

  constructor(private readonly chessService: ChessService) {}

  readonly handlers: Record<string, GameMessageHandlerFn> = {
    'chess.session.start': (client, payload) =>
      this.handleSessionStart(client, payload),
    'chess.session.move': (client, payload) => this.handleMove(client, payload),
    'chess.session.resign': (client, payload) =>
      this.handleForfeit(client, payload),
    'chess.session.draw_offer': (client, payload) =>
      this.handleDrawOffer(client, payload),
    'chess.session.draw_accept': (client, payload) =>
      this.handleDrawAccept(client, payload),
  };

  private async handleSessionStart(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const result = await this.chessService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount as number | undefined,
        payload?.botDifficulty as string | undefined,
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

  private async handleMove(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
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
        fromFile: payload.fromFile as string,
        fromRank: payload.fromRank as number,
        toFile: payload.toFile as string,
        toRank: payload.toRank as number,
        promotion: payload.promotion as string | undefined,
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

  private async handleForfeit(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
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

  private async handleDrawOffer(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
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

  private async handleDrawAccept(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
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
