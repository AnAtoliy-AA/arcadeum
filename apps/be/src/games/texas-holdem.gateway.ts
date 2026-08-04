import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from './game-message-handler.interface';
import { GamesService } from './games.service';
import {
  extractRoomAndUser,
  extractString,
  handleError,
  validatePayloadUserId,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { TexasHoldemService } from './texas-holdem/texas-holdem.service';

@Injectable()
export class TexasHoldemGateway implements GameMessageHandler {
  private readonly logger = new Logger(TexasHoldemGateway.name);

  constructor(
    private readonly gamesService: GamesService,
    private readonly texasHoldemService: TexasHoldemService,
  ) {}

  readonly handlers: Record<string, GameMessageHandlerFn> = {
    'games.session.start_holdem': (client, payload) =>
      this.handleStartTexasHoldem(client, payload),
    'games.session.holdem_action': (client, payload) =>
      this.handleTexasHoldemAction(client, payload),
    'games.session.holdem_history_note': (client, payload) =>
      this.handleTexasHoldemHistoryNote(client, payload),
  };

  private async handleStartTexasHoldem(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const userId = extractString(payload, 'userId');
    const roomIdRaw =
      typeof payload?.roomId === 'string' ? payload.roomId.trim() : '';
    const roomId = roomIdRaw || undefined;
    const engine =
      typeof payload?.engine === 'string' ? payload.engine.trim() : undefined;

    validatePayloadUserId(client, userId);

    try {
      const result = await this.texasHoldemService.startSession(
        userId,
        roomId,
        engine,
      );
      client.emit('games.session.holdem_started', maybeEncrypt(result));
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: "start Texas Hold'em session",
          roomId: roomId || 'unknown',
          userId,
        },
        'Unable to start session.',
      );
    }
  }

  private async handleTexasHoldemAction(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const action = extractString(payload, 'action', { toLowerCase: true });

    const validActions = ['fold', 'check', 'call', 'raise'];
    if (!validActions.includes(action)) {
      throw new WsException('Invalid action.');
    }

    validatePayloadUserId(client, userId);

    const raiseAmount =
      typeof payload?.raiseAmount === 'number'
        ? payload.raiseAmount
        : undefined;

    try {
      await this.texasHoldemService.playerAction(
        userId,
        roomId,
        action,
        raiseAmount,
      );
      client.emit(
        'games.session.holdem_action.performed',
        maybeEncrypt({
          roomId,
          userId,
          action,
          raiseAmount,
        }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: `perform ${action}`,
          roomId,
          userId,
        },
        'Unable to perform action.',
      );
    }
  }

  private async handleTexasHoldemHistoryNote(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const message = extractString(payload, 'message');

    validatePayloadUserId(client, userId);

    try {
      await this.texasHoldemService.postHistoryNote(userId, roomId, message);
      client.emit(
        'games.session.holdem_history_note.ack',
        maybeEncrypt({
          roomId,
          userId,
        }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'post history note',
          roomId,
          userId,
        },
        'Unable to post history note.',
      );
    }
  }
}
