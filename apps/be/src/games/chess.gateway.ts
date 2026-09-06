import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import type { GameMessageHandlerFn } from './game-message-handler.interface';
import { ChessService } from './chess/chess.service';
import { ChessStockfishService } from './chess/engine/chess-stockfish.service';
import type { ChessOptions } from './engines/chess/chess.types';
import {
  BaseGameGateway,
  extractRoomAndUser,
  handleError,
  maybeEncrypt,
  validatePayloadUserId,
} from './common/base-game.gateway';

@Injectable()
export class ChessGateway extends BaseGameGateway<ChessOptions> {
  protected readonly logger = new Logger(ChessGateway.name);
  protected readonly eventPrefix = 'chess';

  constructor(
    protected readonly gameService: ChessService,
    private readonly stockfishService: ChessStockfishService,
  ) {
    super();
  }

  protected override async handleSessionStart(
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

  protected getGameHandlers(): Record<string, GameMessageHandlerFn> {
    const handlers = {
      'chess.session.move': this.wrapHandler(
        'move',
        async (client, payload, roomId, userId) => {
          if (
            !payload?.fromFile ||
            !payload?.fromRank ||
            !payload?.toFile ||
            !payload?.toRank
          ) {
            throw new WsException(
              'fromFile, fromRank, toFile, toRank are required',
            );
          }
          await this.gameService.move(userId, roomId, {
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
        },
      ),
      'chess.session.resign': this.wrapHandler(
        'resign',
        async (client, _payload, roomId, userId) => {
          await this.gameService.forfeit(userId, roomId);
          client.emit(
            'chess.session.resigned',
            maybeEncrypt({ roomId, userId }),
          );
        },
      ),
      'chess.session.draw_offer': this.wrapHandler(
        'draw offer',
        async (client, _payload, roomId, userId) => {
          await this.gameService.drawOffer(userId, roomId);
          client.emit(
            'chess.session.draw_offered',
            maybeEncrypt({ roomId, userId }),
          );
        },
      ),
      'chess.session.draw_accept': this.wrapHandler(
        'draw accept',
        async (client, _payload, roomId, userId) => {
          await this.gameService.drawAccept(userId, roomId);
          client.emit(
            'chess.session.draw_accepted',
            maybeEncrypt({ roomId, userId }),
          );
        },
      ),
    };
    return handlers;
  }
}
