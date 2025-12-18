import { Injectable } from '@nestjs/common';
import { GameRoomsService } from '../rooms/game-rooms.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GameHistoryService } from '../history/game-history.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { TexasHoldemActionsService } from '../actions/texas-holdem/texas-holdem-actions.service';

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

  async fold(sessionId: string, userId: string) {
    return this.texasHoldemActions.fold(sessionId, userId);
  }

  async check(sessionId: string, userId: string) {
    return this.texasHoldemActions.check(sessionId, userId);
  }

  async call(sessionId: string, userId: string) {
    return this.texasHoldemActions.call(sessionId, userId);
  }

  async raise(
    sessionId: string,
    userId: string,
    payload: { amount: number },
  ) {
    return this.texasHoldemActions.raise(sessionId, userId, payload);
  }

  async allIn(sessionId: string, userId: string) {
    return this.texasHoldemActions.allIn(sessionId, userId);
  }

  async bet(
    sessionId: string,
    userId: string,
    payload: { amount: number },
  ) {
    return this.texasHoldemActions.bet(sessionId, userId, payload);
  }

  // ========== Legacy / Compatibility Wrappers ==========

  /**
   * Start Texas Hold'em session (backward compatibility)
   */
  async startSession(
    userId: string,
    roomId?: string,
    engine?: string,
  ) {
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

    const playerIds = await this.roomsService.getRoomParticipants(
      effectiveRoomId,
    );

    const session = await this.sessionsService.createSession({
      roomId: effectiveRoomId,
      gameId: room.gameId,
      playerIds,
      config: { engine },
    });

    await this.roomsService.updateRoomStatus(effectiveRoomId, 'in_progress');
    this.realtimeService.emitGameStarted(room, session);

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

    this.realtimeService.emitActionExecuted(updatedSession, action, userId);
    return updatedSession;
  }

  /**
   * Post a note to Texas Hold'em history
   */
  async postHistoryNote(
    userId: string,
    roomId: string,
    message: string,
  ) {
    await this.historyService.postHistoryNote(roomId, userId, message);
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (session) {
      this.realtimeService.emitSessionSnapshot(roomId, session);
    }
  }
}
