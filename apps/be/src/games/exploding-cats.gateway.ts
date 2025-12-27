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
  isCatComboCard,
  isSimpleActionCard,
  toExplodingCatsCard,
} from './games.gateway.utils';

import { ExplodingCatsService } from './exploding-cats/exploding-cats.service';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: '*' },
})
@Injectable()
export class ExplodingCatsGateway {
  private readonly logger = new Logger(ExplodingCatsGateway.name);

  constructor(
    private readonly gamesService: GamesService,
    private readonly explodingCatsService: ExplodingCatsService,
  ) {}

  @SubscribeMessage('games.session.draw')
  async handleSessionDraw(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);

    try {
      // Get session from room
      const session = await this.gamesService.findSessionByRoom(roomId);
      if (!session) {
        throw new WsException('No active session found for this room');
      }

      await this.explodingCatsService.drawCard(session.id, userId);
      client.emit('games.session.drawn', {
        roomId,
        userId,
      });
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'draw card',
          roomId,
          userId,
        },
        'Unable to draw card.',
      );
    }
  }

  @SubscribeMessage('games.session.play_action')
  async handleSessionPlayAction(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; card?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const card = extractString(payload, 'card', { toLowerCase: true });

    if (!isSimpleActionCard(card)) {
      throw new WsException('Card is not supported for this action.');
    }

    try {
      await this.explodingCatsService.playActionByRoom(userId, roomId, card);
      client.emit('games.session.action.played', {
        roomId,
        userId,
        card,
      });
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: `play ${card}`,
          roomId,
          userId,
        },
        'Unable to play card.',
      );
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
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const cat = extractString(payload, 'cat', { toLowerCase: true });
    const modeRaw = extractString(payload, 'mode', { toLowerCase: true });
    const targetPlayerId = extractString(payload, 'targetPlayerId');
    const desiredCard =
      typeof payload?.desiredCard === 'string'
        ? payload.desiredCard.trim().toLowerCase()
        : undefined;

    const mode =
      modeRaw === 'trio' ? 'trio' : modeRaw === 'pair' ? 'pair' : null;
    if (!mode) {
      throw new WsException('mode is required.');
    }

    if (!isCatComboCard(cat)) {
      throw new WsException('cat is not supported.');
    }

    const desiredCardValue = toExplodingCatsCard(desiredCard);

    if (mode === 'trio' && !desiredCardValue) {
      throw new WsException('desiredCard is required for trio combos.');
    }

    try {
      await this.explodingCatsService.playCatComboByRoom(userId, roomId, cat, {
        mode,
        targetPlayerId,
        desiredCard: desiredCardValue,
      });

      client.emit('games.session.cat_combo.played', {
        roomId,
        userId,
        cat,
        mode,
        targetPlayerId,
        desiredCard: desiredCardValue,
      });
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: `play ${cat} combo`,
          roomId,
          userId,
        },
        'Unable to play cat combo.',
      );
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
      desiredCard?: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const targetPlayerId = extractString(payload, 'targetPlayerId');
    const desiredCard = extractString(payload, 'desiredCard', {
      toLowerCase: true,
    });

    const desiredCardValue = toExplodingCatsCard(desiredCard);
    if (!desiredCardValue) {
      throw new WsException('Invalid desiredCard value.');
    }

    try {
      await this.explodingCatsService.playFavorByRoom(
        userId,
        roomId,
        targetPlayerId,
        desiredCardValue,
      );

      client.emit('games.session.favor.played', {
        roomId,
        userId,
        targetPlayerId,
        desiredCard: desiredCardValue,
      });
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'play Favor card',
          roomId,
          userId,
        },
        'Unable to play Favor card.',
      );
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
      const result = await this.explodingCatsService.seeTheFutureByRoom(
        userId,
        roomId,
      );

      client.emit('games.session.see_the_future.played', {
        roomId,
        userId,
        topCards: result.topCards,
      });
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'play See the Future card',
          roomId,
          userId,
        },
        'Unable to play See the Future card.',
      );
    }
  }

  @SubscribeMessage('games.session.history_note')
  async handleSessionHistoryNote(
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
      await this.explodingCatsService.postHistoryNote(
        userId,
        roomId,
        message,
        scope,
      );
      client.emit('games.session.history_note.ack', {
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

  @SubscribeMessage('games.session.start')
  async handleSessionStart(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; engine?: string },
  ): Promise<void> {
    const userId = extractString(payload, 'userId');
    const roomIdRaw =
      typeof payload?.roomId === 'string' ? payload.roomId.trim() : '';
    const roomId = roomIdRaw || undefined;
    const engine =
      typeof payload?.engine === 'string' ? payload.engine.trim() : undefined;

    try {
      const result = await this.explodingCatsService.startSession(
        userId,
        roomId,
        engine,
      );

      client.emit('games.session.started', result);
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'start Exploding Cats session',
          roomId: roomId || 'unknown',
          userId,
        },
        'Unable to start session.',
      );
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
      await this.explodingCatsService.defuseByRoom(userId, roomId, position);

      client.emit('games.session.defuse.played', {
        roomId,
        userId,
        position,
      });
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'play Defuse card',
          roomId,
          userId,
        },
        'Unable to play Defuse card.',
      );
    }
  }
}
