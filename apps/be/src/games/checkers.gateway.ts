import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { GameMessageHandlerFn } from './game-message-handler.interface';
import { CheckersService } from './checkers/checkers.service';
import type { CheckersOptions } from './engines/checkers/checkers.types';
import { BaseGameGateway, maybeEncrypt } from './common/base-game.gateway';
import type { MoveStep } from './engines/checkers/checkers.types';

@Injectable()
export class CheckersGateway extends BaseGameGateway<CheckersOptions> {
  protected readonly logger = new Logger(CheckersGateway.name);
  protected readonly eventPrefix = 'checkers';

  constructor(protected readonly gameService: CheckersService) {
    super();
  }

  protected getGameHandlers(): Record<string, GameMessageHandlerFn> {
    return {
      'checkers.session.move_piece': this.wrapHandler(
        'move piece',
        async (client, payload, roomId, userId) => {
          if (
            !payload?.steps ||
            !Array.isArray(payload.steps) ||
            payload.steps.length === 0
          ) {
            throw new WsException('steps are required');
          }
          await this.gameService.movePiece(userId, roomId, {
            steps: payload.steps as MoveStep[],
          });
          client.emit(
            'checkers.session.piece_moved',
            maybeEncrypt({ roomId, userId, steps: payload.steps }),
          );
        },
      ),
    };
  }
}
