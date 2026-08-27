import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { GameMessageHandlerFn } from './game-message-handler.interface';
import { BackgammonService } from './backgammon/backgammon.service';
import type { BackgammonOptions } from './engines/backgammon/backgammon.constants';
import { BaseGameGateway, maybeEncrypt } from './common/base-game.gateway';

@Injectable()
export class BackgammonGateway extends BaseGameGateway<BackgammonOptions> {
  protected readonly logger = new Logger(BackgammonGateway.name);
  protected readonly eventPrefix = 'backgammon';

  constructor(protected readonly gameService: BackgammonService) {
    super();
  }

  protected getGameHandlers(): Record<string, GameMessageHandlerFn> {
    return {
      'backgammon.session.roll': this.wrapHandler(
        'roll dice',
        async (client, _payload, roomId, userId) => {
          await this.gameService.rollDice(userId, roomId);
          client.emit(
            'backgammon.session.rolled',
            maybeEncrypt({ roomId, userId }),
          );
        },
      ),
      'backgammon.session.move': this.wrapHandler(
        'move checker',
        async (client, payload, roomId, userId) => {
          if (payload?.from === undefined || payload?.to === undefined) {
            throw new WsException('from and to are required');
          }
          await this.gameService.moveChecker(userId, roomId, {
            from: payload.from as number | 'bar',
            to: payload.to as number | 'off',
          });
          client.emit(
            'backgammon.session.moved',
            maybeEncrypt({
              roomId,
              userId,
              from: payload.from,
              to: payload.to,
            }),
          );
        },
      ),
    };
  }
}
