import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { GameMessageHandlerFn } from './game-message-handler.interface';
import { TicTacToeService } from './tic-tac-toe/tic-tac-toe.service';
import type { TicTacToeOptions } from './engines/tic-tac-toe/tic-tac-toe.types';
import { BaseGameGateway, maybeEncrypt } from './common/base-game.gateway';

@Injectable()
export class TicTacToeGateway extends BaseGameGateway<TicTacToeOptions> {
  protected readonly logger = new Logger(TicTacToeGateway.name);
  protected readonly eventPrefix = 'ticTacToe';

  constructor(protected readonly gameService: TicTacToeService) {
    super();
  }

  protected getGameHandlers(): Record<string, GameMessageHandlerFn> {
    return {
      'ticTacToe.session.place_mark': this.wrapHandler(
        'place mark',
        async (client, payload, roomId, userId) => {
          if (
            typeof payload?.row !== 'number' ||
            typeof payload?.col !== 'number'
          ) {
            throw new WsException('row and col are required');
          }
          await this.gameService.placeMark(userId, roomId, {
            row: payload.row,
            col: payload.col,
          });
          client.emit(
            'ticTacToe.session.mark_placed',
            maybeEncrypt({
              roomId,
              userId,
              row: payload.row,
              col: payload.col,
            }),
          );
        },
      ),
    };
  }
}
