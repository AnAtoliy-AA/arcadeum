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
  isSimpleActionCard,
  toCriticalCard,
  extractCollectionComboPayload,
  extractPlayActionPayload,
} from './games.gateway.utils';

import { CriticalService } from './critical/critical.service';
import { ChatScope } from './engines';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: '*' },
})
@Injectable()
export class CriticalGateway {
  private readonly logger = new Logger(CriticalGateway.name);

  constructor(
    private readonly gamesService: GamesService,
    private readonly criticalService: CriticalService,
  ) {}

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

  @SubscribeMessage('games.session.draw')
  async handleSessionDraw(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);

    try {
      // Get session from room
      const session = await this.criticalService.findSessionByRoom(roomId);
      if (!session) {
        throw new WsException('No active session found for this room');
      }

      await this.criticalService.drawCard(session.id, userId);
      client.emit('games.session.drawn', {
        roomId,
        userId,
      });
    } catch (error) {
      this.handleException({
        error,
        action: 'draw card',
        roomId,
        userId,
        userMessage: 'Unable to draw card.',
      });
    }
  }

  @SubscribeMessage('games.session.play_action')
  async handleSessionPlayAction(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      card?: string;
      targetPlayerId?: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const { card, targetPlayerId, cardsToStash, cardsToUnstash } =
      extractPlayActionPayload(payload as unknown as Record<string, unknown>);

    this.logger.log(
      `handleSessionPlayAction: card=${card}, targetPlayerId=${targetPlayerId}`,
    );

    if (!isSimpleActionCard(card) && card !== 'unstash') {
      throw new WsException('Card is not supported for this action.');
    }

    try {
      await this.criticalService.playActionByRoom(userId, roomId, card, {
        targetPlayerId,
        cardsToStash,
        cardsToUnstash,
      });
      client.emit('games.session.action.played', {
        roomId,
        userId,
        card,
        targetPlayerId,
      });
    } catch (error) {
      this.handleException({
        error,
        action: `play ${card}`,
        roomId,
        userId,
        userMessage: 'Unable to play card.',
      });
    }
  }

  @SubscribeMessage('games.session.play_cat_combo')
  async handleSessionPlayCatCombo(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      cat?: string;
      mode?: string;
      targetPlayerId?: string;
      desiredCard?: string;
      selectedIndex?: number;
      requestedDiscardCard?: string;
      cards?: string[];
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const {
      cat,
      mode,
      targetPlayerId,
      desiredCard,
      selectedIndex,
      requestedDiscardCard,
    } = extractCollectionComboPayload(
      payload as unknown as Record<string, unknown>,
    );

    try {
      await this.criticalService.playCatComboByRoom(userId, roomId, cat, {
        mode,
        targetPlayerId: mode === 'fiver' ? undefined : targetPlayerId,
        desiredCard,
        selectedIndex,
        requestedDiscardCard,
        cards: payload.cards?.map((c) => String(c).trim().toLowerCase()),
      });

      client.emit('games.session.cat_combo.played', {
        roomId,
        userId,
        cat,
        mode,
        targetPlayerId,
        desiredCard,
        selectedIndex,
        requestedDiscardCard,
      });
    } catch (error) {
      this.handleException({
        error,
        action: `play ${cat} combo`,
        roomId,
        userId,
        userMessage: 'Unable to play cat combo.',
      });
    }
  }

  @SubscribeMessage('games.session.play_favor')
  async handleSessionPlayFavor(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      targetPlayerId?: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const targetPlayerId = extractString(payload, 'targetPlayerId');

    try {
      await this.criticalService.playFavorByRoom(
        userId,
        roomId,
        targetPlayerId,
      );

      // Notify that favor has been played and target needs to respond
      client.emit('games.session.favor.pending', {
        roomId,
        userId,
        targetPlayerId,
      });
    } catch (error) {
      this.handleException({
        error,
        action: 'play Favor card',
        roomId,
        userId,
        userMessage: 'Unable to play Favor card.',
      });
    }
  }

  @SubscribeMessage('games.session.give_favor_card')
  async handleSessionGiveFavorCard(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      cardToGive?: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const cardToGive = extractString(payload, 'cardToGive', {
      toLowerCase: true,
    });

    const cardValue = toCriticalCard(cardToGive);
    if (!cardValue) {
      throw new WsException('Invalid cardToGive value.');
    }

    try {
      await this.criticalService.giveFavorCardByRoom(userId, roomId, cardValue);

      client.emit('games.session.favor.completed', {
        roomId,
        userId,
        cardGiven: cardValue,
      });
    } catch (error) {
      this.handleException({
        error,
        action: 'give favor card',
        roomId,
        userId,
        userMessage: 'Unable to give favor card.',
      });
    }
  }

  @SubscribeMessage('games.session.play_see_the_future')
  async handleSessionPlaySeeTheFuture(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);

    try {
      const result = await this.criticalService.seeTheFutureByRoom(
        userId,
        roomId,
      );

      client.emit('games.session.see_the_future.played', {
        roomId,
        userId,
        topCards: result.topCards,
      });
    } catch (error) {
      this.handleException({
        error,
        action: 'play See the Future card',
        roomId,
        userId,
        userMessage: 'Unable to play See the Future card.',
      });
    }
  }

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
      client.emit('games.session.history_note.ack', {
        roomId,
        userId,
        scope,
      });
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

      client.emit('games.session.started', result);
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

      client.emit('games.session.defuse.played', {
        roomId,
        userId,
        position,
      });
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

      client.emit('games.session.nope.played', {
        roomId,
        userId,
      });
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

      client.emit('games.session.action.played', {
        roomId,
        userId,
        action: 'commit_alter_future',
      });
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
