import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';
import {
  extractRoomAndUser,
  extractString,
  handleError,
} from './games.gateway.utils';

import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { CriticalService } from './critical/critical.service';
import { ChatScope } from './engines';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: '*' },
})
@Injectable()
export class CriticalGateway {
  private readonly logger = new Logger(CriticalGateway.name);

  constructor(private readonly criticalService: CriticalService) {}

  private handleException(params: {
    error: unknown;
    action: string;
    roomId?: string;
    userId?: string;
    userMessage: string;
  }) {
    const { error, action, roomId, userId, userMessage } = params;
    handleError(
      this.logger,
      error,
      { action, roomId: roomId || '', userId: userId || '' },
      userMessage,
    );
  }

  // Handlers moved to CriticalActionsGateway:
  // - handleSessionDraw
  // - handleSessionPlayAction
  // - handleSessionPlayCatCombo
  // - handleSessionPlayFavor
  // - handleSessionGiveFavorCard
  // - handleSessionPlaySeeTheFuture

  @SubscribeMessage('games.session.history_note')
  async handleHistoryNote(
    @MessageBody()
    payload: {
      roomId: string;
      userId: string;
      message: string;
      scope: ChatScope;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const message = extractString(payload, 'message');
    const scopeRaw =
      typeof payload?.scope === 'string'
        ? payload.scope.trim().toLowerCase()
        : 'all';

    const scope = ['players', 'private'].includes(scopeRaw) ? scopeRaw : 'all';

    try {
      await this.criticalService.postHistoryNote(
        userId,
        roomId,
        message,
        scope as ChatScope,
      );
      client.emit(
        'games.session.history_note.ack',
        maybeEncrypt({
          roomId,
          userId,
          scope,
        }),
      );
    } catch (error) {
      this.handleException({
        error,
        action: 'post history note',
        roomId,
        userId,
        userMessage: 'Unable to post history note.',
      });
    }
  }

  @SubscribeMessage('games.session.start')
  async handleSessionStart(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      engine?: string;
      withBots?: boolean;
      botCount?: number;
    },
  ): Promise<void> {
    const userId = extractString(payload, 'userId');
    const roomIdRaw =
      typeof payload?.roomId === 'string' ? payload.roomId.trim() : '';
    const roomId = roomIdRaw || undefined;
    const engine =
      typeof payload?.engine === 'string' ? payload.engine.trim() : undefined;
    const withBots = !!payload?.withBots;

    try {
      const result = await this.criticalService.startSession(
        userId,
        roomId,
        engine,
        withBots,
        payload?.botCount,
      );

      client.emit('games.session.started', maybeEncrypt(result));
    } catch (error) {
      this.handleException({
        error,
        action: 'start Critical session',
        roomId: roomId || 'unknown',
        userId,
        userMessage: 'Unable to start session.',
      });
    }
  }

  @SubscribeMessage('games.session.play_defuse')
  async handleSessionPlayDefuse(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      position?: number;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const position =
      typeof payload?.position === 'number' ? payload.position : undefined;

    if (position === undefined || position < 0) {
      throw new WsException(
        'position is required and must be a non-negative number.',
      );
    }

    try {
      await this.criticalService.defuseByRoom(userId, roomId, position);

      client.emit(
        'games.session.defuse.played',
        maybeEncrypt({
          roomId,
          userId,
          position,
        }),
      );
    } catch (error) {
      this.handleException({
        error,
        action: 'play Defuse card',
        roomId,
        userId,
        userMessage: 'Unable to play Defuse card.',
      });
    }
  }

  @SubscribeMessage('games.session.play_nope')
  async handleSessionPlayNope(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);

    try {
      await this.criticalService.playNopeByRoom(userId, roomId);

      client.emit(
        'games.session.nope.played',
        maybeEncrypt({
          roomId,
          userId,
        }),
      );
    } catch (error) {
      this.handleException({
        error,
        action: 'play Nope card',
        roomId,
        userId,
        userMessage: 'Unable to play Nope card.',
      });
    }
  }
  @SubscribeMessage('games.session.commit_alter_future')
  async handleSessionCommitAlterFuture(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      newOrder?: string[];
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const newOrder = Array.isArray(payload.newOrder) ? payload.newOrder : [];

    try {
      await this.criticalService.commitAlterFutureByRoom(
        userId,
        roomId,
        newOrder,
      );

      client.emit(
        'games.session.action.played',
        maybeEncrypt({
          roomId,
          userId,
          action: 'commit_alter_future',
        }),
      );
    } catch (error) {
      this.handleException({
        error,
        action: 'commit alter future',
        roomId,
        userId,
        userMessage: 'Unable to commit alter future.',
      });
    }
  }
}
