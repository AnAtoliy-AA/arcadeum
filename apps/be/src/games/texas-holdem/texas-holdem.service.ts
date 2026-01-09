import { Injectable } from '@nestjs/common';
import { ChatScope } from '../engines/base/game-engine.interface';
import { GameRoomsService } from '../rooms/game-rooms.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GameHistoryService } from '../history/game-history.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { TexasHoldemActionsService } from '../actions/texas-holdem/texas-holdem-actions.service';
import { GameSessionSummary } from '../sessions/game-sessions.service';

@Injectable()
export class TexasHoldemService {
  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    private readonly texasHoldemActions: TexasHoldemActionsService,
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

  async fold(sessionId: string, userId: string) {
    const session = await this.texasHoldemActions.fold(sessionId, userId);
    return this.checkAndSyncRoomStatus(session);
  }

  async check(sessionId: string, userId: string) {
    const session = await this.texasHoldemActions.check(sessionId, userId);
    return this.checkAndSyncRoomStatus(session);
  }

  async call(sessionId: string, userId: string) {
    const session = await this.texasHoldemActions.call(sessionId, userId);
    return this.checkAndSyncRoomStatus(session);
  }

  async raise(sessionId: string, userId: string, payload: { amount: number }) {
    const session = await this.texasHoldemActions.raise(
      sessionId,
      userId,
      payload,
    );
    return this.checkAndSyncRoomStatus(session);
  }

  async allIn(sessionId: string, userId: string) {
    const session = await this.texasHoldemActions.allIn(sessionId, userId);
    return this.checkAndSyncRoomStatus(session);
  }

  async bet(sessionId: string, userId: string, payload: { amount: number }) {
    const session = await this.texasHoldemActions.bet(
      sessionId,
      userId,
      payload,
    );
    return this.checkAndSyncRoomStatus(session);
  }

  // ========== Legacy / Compatibility Wrappers ==========

  /**
   * Start Texas Hold'em session (backward compatibility)
   */
  async startSession(userId: string, roomId?: string, engine?: string) {
    // Reuse the same logic as Exploding Cats for starting a session
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
      config: { engine },
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
   * Texas Hold'em player action (backward compatibility)
   */
  async playerAction(
    userId: string,
    roomId: string,
    action: string,
    raiseAmount?: number,
  ) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) {
      throw new Error('Session not found');
    }
    const payload = raiseAmount ? { amount: raiseAmount } : undefined;

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      action,
      userId,
      payload,
    });

    await this.realtimeService.emitActionExecuted(
      updatedSession,
      action,
      userId,
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
    return this.checkAndSyncRoomStatus(updatedSession);
  }

  /**
   * Post a note to Texas Hold'em history
   */
  async postHistoryNote(
    userId: string,
    roomId: string,
    message: string,
    scope: ChatScope = 'all',
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
}
