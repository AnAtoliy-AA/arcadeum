import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import { GamesService } from './games.service';
import { GamesRealtimeService } from './games.realtime.service';
import type {
  ExplodingCatsCard,
  ExplodingCatsCatCard,
} from './exploding-cats/exploding-cats.state';

const CAT_COMBO_CARD_VALUES = [
  'tacocat',
  'hairy_potato_cat',
  'rainbow_ralphing_cat',
  'cattermelon',
  'bearded_cat',
] as const satisfies ReadonlyArray<ExplodingCatsCatCard>;

const SIMPLE_ACTION_CARDS = ['skip', 'attack', 'shuffle'] as const;
type SimpleActionCard = (typeof SIMPLE_ACTION_CARDS)[number];

const ALL_EXPLODING_CATS_CARDS = [
  'exploding_cat',
  'defuse',
  'attack',
  'skip',
  'favor',
  'shuffle',
  'see_the_future',
  ...CAT_COMBO_CARD_VALUES,
] as const satisfies ReadonlyArray<ExplodingCatsCard>;

function isCatComboCard(value: string): value is ExplodingCatsCatCard {
  return CAT_COMBO_CARD_VALUES.includes(value as ExplodingCatsCatCard);
}

function isSimpleActionCard(value: string): value is SimpleActionCard {
  return SIMPLE_ACTION_CARDS.includes(value as SimpleActionCard);
}

function toExplodingCatsCard(value?: string): ExplodingCatsCard | undefined {
  if (!value) {
    return undefined;
  }
  const lower = value.toLowerCase() as ExplodingCatsCard;
  return ALL_EXPLODING_CATS_CARDS.includes(lower) ? lower : undefined;
}

/**
 * Validates and extracts string payload field
 */
function extractString(
  payload: Record<string, any>,
  fieldName: string,
  options?: { toLowerCase?: boolean },
): string {
  const value =
    typeof payload?.[fieldName] === 'string' ? payload[fieldName].trim() : '';

  if (!value) {
    throw new WsException(`${fieldName} is required.`);
  }

  return options?.toLowerCase ? value.toLowerCase() : value;
}

/**
 * Validates room and user IDs from payload
 */
function extractRoomAndUser(payload: Record<string, any>): {
  roomId: string;
  userId: string;
} {
  return {
    roomId: extractString(payload, 'roomId'),
    userId: extractString(payload, 'userId'),
  };
}

/**
 * Handles common error logging and wrapping
 */
function handleError(
  logger: Logger,
  error: unknown,
  context: { action: string; roomId: string; userId: string },
  defaultMessage: string,
): never {
  const message =
    error instanceof Error && typeof error.message === 'string'
      ? error.message
      : defaultMessage;

  logger.warn(
    `Failed to ${context.action} for room ${context.roomId}, user ${context.userId}: ${message}`,
  );

  throw new WsException(message);
}

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: '*' },
})
@Injectable()
export class GamesGateway {
  private readonly logger = new Logger(GamesGateway.name);

  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly gamesService: GamesService,
    private readonly realtime: GamesRealtimeService,
  ) {}

  afterInit(): void {
    this.realtime.registerServer(this.server);
    this.logger.debug('Games gateway initialized.');
  }

  handleConnection(client: Socket): void {
    this.logger.verbose(`Client connected ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.verbose(`Client disconnected ${client.id}`);
  }

  @SubscribeMessage('games.room.join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const roomId =
      typeof payload?.roomId === 'string' ? payload.roomId.trim() : '';
    const userId =
      typeof payload?.userId === 'string' ? payload.userId.trim() : '';

    if (!roomId) {
      throw new WsException('roomId is required.');
    }
    if (!userId) {
      throw new WsException('userId is required.');
    }

    const room = await this.gamesService.ensureParticipant(roomId, userId);
    const session = await this.gamesService.findSessionByRoom(room.id);

    const channel = this.realtime.roomChannel(room.id);
    await client.join(channel);

    client.emit('games.room.joined', {
      room,
      session,
    });

    if (session) {
      this.realtime.emitSessionSnapshotToClient(client, room.id, session);
    }
  }

  @SubscribeMessage('games.room.watch')
  async handleWatchRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string },
  ): Promise<void> {
    const roomId = extractString(payload, 'roomId');

    try {
      const room = await this.gamesService.getRoom(roomId);
      const session = await this.gamesService.findSessionByRoom(room.id);

      const channel = this.realtime.roomChannel(room.id);
      await client.join(channel);

      client.emit('games.room.watching', {
        room,
        session,
      });

      if (session) {
        this.realtime.emitSessionSnapshotToClient(client, room.id, session);
      }
    } catch (error) {
      const message =
        error instanceof Error && typeof error.message === 'string'
          ? error.message
          : 'Unable to spectate this room.';
      this.logger.warn(
        `Failed to register spectator for room ${roomId}: ${message}`,
      );
      throw new WsException(message);
    }
  }

  @SubscribeMessage('games.session.request')
  async handleSessionRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string },
  ): Promise<void> {
    const roomId = extractString(payload, 'roomId');

    const channel = this.realtime.roomChannel(roomId);
    if (!client.rooms.has(channel)) {
      throw new WsException('Join the room before requesting the session.');
    }

    const session = await this.gamesService.findSessionByRoom(roomId);
    if (!session) {
      return;
    }

    this.realtime.emitSessionSnapshotToClient(client, roomId, session);
  }

  @SubscribeMessage('games.session.draw')
  async handleSessionDraw(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);

    try {
      await this.gamesService.drawExplodingCatsCard(userId, roomId);
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
      await this.gamesService.playExplodingCatsAction(userId, roomId, card);
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
      await this.gamesService.playExplodingCatsCatCombo(userId, roomId, cat, {
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
      await this.gamesService.playExplodingCatsFavor(
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
      const result = await this.gamesService.playExplodingCatsSeeTheFuture(
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
      await this.gamesService.postExplodingCatsHistoryNote(
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
    const { roomId, userId } = extractRoomAndUser(payload);
    const engine =
      typeof payload?.engine === 'string' ? payload.engine.trim() : undefined;

    try {
      const result = await this.gamesService.startExplodingCatsSession(
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
          roomId,
          userId,
        },
        'Unable to start session.',
      );
    }
  }

  // ===========================
  // Texas Hold'em Handlers
  // ===========================

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
    const { roomId, userId } = extractRoomAndUser(payload);
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
          roomId,
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
