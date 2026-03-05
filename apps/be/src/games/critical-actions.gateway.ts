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
  handleError,
  extractCollectionComboPayload,
  extractPlayActionPayload,
  extractString,
  toCriticalCard,
  isSimpleActionCard,
} from './games.gateway.utils';

import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { CriticalService } from './critical/critical.service';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: '*' },
})
@Injectable()
export class CriticalActionsGateway {
  private readonly logger = new Logger(CriticalActionsGateway.name);

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
      client.emit(
        'games.session.drawn',
        maybeEncrypt({
          roomId,
          userId,
        }),
      );
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
      client.emit(
        'games.session.action.played',
        maybeEncrypt({
          roomId,
          userId,
          card,
          targetPlayerId,
        }),
      );
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

      client.emit(
        'games.session.cat_combo.played',
        maybeEncrypt({
          roomId,
          userId,
          cat,
          mode,
          targetPlayerId,
          desiredCard,
          selectedIndex,
          requestedDiscardCard,
        }),
      );
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
      client.emit(
        'games.session.favor.pending',
        maybeEncrypt({
          roomId,
          userId,
          targetPlayerId,
        }),
      );
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

      client.emit(
        'games.session.favor.completed',
        maybeEncrypt({
          roomId,
          userId,
          cardGiven: cardValue,
        }),
      );
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

      client.emit(
        'games.session.see_the_future.played',
        maybeEncrypt({
          roomId,
          userId,
          topCards: result.topCards,
        }),
      );
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
}
