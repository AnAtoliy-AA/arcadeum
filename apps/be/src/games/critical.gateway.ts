import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from './game-message-handler.interface';

import { CriticalService } from './critical/critical.service';
import {
  extractRoomAndUser,
  extractString,
  getIsAuthenticated,
  handleError,
  validatePayloadUserId,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { ChatScope } from './engines';

@Injectable()
export class CriticalGateway implements GameMessageHandler {
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

  readonly handlers: Record<string, GameMessageHandlerFn> = {
    'games.session.history_note': (client, payload) =>
      this.handleHistoryNote(client, payload),
    'games.session.start': (client, payload) =>
      this.handleSessionStart(client, payload),
    'games.session.play_defuse': (client, payload) =>
      this.handleSessionPlayDefuse(client, payload),
    'games.session.play_nope': (client, payload) =>
      this.handleSessionPlayNope(client, payload),
    'games.session.commit_alter_future': (client, payload) =>
      this.handleSessionCommitAlterFuture(client, payload),
  };

  private async handleHistoryNote(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const message = extractString(payload, 'message');
    const raw =
      typeof payload?.scope === 'string'
        ? payload.scope.trim().toLowerCase()
        : 'all';

    const scope = ['players', 'private'].includes(raw) ? raw : 'all';
    const isAuthenticated = getIsAuthenticated(client);

    validatePayloadUserId(client, userId);

    try {
      await this.criticalService.postHistoryNote(
        userId,
        roomId,
        message,
        scope as ChatScope,
        isAuthenticated,
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
      const msg =
        error instanceof Error && typeof error.message === 'string'
          ? error.message
          : 'Unable to post history note.';
      this.logger.warn(
        `Failed to post history note for room ${roomId}, user ${userId}: ${msg}`,
      );
    }
  }

  private async handleSessionStart(
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
      const result = await this.criticalService.startSession(
        userId,
        roomId,
        engine,
        withBots,
        payload?.botCount as number | undefined,
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

  private async handleSessionPlayDefuse(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const position =
      typeof payload?.position === 'number' ? payload.position : undefined;

    if (position === undefined || position < 0) {
      throw new WsException(
        'position is required and must be a non-negative number.',
      );
    }

    validatePayloadUserId(client, userId);

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

  private async handleSessionPlayNope(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);

    validatePayloadUserId(client, userId);

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

  private async handleSessionCommitAlterFuture(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const newOrder = Array.isArray(payload.newOrder) ? payload.newOrder : [];

    validatePayloadUserId(client, userId);

    try {
      await this.criticalService.commitAlterFutureByRoom(
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
