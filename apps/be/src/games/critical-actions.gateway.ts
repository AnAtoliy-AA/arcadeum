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
  handleError,
  extractCollectionComboPayload,
  extractPlayActionPayload,
  extractString,
  toCriticalCard,
  isSimpleActionCard,
  validatePayloadUserId,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { CriticalService } from './critical/critical.service';

@Injectable()
export class CriticalActionsGateway implements GameMessageHandler {
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

  readonly handlers: Record<string, GameMessageHandlerFn> = {
    'games.session.draw': (client, payload) =>
      this.handleSessionDraw(client, payload),
    'games.session.play_action': (client, payload) =>
      this.handleSessionPlayAction(client, payload),
    'games.session.play_cat_combo': (client, payload) =>
      this.handleSessionPlayCatCombo(client, payload),
    'games.session.play_favor': (client, payload) =>
      this.handleSessionPlayFavor(client, payload),
    'games.session.give_favor_card': (client, payload) =>
      this.handleSessionGiveFavorCard(client, payload),
    'games.session.play_see_the_future': (client, payload) =>
      this.handleSessionPlaySeeTheFuture(client, payload),
  };

  private async handleSessionDraw(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);

    validatePayloadUserId(client, userId);

    try {
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

  private async handleSessionPlayAction(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const { card, targetPlayerId, cardsToStash, cardsToUnstash } =
      extractPlayActionPayload(payload);

    validatePayloadUserId(client, userId);

    if (process.env.NODE_ENV !== 'test') {
      this.logger.log(
        `handleSessionPlayAction: card=${card}, targetPlayerId=${targetPlayerId}`,
      );
    }

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

  private async handleSessionPlayCatCombo(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const {
      cat,
      mode,
      targetPlayerId,
      desiredCard,
      selectedIndex,
      requestedDiscardCard,
    } = extractCollectionComboPayload(payload);

    validatePayloadUserId(client, userId);

    try {
      await this.criticalService.playCatComboByRoom(userId, roomId, cat, {
        mode,
        targetPlayerId: mode === 'fiver' ? undefined : targetPlayerId,
        desiredCard,
        selectedIndex,
        requestedDiscardCard,
        cards: Array.isArray(payload.cards)
          ? (payload.cards as unknown[]).map((c) =>
              String(c).trim().toLowerCase(),
            )
          : undefined,
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

  private async handleSessionPlayFavor(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const targetPlayerId = extractString(payload, 'targetPlayerId');

    validatePayloadUserId(client, userId);

    try {
      await this.criticalService.playFavorByRoom(
        userId,
        roomId,
        targetPlayerId,
      );

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

  private async handleSessionGiveFavorCard(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const cardToGive = extractString(payload, 'cardToGive', {
      toLowerCase: true,
    });

    const cardValue = toCriticalCard(cardToGive);
    if (!cardValue) {
      throw new WsException('Invalid cardToGive value.');
    }

    validatePayloadUserId(client, userId);

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

  private async handleSessionPlaySeeTheFuture(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);

    validatePayloadUserId(client, userId);

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
