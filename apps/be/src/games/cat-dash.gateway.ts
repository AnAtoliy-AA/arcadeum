import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { GameMessageHandlerFn } from './game-message-handler.interface';
import { CatDashService } from './cat-dash/cat-dash.service';
import { BaseGameGateway, maybeEncrypt } from './common/base-game.gateway';

@Injectable()
export class CatDashGateway extends BaseGameGateway {
  protected readonly logger = new Logger(CatDashGateway.name);
  protected readonly eventPrefix = 'catDash';

  constructor(protected readonly gameService: CatDashService) {
    super();
  }

  protected getGameHandlers(): Record<string, GameMessageHandlerFn> {
    return {
      'catDash.session.rollDice': this.wrapHandler(
        'roll dice',
        async (client, _payload, roomId, userId) => {
          await this.gameService.rollDice(userId, roomId);
          client.emit(
            'catDash.session.diceRolled',
            maybeEncrypt({ roomId, userId }),
          );
        },
      ),
      'catDash.session.useAbility': this.wrapHandler(
        'use ability',
        async (client, payload, roomId, userId) => {
          if (!payload?.abilityId) {
            throw new WsException('abilityId is required');
          }
          await this.gameService.useAbility(
            userId,
            roomId,
            payload.abilityId as string,
          );
          client.emit(
            'catDash.session.abilityUsed',
            maybeEncrypt({ roomId, userId, abilityId: payload.abilityId }),
          );
        },
      ),
      'catDash.session.choosePath': this.wrapHandler(
        'choose path',
        async (client, payload, roomId, userId) => {
          if (typeof payload?.pathIndex !== 'number') {
            throw new WsException('pathIndex is required');
          }
          await this.gameService.choosePath(userId, roomId, payload.pathIndex);
          client.emit(
            'catDash.session.pathChosen',
            maybeEncrypt({ roomId, userId, pathIndex: payload.pathIndex }),
          );
        },
      ),
    };
  }
}
