import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { GameMessageHandlerFn } from './game-message-handler.interface';
import { HeartsService } from './hearts/hearts.service';
import type { HeartsOptions } from './engines/hearts/hearts.constants';
import { BaseGameGateway, maybeEncrypt } from './common/base-game.gateway';

@Injectable()
export class HeartsGateway extends BaseGameGateway<HeartsOptions> {
  protected readonly logger = new Logger(HeartsGateway.name);
  protected readonly eventPrefix = 'hearts';

  constructor(protected readonly gameService: HeartsService) {
    super();
  }

  protected getGameHandlers(): Record<string, GameMessageHandlerFn> {
    return {
      'hearts.session.pass_cards': this.wrapHandler(
        'pass cards',
        async (client, payload, roomId, userId) => {
          if (!Array.isArray(payload?.cards)) {
            throw new WsException('cards array is required');
          }
          // Reject malformed entries instead of silently filtering them:
          // filtering would fail later with a confusing "exactly 3 cards"
          // error far from the actual problem.
          if (payload.cards.some((c: unknown) => typeof c !== 'string')) {
            throw new WsException('cards must be card id strings');
          }
          // Safe: every entry was verified to be a string above.
          const cards = payload.cards as string[];
          await this.gameService.passCards(userId, roomId, { cards });
          client.emit(
            'hearts.session.cards_passed',
            maybeEncrypt({ roomId, userId, cards }),
          );
        },
      ),
      'hearts.session.play_card': this.wrapHandler(
        'play card',
        async (client, payload, roomId, userId) => {
          if (typeof payload?.card !== 'string') {
            throw new WsException('card is required');
          }
          await this.gameService.playCard(userId, roomId, {
            card: payload.card,
          });
          client.emit(
            'hearts.session.card_played',
            maybeEncrypt({ roomId, userId, card: payload.card }),
          );
        },
      ),
    };
  }
}
