import { Injectable } from '@nestjs/common';
import { GameRoomsService } from '../rooms/game-rooms.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GameHistoryService } from '../history/game-history.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { ExplodingCatsActionsService } from '../actions/exploding-cats/exploding-cats-actions.service';
import { StartGameSessionResult } from '../games.types';
import { ChatScope } from '../engines/base/game-engine.interface';

@Injectable()
export class ExplodingCatsService {
  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    private readonly explodingCatsActions: ExplodingCatsActionsService,
  ) {}

  // ========== Core Actions ==========

  async drawCard(sessionId: string, userId: string) {
    return this.explodingCatsActions.drawCard(sessionId, userId);
  }

  async playActionCard(
    sessionId: string,
    userId: string,
    payload: { card: string },
  ) {
    return this.explodingCatsActions.playActionCard(sessionId, userId, payload);
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
    return this.explodingCatsActions.playCatCombo(sessionId, userId, payload);
  }

  async playFavor(
    sessionId: string,
    userId: string,
    payload: {
      targetPlayerId: string;
    },
  ) {
    return this.explodingCatsActions.playFavor(sessionId, userId, payload);
  }

  async seeFuture(sessionId: string, userId: string) {
    return this.explodingCatsActions.seeFuture(sessionId, userId);
  }

  async defuse(
    sessionId: string,
    userId: string,
    payload: { position: number },
  ) {
    return this.explodingCatsActions.defuse(sessionId, userId, payload);
  }

  // ========== Legacy / Compatibility Wrappers ==========

  /**
   * Start an Exploding Cats session (backward compatibility)
   */
  async startSession(
    userId: string,
    roomId?: string,
    engine?: string,
  ): Promise<StartGameSessionResult> {
    let effectiveRoomId = roomId;
    if (!effectiveRoomId) {
      const userRooms = await this.roomsService.listRooms(
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
   * Post a note to Exploding Cats history
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
   * Play Exploding Cats action card (gateway wrapper)
   */
  async playActionByRoom(userId: string, roomId: string, card: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    return this.explodingCatsActions.playActionCard(session.id, userId, {
      card,
    });
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

    return this.explodingCatsActions.playCatCombo(session.id, userId, {
      cards,
      targetPlayerId: payload.targetPlayerId,
      requestedCard: payload.desiredCard,
      selectedIndex: payload.selectedIndex,
      requestedDiscardCard: payload.requestedDiscardCard,
    });
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
    return this.explodingCatsActions.playFavor(session.id, userId, {
      targetPlayerId,
    });
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
    return this.explodingCatsActions.giveFavorCard(session.id, userId, {
      cardToGive,
    });
  }

  /**
   * See the future (gateway wrapper)
   */
  async seeTheFutureByRoom(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    const result = await this.explodingCatsActions.seeFuture(
      session.id,
      userId,
    );

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
    return this.explodingCatsActions.defuse(session.id, userId, { position });
  }

  /**
   * Play nope card - cancels the last action
   */
  async playNope(sessionId: string, userId: string) {
    return this.explodingCatsActions.playNope(sessionId, userId);
  }

  /**
   * Play nope card (gateway wrapper)
   */
  async playNopeByRoom(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    return this.explodingCatsActions.playNope(session.id, userId);
  }
}
