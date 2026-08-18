import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import type { GameMessageHandlerFn } from './game-message-handler.interface';
import { CriticalService } from './critical/critical.service';
import {
  BaseGameGateway,
  extractString,
  handleError,
  maybeEncrypt,
  validatePayloadUserId,
} from './common/base-game.gateway';

@Injectable()
export class CriticalGateway extends BaseGameGateway<Record<string, unknown>> {
  protected readonly logger = new Logger(CriticalGateway.name);
  protected readonly eventPrefix = 'games';

  constructor(protected readonly gameService: CriticalService) {
    super();
  }

  protected override async handleSessionStart(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const userId = extractString(payload, 'userId');
    const roomIdRaw =
      typeof payload?.roomId === 'string' ? payload.roomId.trim() : '';
    const roomId = roomIdRaw || undefined;
    const engine =
      typeof payload?.engine === 'string' ? payload.engine.trim() : undefined;
    const withBots = !!payload?.withBots;

    validatePayloadUserId(client, userId);

    try {
      const result = await this.gameService.startSession(
        userId,
        roomId,
        withBots,
        payload?.botCount as number | undefined,
        engine,
      );

      client.emit('games.session.started', maybeEncrypt(result));
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'start Critical session',
          roomId: roomId || 'unknown',
          userId,
        },
        'Unable to start session.',
      );
    }
  }

  protected getGameHandlers(): Record<string, GameMessageHandlerFn> {
    return {
      'games.session.play_defuse': this.wrapHandler(
        'play Defuse card',
        async (client, payload, roomId, userId) => {
          const position =
            typeof payload?.position === 'number'
              ? payload.position
              : undefined;

          if (position === undefined || position < 0) {
            throw new WsException(
              'position is required and must be a non-negative number.',
            );
          }

          await this.gameService.defuseByRoom(userId, roomId, position);

          client.emit(
            'games.session.defuse.played',
            maybeEncrypt({
              roomId,
              userId,
              position,
            }),
          );
        },
      ),
      'games.session.play_nope': this.wrapHandler(
        'play Nope card',
        async (client, _payload, roomId, userId) => {
          await this.gameService.playNopeByRoom(userId, roomId);

          client.emit(
            'games.session.nope.played',
            maybeEncrypt({
              roomId,
              userId,
            }),
          );
        },
      ),
      'games.session.commit_alter_future': this.wrapHandler(
        'commit alter future',
        async (client, payload, roomId, userId) => {
          const newOrder = Array.isArray(payload.newOrder)
            ? payload.newOrder
            : [];

          await this.gameService.commitAlterFutureByRoom(
            userId,
            roomId,
            newOrder as string[],
          );

          client.emit(
            'games.session.action.played',
            maybeEncrypt({
              roomId,
              userId,
              action: 'commit_alter_future',
            }),
          );
        },
      ),
    };
  }
}
