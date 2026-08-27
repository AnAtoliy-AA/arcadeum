import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { GameMessageHandlerFn } from './game-message-handler.interface';
import { GoService } from './go/go.service';
import type { GoOptions } from './engines/go/go.constants';
import { BaseGameGateway, maybeEncrypt } from './common/base-game.gateway';

@Injectable()
export class GoGateway extends BaseGameGateway<GoOptions> {
  protected readonly logger = new Logger(GoGateway.name);
  protected readonly eventPrefix = 'go';

  constructor(protected readonly gameService: GoService) {
    super();
  }

  protected getGameHandlers(): Record<string, GameMessageHandlerFn> {
    return {
      'go.session.place_stone': this.wrapHandler(
        'place stone',
        async (client, payload, roomId, userId) => {
          const { row, col } = payload as {
            row?: unknown;
            col?: unknown;
          };
          if (
            typeof row !== 'number' ||
            typeof col !== 'number' ||
            !Number.isInteger(row) ||
            !Number.isInteger(col)
          ) {
            throw new WsException('row and col are required');
          }
          await this.gameService.placeStone(userId, roomId, { row, col });
          client.emit(
            'go.session.stone_placed',
            maybeEncrypt({ roomId, userId, row, col }),
          );
        },
      ),
      'go.session.pass': this.wrapHandler(
        'pass turn',
        async (client, _payload, roomId, userId) => {
          await this.gameService.passTurn(userId, roomId);
          client.emit('go.session.passed', maybeEncrypt({ roomId, userId }));
        },
      ),
    };
  }
}
