import { Injectable } from '@nestjs/common';
import { GameRoomsService } from '../rooms/game-rooms.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GameHistoryService } from '../history/game-history.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { CriticalActionsService } from '../actions/critical/critical-actions.service';
import { StartGameSessionResult } from '../games.types';
import { ChatScope } from '../engines/base/game-engine.interface';
import { GameSessionSummary } from '../sessions/game-sessions.service';

@Injectable()
export class CriticalService {
  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    private readonly criticalActions: CriticalActionsService,
  ) {}

  // ========== Core Actions ==========

  // ========== Private Helper ==========

  private async checkAndSyncRoomStatus(session: GameSessionSummary) {
    if (session.status === 'completed') {
      await this.roomsService.updateRoomStatus(session.roomId, 'completed');
    }
    return session;
  }

  // ========== Core Actions ==========

  async drawCard(sessionId: string, userId: string) {
    const session = await this.criticalActions.drawCard(sessionId, userId);
    return this.checkAndSyncRoomStatus(session);
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
    return this.checkAndSyncRoomStatus(session);
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
    return this.checkAndSyncRoomStatus(session);
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
    return this.checkAndSyncRoomStatus(session);
  }

  async seeFuture(sessionId: string, userId: string) {
    const session = await this.criticalActions.seeFuture(sessionId, userId);
    return this.checkAndSyncRoomStatus(session);
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
    return this.checkAndSyncRoomStatus(session);
  }

  // ========== Legacy / Compatibility Wrappers ==========

  /**
   * Start an Critical session (backward compatibility)
   */
  async startSession(
    userId: string,
    roomId?: string,
    engine?: string,
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

    // Resolve Random Variant
    // If cardVariant is 'random', pick one from the available list (excluding 'random')
    // We hardcode the list here to avoid circular dependency with shared/frontend constants
    if (room.gameOptions?.cardVariant === 'random') {
      const variants = [
        'cyberpunk',
        'underwater',
        'crime',
        'horror',
        'adventure',
      ];
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

    const session = await this.sessionsService.createSession({
      roomId: effectiveRoomId,
      gameId: room.gameId,
      playerIds,
      config: { engine, ...room.gameOptions },
    });

    await this.roomsService.updateRoomStatus(effectiveRoomId, 'in_progress');
    await this.realtimeService.emitGameStarted(
      room,
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

    return { room, session };
  }

  /**
   * Post a note to Critical history
   */
  async postHistoryNote(
    userId: string,
    roomId: string,
    message: string,
    scope: ChatScope,
  ) {
    await this.historyService.postHistoryNote(roomId, userId, message, scope);
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (session) {
      await this.realtimeService.emitSessionSnapshot(
        roomId,
        session,
        async (s, pId) => {
          const sanitized =
            await this.sessionsService.getSanitizedStateForPlayer(s.id, pId);
          if (sanitized && typeof sanitized === 'object') {
            return { ...s, state: sanitized as Record<string, unknown> };
          }
          return s;
        },
      );
    }
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
    return this.checkAndSyncRoomStatus(updatedSession);
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
    return this.checkAndSyncRoomStatus(updatedSession);
  }

  /**
   * Play favor card (gateway wrapper)
   */
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
    return this.checkAndSyncRoomStatus(updatedSession);
  }

  /**
   * Give favor card (gateway wrapper) - target player responds to favor
   */
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
    return this.checkAndSyncRoomStatus(updatedSession);
  }

  /**
   * See the future (gateway wrapper)
   */
  async seeTheFutureByRoom(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    const result = await this.criticalActions.seeFuture(session.id, userId);
    await this.checkAndSyncRoomStatus(result);

    const topCards =
      result.state &&
      typeof result.state === 'object' &&
      'deck' in result.state &&
      Array.isArray(result.state.deck)
        ? result.state.deck.slice(0, 3)
        : [];
    return { ...result, topCards };
  }

  /**
   * Play defuse card (gateway wrapper)
   */
  async defuseByRoom(userId: string, roomId: string, position: number) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    const updatedSession = await this.criticalActions.defuse(
      session.id,
      userId,
      { position },
    );
    return this.checkAndSyncRoomStatus(updatedSession);
  }

  /**
   * Play nope card - cancels the last action
   */
  async playNope(sessionId: string, userId: string) {
    const session = await this.criticalActions.playNope(sessionId, userId);
    return this.checkAndSyncRoomStatus(session);
  }

  /**
   * Play nope card (gateway wrapper)
   */
  async playNopeByRoom(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    const updatedSession = await this.criticalActions.playNope(
      session.id,
      userId,
    );
    return this.checkAndSyncRoomStatus(updatedSession);
  }
  /**
   * Commit Alter the Future (gateway wrapper)
   */
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
    return this.checkAndSyncRoomStatus(updatedSession);
  }
}
