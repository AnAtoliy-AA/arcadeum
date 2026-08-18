import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { GameMessageHandlerFn } from './game-message-handler.interface';
import { CascadeService } from './cascade/cascade.service';
import type { CascadeOptions } from './engines/cascade/cascade.types';
import { BaseGameGateway, maybeEncrypt } from './common/base-game.gateway';
import { isActiveColor } from './engines/cascade/cascade.utils';

@Injectable()
export class CascadeGateway extends BaseGameGateway<CascadeOptions> {
  protected readonly logger = new Logger(CascadeGateway.name);
  protected readonly eventPrefix = 'cascade';

  constructor(protected readonly gameService: CascadeService) {
    super();
  }

  protected getGameHandlers(): Record<string, GameMessageHandlerFn> {
    return {
      'cascade.session.play_card': this.wrapHandler(
        'play card',
        async (client, payload, roomId, userId) => {
          if (!payload?.cardId) throw new WsException('cardId is required');
          const chosenColor =
            typeof payload.chosenColor === 'string' &&
            isActiveColor(payload.chosenColor)
              ? payload.chosenColor
              : undefined;
          await this.gameService.playCard(userId, roomId, {
            cardId: payload.cardId as string,
            chosenColor,
          });
          client.emit(
            'cascade.session.card_played',
            maybeEncrypt({ roomId, userId, cardId: payload.cardId }),
          );
        },
      ),
      'cascade.session.draw': this.wrapHandler(
        'draw',
        async (client, _payload, roomId, userId) => {
          await this.gameService.draw(userId, roomId);
          client.emit('cascade.session.drew', maybeEncrypt({ roomId, userId }));
        },
      ),
      'cascade.session.name_color': this.wrapHandler(
        'name color',
        async (client, payload, roomId, userId) => {
          if (
            typeof payload?.color !== 'string' ||
            !isActiveColor(payload.color)
          )
            throw new WsException('color is required');
          await this.gameService.nameColor(userId, roomId, {
            color: payload.color,
          });
          client.emit(
            'cascade.session.color_named',
            maybeEncrypt({ roomId, userId, color: payload.color }),
          );
        },
      ),
      'cascade.session.call_cascade': this.wrapHandler(
        'call cascade',
        async (client, _payload, roomId, userId) => {
          await this.gameService.callCascade(userId, roomId);
          client.emit(
            'cascade.session.cascade_called',
            maybeEncrypt({ roomId, userId }),
          );
        },
      ),
    };
  }
}
