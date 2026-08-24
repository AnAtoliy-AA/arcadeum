import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { GameMessageHandlerFn } from './game-message-handler.interface';
import { SpadesService } from './spades/spades.service';
import type { SpadesOptions } from './engines/spades/spades.constants';
import { BaseGameGateway, maybeEncrypt } from './common/base-game.gateway';

@Injectable()
export class SpadesGateway extends BaseGameGateway<SpadesOptions> {
  protected readonly logger = new Logger(SpadesGateway.name);
  protected readonly eventPrefix = 'spades';

  constructor(protected readonly gameService: SpadesService) {
    super();
  }

  protected getGameHandlers(): Record<string, GameMessageHandlerFn> {
    return {
      'spades.session.bid': this.wrapHandler(
        'bid',
        async (client, payload, roomId, userId) => {
          if (typeof payload?.amount !== 'number') {
            throw new WsException('amount is required');
          }
          await this.gameService.bid(userId, roomId, {
            amount: payload.amount,
          });
          client.emit(
            'spades.session.bid_placed',
            maybeEncrypt({ roomId, userId, amount: payload.amount }),
          );
        },
      ),
      'spades.session.play_card': this.wrapHandler(
        'play card',
        async (client, payload, roomId, userId) => {
          if (typeof payload?.card !== 'string') {
            throw new WsException('card is required');
          }
          await this.gameService.playCard(userId, roomId, {
            card: payload.card,
          });
          client.emit(
            'spades.session.card_played',
            maybeEncrypt({ roomId, userId, card: payload.card }),
          );
        },
      ),
    };
  }
}
