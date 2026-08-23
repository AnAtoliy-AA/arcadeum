import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { GameMessageHandlerFn } from './game-message-handler.interface';
import { PachisiService } from './pachisi/pachisi.service';
import type { PachisiOptions } from './engines/pachisi/pachisi.constants';
import { BaseGameGateway, maybeEncrypt } from './common/base-game.gateway';

@Injectable()
export class PachisiGateway extends BaseGameGateway<PachisiOptions> {
  protected readonly logger = new Logger(PachisiGateway.name);
  protected readonly eventPrefix = 'pachisi';

  constructor(protected readonly gameService: PachisiService) {
    super();
  }

  protected getGameHandlers(): Record<string, GameMessageHandlerFn> {
    return {
      'pachisi.session.roll': this.wrapHandler(
        'roll dice',
        async (client, _payload, roomId, userId) => {
          await this.gameService.rollDice(userId, roomId);
          client.emit(
            'pachisi.session.rolled',
            maybeEncrypt({ roomId, userId }),
          );
        },
      ),
      'pachisi.session.move': this.wrapHandler(
        'move token',
        async (client, payload, roomId, userId) => {
          if (
            !payload ||
            typeof payload.tokenId !== 'number' ||
            !Number.isInteger(payload.tokenId)
          ) {
            throw new WsException('tokenId (number) is required');
          }
          await this.gameService.moveToken(userId, roomId, payload.tokenId);
          client.emit(
            'pachisi.session.moved',
            maybeEncrypt({
              roomId,
              userId,
              tokenId: payload.tokenId,
            }),
          );
        },
      ),
    };
  }
}
