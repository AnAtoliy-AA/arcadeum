import { Inject, Injectable, Logger, Optional, forwardRef } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type Redis from 'ioredis';
import { GameRoomsService } from '../rooms/game-rooms.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { CriticalActionsService } from '../actions/critical/critical-actions.service';
import type { StartGameSessionResult } from '../games.types';
import { CriticalBotService } from './critical-bot.service';
import { BaseGameService } from '../common/base-game.service';
import { extractAiVsAiExtras } from '../common/ai-vs-ai';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

@Injectable()
export class CriticalService extends BaseGameService<Record<string, unknown>> {
  protected readonly logger = new Logger(CriticalService.name);
  readonly gameId = 'critical_v1';
  readonly gameName = 'Critical';
  readonly minPlayers = MIN_PLAYERS;
  readonly maxPlayers = MAX_PLAYERS;

  private readonly criticalActions: CriticalActionsService;

  constructor(
    roomsService: GameRoomsService,
    sessionsService: GameSessionsService,
    realtimeService: GamesRealtimeService,
    criticalActions: CriticalActionsService,
    @Inject(forwardRef(() => CriticalBotService))
    botService: CriticalBotService,
    @InjectConnection() mongoConnection: Connection,
    @Optional() @Inject('REDIS_CLIENT') redis?: Redis | null,
  ) {
    super(
      roomsService,
      sessionsService,
      realtimeService,
      botService,
      mongoConnection,
      undefined,
      redis,
    );
    this.criticalActions = criticalActions;
  }

  protected resolveOptions(raw: unknown): Record<string, unknown> {
    return (raw as Record<string, unknown> | null | undefined) ?? {};
  }

  async drawCard(sessionId: string, userId: string) {
    const session = await this.criticalActions.drawCard(sessionId, userId);
    return this.afterSessionStep(session);
  }

  async playActionCard(
    sessionId: string,
    userId: string,
    payload: { card: string },
  ) {
    const session = await this.criticalActions.playActionCard(
      sessionId,
      userId,
      payload,
    );
    return this.afterSessionStep(session);
  }

  async playCatCombo(
    sessionId: string,
    userId: string,
    payload: {
      cards: string[];
      targetPlayerId: string;
      requestedCard?: string;
    },
  ) {
    const session = await this.criticalActions.playCatCombo(
      sessionId,
      userId,
      payload,
    );
    return this.afterSessionStep(session);
  }

  async playFavor(
    sessionId: string,
    userId: string,
    payload: {
      targetPlayerId: string;
    },
  ) {
    const session = await this.criticalActions.playFavor(
      sessionId,
      userId,
      payload,
    );
    return this.afterSessionStep(session);
  }

  async seeFuture(sessionId: string, userId: string) {
    const session = await this.criticalActions.seeFuture(sessionId, userId);
    return this.afterSessionStep(session);
  }

  async defuse(
    sessionId: string,
    userId: string,
    payload: { position: number },
  ) {
    const session = await this.criticalActions.defuse(
      sessionId,
      userId,
      payload,
    );
    return this.afterSessionStep(session);
  }

  // ========== Legacy / Compatibility Wrappers ==========

  /**
   * Start a Critical session (backward compatibility)
   */
  async startSession(
    userId: string,
    roomId?: string,
    withBots?: boolean,
    botCount?: number,
    engine?: string,
    startExtras?: Record<string, unknown>,
  ): Promise<StartGameSessionResult> {
    let effectiveRoomId = roomId;
    if (!effectiveRoomId) {
      const { rooms: userRooms } = await this.roomsService.listRooms(
        {
          userId,
          participation: 'any',
          status: 'lobby',
        },
        userId,
      );

      if (userRooms.length === 0) {
        throw new Error(
          'User is not in any active room. Please provide roomId.',
        );
      }

      if (userRooms.length > 1) {
        throw new Error(
          'User is in multiple rooms. Please specify which roomId to start.',
        );
      }

      effectiveRoomId = userRooms[0].id;
    }

    const room = await this.roomsService.getRoom(effectiveRoomId, userId);

    if (room.hostId !== userId) {
      throw new Error('Only the host can start the game');
    }

    // Check minimum players unless withBots is true
    if (room.playerCount < MIN_PLAYERS && !withBots) {
      throw new Error('Need at least 2 players to start the game');
    }

    // Resolve Random Variant
    // If cardVariant is 'random', pick one from the available list (excluding 'random')
    // We hardcode the list here to avoid circular dependency with shared/frontend constants
    if (room.gameOptions?.cardVariant === 'random') {
      const variants = ['cyberpunk', 'underwater'];
      const randomVariant =
        variants[Math.floor(Math.random() * variants.length)];

      // Update the room options with the resolved variant so all players see it
      await this.roomsService.updateRoomOptions(effectiveRoomId, userId, {
        cardVariant: randomVariant,
      });

      // Update local room object for session creation
      room.gameOptions.cardVariant = randomVariant;
    }

    const playerIds =
      await this.roomsService.getRoomParticipants(effectiveRoomId);

    if (withBots) {
      // If botCount is provided, we add exactly that many bots.
      // If not, we default to 4 total players (3 bots for 1 human) for Critical.
      const targetBotCount = botCount !== undefined ? botCount : 3;
      for (let i = 0; i < targetBotCount; i++) {
        playerIds.push(`bot-${crypto.randomUUID()}`);
      }
    }

    const session = await this.sessionsService.createSession({
      roomId: effectiveRoomId,
      gameId: room.gameId,
      playerIds,
      config: { engine, ...room.gameOptions },
      options: extractAiVsAiExtras(startExtras) ?? undefined,
    });

    await this.roomsService.updateRoomStatus(effectiveRoomId, 'in_progress');
    const updatedRoom = { ...room, status: 'in_progress' as const };
    await this.realtimeService.emitGameStarted(
      updatedRoom,
      session,
      async (s, pId) => {
        const sanitized = await this.sessionsService.getSanitizedStateForPlayer(
          s.id,
          pId,
        );
        if (sanitized && typeof sanitized === 'object') {
          return { ...s, state: sanitized as Record<string, unknown> };
        }
        return s;
      },
    );

    const updatedSession = await this.afterSessionStep(session);
    return { room: updatedRoom, session: updatedSession };
  }

  /**
   * Play Critical action card (gateway wrapper)
   */
  async playActionByRoom(
    userId: string,
    roomId: string,
    card: string,
    options?: {
      targetPlayerId?: string;
      cardsToStash?: string[];
      cardsToUnstash?: string[];
    },
  ) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    const updatedSession = await this.criticalActions.playActionCard(
      session.id,
      userId,
      {
        card,
        targetPlayerId: options?.targetPlayerId,
        cardsToStash: options?.cardsToStash,
        cardsToUnstash: options?.cardsToUnstash,
      },
    );
    return this.afterSessionStep(updatedSession);
  }

  /**
   * Play cat combo (gateway wrapper)
   */
  async playCatComboByRoom(
    userId: string,
    roomId: string,
    cat: string,
    payload: {
      mode: string;
      targetPlayerId?: string;
      desiredCard?: string;
      selectedIndex?: number;
      requestedDiscardCard?: string;
      cards?: string[];
    },
  ) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    // Build cards array based on mode
    let cards: string[];
    if (payload.mode === 'fiver') {
      // Fiver mode: cards should be provided by the client (any 5 different cards)
      // For now, the client will need to select and send the 5 cards
      cards = payload.cards ?? [];
    } else if (payload.mode === 'trio') {
      cards = [cat, cat, cat];
    } else {
      cards = [cat, cat];
    }

    const updatedSession = await this.criticalActions.playCatCombo(
      session.id,
      userId,
      {
        cards,
        targetPlayerId: payload.targetPlayerId,
        requestedCard: payload.desiredCard,
        selectedIndex: payload.selectedIndex,
        requestedDiscardCard: payload.requestedDiscardCard,
      },
    );
    return this.afterSessionStep(updatedSession);
  }

  async playFavorByRoom(
    userId: string,
    roomId: string,
    targetPlayerId: string,
  ) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    const updatedSession = await this.criticalActions.playFavor(
      session.id,
      userId,
      {
        targetPlayerId,
      },
    );
    return this.afterSessionStep(updatedSession);
  }

  async giveFavorCardByRoom(
    userId: string,
    roomId: string,
    cardToGive: string,
  ) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    const updatedSession = await this.criticalActions.giveFavorCard(
      session.id,
      userId,
      {
        cardToGive,
      },
    );
    return this.afterSessionStep(updatedSession);
  }

  async seeTheFutureByRoom(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    const result = await this.criticalActions.seeFuture(session.id, userId);
    await this.afterSessionStep(result);

    const topCards =
      result.state &&
      typeof result.state === 'object' &&
      'deck' in result.state &&
      Array.isArray(result.state.deck)
        ? result.state.deck.slice(0, 3)
        : [];
    return { ...result, topCards };
  }

  async defuseByRoom(userId: string, roomId: string, position: number) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    const updatedSession = await this.criticalActions.defuse(
      session.id,
      userId,
      { position },
    );
    return this.afterSessionStep(updatedSession);
  }

  async playNope(sessionId: string, userId: string) {
    const session = await this.criticalActions.playNope(sessionId, userId);
    return this.afterSessionStep(session);
  }

  async playNopeByRoom(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    const updatedSession = await this.criticalActions.playNope(
      session.id,
      userId,
    );
    return this.afterSessionStep(updatedSession);
  }
  async commitAlterFutureByRoom(
    userId: string,
    roomId: string,
    newOrder: string[],
  ) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    const updatedSession = await this.criticalActions.commitAlterFuture(
      session.id,
      userId,
      { newOrder },
    );
    return this.afterSessionStep(updatedSession);
  }
}
