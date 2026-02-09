import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { GameRoomsService } from '../rooms/game-rooms.service';
import {
  GameSessionsService,
  GameSessionSummary,
} from '../sessions/game-sessions.service';
import { GameHistoryService } from '../history/game-history.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { StartGameSessionResult } from '../games.types';
import { ChatScope } from '../engines/base/game-engine.interface';
import { SeaBattleBotService } from './sea-battle-bot.service';

interface PlaceShipPayload {
  shipId: string;
  cells: { row: number; col: number }[];
}

interface AttackPayload {
  targetPlayerId: string;
  row: number;
  col: number;
}

@Injectable()
export class SeaBattleService {
  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => SeaBattleBotService))
    private readonly botService: SeaBattleBotService,
  ) {}

  private async checkAndSyncRoomStatus(session: GameSessionSummary) {
    if (session.status === 'completed') {
      await this.roomsService.updateRoomStatus(session.roomId, 'completed');
    } else {
      this.botService.checkAndPlay(session).catch((err) => {
        console.error('Error in bot turn:', err);
      });
    }
    return session;
  }

  private async emitSessionUpdate(session: GameSessionSummary) {
    await this.realtimeService.emitSessionSnapshot(
      session.roomId,
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
  }

  /**
   * Start a Sea Battle session
   * (Verified fix for single player bot mode)
   */
  async startSession(
    userId: string,
    roomId: string,
    withBots?: boolean,
  ): Promise<StartGameSessionResult> {
    console.log(
      `[SeaBattle] startSession requested by ${userId} for room ${roomId}, withBots=${withBots}`,
    );
    const room = await this.roomsService.getRoom(roomId, userId);

    if (room.hostId !== userId) {
      throw new Error('Only the host can start the game');
    }

    const participants = await this.roomsService.getRoomParticipants(roomId);
    const playerIds = [...participants];

    console.log(
      `[SeaBattle] Room has participants: ${JSON.stringify(playerIds)}`,
    );

    // If only one player, automatically add a bot to meet minimum requirements (2 players)
    // This handles both explicit bot mode and fallback for single users
    if (playerIds.length === 1) {
      console.log(`[SeaBattle] Auto-adding bot for single player session`);
      const botId = `bot-${Math.random().toString(36).substr(2, 9)}`;
      playerIds.push(botId);
    } else if (withBots) {
      const needed = 2 - playerIds.length;
      if (needed > 0) {
        for (let i = 0; i < needed; i++) {
          playerIds.push(`bot-${Math.random().toString(36).substr(2, 9)}`);
        }
      }
    }

    if (playerIds.length < 2) {
      throw new Error('Not enough players to start Sea Battle (minimum 2)');
    }

    console.log(
      `[SeaBattle] Starting session with players: ${JSON.stringify(playerIds)}`,
    );

    const session = await this.sessionsService.createSession({
      roomId,
      gameId: room.gameId,
      playerIds,
      config: { ...room.gameOptions },
    });

    await this.roomsService.updateRoomStatus(roomId, 'in_progress');
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
   * Place a ship on the board
   */
  async placeShipByRoom(
    userId: string,
    roomId: string,
    payload: PlaceShipPayload,
  ) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'placeShip',
      payload,
    });

    await this.checkAndSyncRoomStatus(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  /**
   * Confirm ship placement is complete
   */
  async confirmPlacementByRoom(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'confirmPlacement',
      payload: {},
    });

    await this.checkAndSyncRoomStatus(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  /**
   * Attack an opponent's cell
   */
  async attackByRoom(userId: string, roomId: string, payload: AttackPayload) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'attack',
      payload,
    });

    await this.checkAndSyncRoomStatus(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  /**
   * Reset ship placement
   */
  async resetPlacementByRoom(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'resetPlacement',
      payload: {},
    });

    await this.checkAndSyncRoomStatus(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  /**
   * Auto place ships for a player
   */
  async autoPlaceShipsByRoom(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'autoPlace',
      payload: {},
    });

    await this.checkAndSyncRoomStatus(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  /**
   * Post a note to Sea Battle history
   */
  async postHistoryNote(
    userId: string,
    roomId: string,
    message: string,
    scope: ChatScope,
  ) {
    // Primary mechanism is via engine action to ensure state update and realtime event
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (session) {
      const updatedSession = await this.sessionsService.executeAction({
        sessionId: session.id,
        userId,
        action: 'chat',
        payload: {
          message,
          scope,
        },
      });
      await this.emitSessionUpdate(updatedSession);
    }
  }
}
