import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';
import { GamesService } from './games.service';
import {
  extractRoomAndUser,
  extractString,
  handleError,
} from './games.gateway.utils';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: '*' },
})
@Injectable()
export class TexasHoldemGateway {
  private readonly logger = new Logger(TexasHoldemGateway.name);

  constructor(private readonly gamesService: GamesService) {}

  @SubscribeMessage('games.session.start_holdem')
  async handleStartTexasHoldem(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      engine?: string;
      startingChips?: number;
    },
  ): Promise<void> {
    const userId = extractString(payload, 'userId');
    const roomIdRaw =
      typeof payload?.roomId === 'string' ? payload.roomId.trim() : '';
    const roomId = roomIdRaw || undefined;
    const engine =
      typeof payload?.engine === 'string' ? payload.engine.trim() : undefined;
    const startingChips =
      typeof payload?.startingChips === 'number' && payload.startingChips > 0
        ? payload.startingChips
        : 1000;

    try {
      const result = await this.gamesService.startTexasHoldemSession(
        userId,
        roomId,
        engine,
        startingChips,
      );

      client.emit('games.session.holdem_started', result);
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

  @SubscribeMessage('games.session.holdem_action')
  async handleTexasHoldemAction(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      action?: string;
      raiseAmount?: number;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const action = extractString(payload, 'action', { toLowerCase: true });

    const validActions = ['fold', 'check', 'call', 'raise'];
    if (!validActions.includes(action)) {
      throw new WsException('Invalid action.');
    }

    const raiseAmount =
      typeof payload?.raiseAmount === 'number'
        ? payload.raiseAmount
        : undefined;

    try {
      await this.gamesService.texasHoldemPlayerAction(
        userId,
        roomId,
        action as any,
        raiseAmount,
      );

      client.emit('games.session.holdem_action.performed', {
        roomId,
        userId,
        action,
        raiseAmount,
      });
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

  @SubscribeMessage('games.session.holdem_history_note')
  async handleTexasHoldemHistoryNote(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      message?: string;
      scope?: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const message = extractString(payload, 'message');
    const scopeRaw =
      typeof payload?.scope === 'string'
        ? payload.scope.trim().toLowerCase()
        : 'all';

    const scope = scopeRaw === 'players' ? 'players' : 'all';

    try {
      await this.gamesService.postTexasHoldemHistoryNote(
        userId,
        roomId,
        message,
        scope,
      );

      client.emit('games.session.holdem_history_note.ack', {
        roomId,
        userId,
        scope,
      });
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
